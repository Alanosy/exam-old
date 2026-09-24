<!--
 * @Author: st 2946594574@qq.com
 * @Date: 2024-03-04 10:55:05
 * @LastEditors: yangiiiiii 14122140+yangiiiiiii@user.noreply.gitee.com
 * @LastEditTime: 2024-05-16 15:13:43
 * @FilePath: \com-project\src\views\login\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="login-container">
    <div class="login-atmosphere" aria-hidden="true">
      <span class="orb orb-a" />
      <span class="orb orb-b" />
      <span class="orb orb-c" />
      <span class="grid-fade" />
    </div>

    <div class="login-shell">
      <aside class="login-brand">
        <p class="brand-kicker">Online Exam</p>
        <h1 class="brand-title">校园在线考试系统</h1>
        <p class="brand-desc">流畅答题 · 即时反馈 · 学习更轻松</p>
      </aside>

      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <div class="title-container">
          <h3 class="title">欢迎登录</h3>
          <p class="subtitle">请输入账号信息进入系统</p>
        </div>

        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="用户名"
            name="username"
            type="text"
            tabindex="1"
            auto-complete="on"
          />
        </el-form-item>

        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            auto-complete="on"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>

        <div class="captcha-row">
          <el-form-item prop="code" class="captcha-item">
            <span class="svg-container">
              <svg-icon icon-class="code" />
            </span>
            <el-input
              ref="codeInput"
              v-model="loginForm.code"
              placeholder="验证码"
              name="code"
              type="text"
              tabindex="3"
              auto-complete="off"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
          <img
            ref="captchaImg"
            class="captcha-img"
            src="/api/auths/captcha"
            alt=""
            @click="getVerify"
          >
        </div>
        <div
          v-if="enableRegister"
          class="form-extra"
        >
          <router-link class="link" to="/register">立即注册</router-link>
        </div>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="submit-btn"
            @click.native.prevent="handleLogin"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="icpNumber" class="icp-info">
      <a :href="icpLink" target="_blank">{{ icpNumber }}</a>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { getTokenInfo } from '@/utils/jwtUtils'
import { verifyCode } from '@/api/user'
import { Encrypt } from '@/utils/Secret'
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        code: ''
      },
      enableRegister: process.env.VUE_APP_ENABLE_REGISTER === 'true',
      icpNumber: process.env.VUE_APP_ICP_NUMBER,
      icpLink: process.env.VUE_APP_ICP_LINK,
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
      },
      loading: false,
      passwordType: 'password'
    }
  },
  computed: {
    redirect() {
      return this.$route.query.redirect || '/index'
    }
  },
  created() {
    // this.getEmail()
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.username.focus()
    })
  },
  methods: {
    getVerify() {
      this.$refs.captchaImg.src = `/api/auths/captcha?${Math.random()}`
    },

    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      if (this.loading) {
        return
      }
      this.$refs.loginForm.validate(async(valid) => {
        if (!valid) {
          return
        }
        this.loading = true
        try {
          const res = await verifyCode(this.loginForm.code)
          if (!res || res.code !== 1) {
            return
          }
          await this.$store.dispatch('user/login', {
            username: this.loginForm.username,
            password: Encrypt(this.loginForm.password)
          })
          this.$store.commit('menu/CLOSE_SIDEBAR')
          const userInfo = getTokenInfo()
          this.$store.dispatch('loginUser', { id: userInfo.id })
          this.$router.push(this.redirect || '/index')
        } catch (e) {
          this.loginForm.code = ''
          this.getVerify()
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss">
$field-bg: #f8fafc;
$text: #0f172a;
$muted: #64748b;
$primary: #0d9488;

.login-container {
  .el-input {
    display: block;
    flex: 1;
    min-width: 0;
    height: 48px;
    width: auto;

    input {
      background: transparent;
      border: 0;
      -webkit-appearance: none;
      border-radius: 0;
      padding: 12px 8px 12px 4px;
      color: $text;
      height: 48px;
      caret-color: $primary;
      font-size: 15px;

      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $field-bg inset !important;
        -webkit-text-fill-color: $text !important;
      }
    }
  }

  .svg-container {
    flex-shrink: 0;
  }

  .el-form-item {
    border: 1px solid #e2e8f0;
    background: $field-bg;
    border-radius: 12px;
    margin-bottom: 18px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover,
    &.is-focus {
      border-color: rgba(13, 148, 136, 0.45);
      box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
    }

    .el-form-item__content {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      line-height: normal;
    }

    .el-form-item__error {
      padding-top: 6px;
      left: 12px;
    }
  }

  /* 登录按钮所在表单项去掉输入框样式 */
  .el-form-item:last-child {
    border: none;
    background: transparent;
    box-shadow: none;
    margin-bottom: 0;

    &:hover {
      border: none;
      box-shadow: none;
    }
  }

  .captcha-row {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 10px;
    margin-bottom: 18px;

    .captcha-item {
      flex: 1;
      min-width: 0;
      margin-bottom: 0;
    }

    .captcha-img {
      margin-left: 0;
      height: 50px;
      width: auto;
      max-width: 120px;
      flex-shrink: 0;
      object-fit: contain;
      cursor: pointer;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #fff;
    }
  }

  .el-button--primary {
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    border: none;
    border-radius: 12px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.04em;
    box-shadow: 0 10px 24px rgba(13, 148, 136, 0.28);

    &:hover,
    &:focus {
      background: linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%);
    }
  }
}
</style>

<style lang="scss" scoped>
$primary: #0d9488;
$muted: #64748b;

.login-container {
  position: relative;
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 56px;
  background:
    radial-gradient(ellipse 80% 60% at 10% 20%, rgba(45, 212, 191, 0.22), transparent 55%),
    radial-gradient(ellipse 70% 50% at 90% 10%, rgba(56, 189, 248, 0.18), transparent 50%),
    radial-gradient(ellipse 60% 40% at 70% 90%, rgba(13, 148, 136, 0.16), transparent 45%),
    linear-gradient(160deg, #ecfeff 0%, #f0f9ff 42%, #f8fafc 100%);
}

.login-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.55;
  animation: float 14s ease-in-out infinite;
}

.orb-a {
  width: 280px;
  height: 280px;
  left: -60px;
  top: 12%;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.55), transparent 70%);
}

.orb-b {
  width: 220px;
  height: 220px;
  right: 8%;
  top: 8%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.45), transparent 70%);
  animation-delay: -4s;
}

.orb-c {
  width: 320px;
  height: 320px;
  right: -80px;
  bottom: -40px;
  background: radial-gradient(circle, rgba(13, 148, 136, 0.35), transparent 70%);
  animation-delay: -8s;
}

.grid-fade {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%);
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-18px) scale(1.04); }
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 0;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 24px 48px rgba(15, 23, 42, 0.1);
  overflow: hidden;
  animation: shell-in 0.55s ease both;
}

@keyframes shell-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.login-brand {
  padding: 48px 40px;
  background:
    linear-gradient(160deg, rgba(15, 118, 110, 0.95) 0%, rgba(8, 47, 73, 0.92) 100%);
  color: #ecfeff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 480px;
}

.brand-kicker {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(204, 251, 241, 0.75);
}

.brand-title {
  margin: 0;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.brand-desc {
  margin: 18px 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(204, 251, 241, 0.82);
  max-width: 16em;
}

.login-form {
  position: relative;
  width: 100%;
  padding: 48px 40px 40px;
  margin: 0;
  box-sizing: border-box;
}

.captcha-row {
  display: flex;
  align-items: center;
}

.captcha-item {
  flex: 1;
  min-width: 0;
}

.captcha-img {
  height: 50px;
  flex-shrink: 0;
  cursor: pointer;
}

.svg-container {
  padding: 6px 8px 6px 14px;
  color: $muted;
  vertical-align: middle;
  width: 30px;
  display: inline-block;
}

.title-container {
  margin-bottom: 28px;

  .title {
    margin: 0;
    font-size: 26px;
    color: #0f172a;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: $muted;
  }
}

.show-pwd {
  position: absolute;
  right: 14px;
  top: 8px;
  font-size: 16px;
  color: $muted;
  cursor: pointer;
  user-select: none;
}

.form-extra {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin: -4px 0 16px;
}

.link {
  color: $primary;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    color: #0f766e;
  }
}

.submit-btn {
  width: 100%;
}

.icp-info {
  position: absolute;
  bottom: 16px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 1;

  a {
    color: $muted;
    font-size: 12px;
    text-decoration: none;

    &:hover {
      color: #0f172a;
      text-decoration: underline;
    }
  }
}

@media screen and (max-width: 860px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    min-height: auto;
    padding: 28px 24px 20px;
  }

  .brand-title {
    font-size: 26px;
  }

  .brand-desc {
    margin-top: 10px;
    max-width: none;
  }

  .login-form {
    padding: 28px 24px 32px;
  }
}
</style>
