<!--
 * @Author: st 2946594574@qq.com
 * @Date: 2024-03-04 10:55:05
 * @LastEditors: yangiiiiii 14122140+yangiiiiiii@user.noreply.gitee.com
 * @LastEditTime: 2024-05-20 09:07:35
 * @FilePath: \com-project\src\views\login\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="login-container">
    <el-form
      ref="registerForm"
      :model="registerForm"
      :rules="loginRules"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">注册</h3>
      </div>

      <el-form-item prop="userName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="registerForm.userName"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
        />
      </el-form-item>
      <el-form-item prop="realName">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="realName"
          v-model="registerForm.realName"
          placeholder="真实姓名"
          name="realName"
          type="text"
          tabindex="2"
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
          v-model="registerForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="3"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-form-item prop="checkedPassword">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input
          :key="checkedPasswordType"
          ref="checkedPassword"
          v-model="registerForm.checkedPassword"
          :type="checkedPasswordType"
          placeholder="确认密码"
          name="checkedPassword"
          tabindex="4"
          auto-complete="on"
        />
        <span class="show-pwd" @click="showPwd2">
          <svg-icon
            :icon-class="checkedPasswordType === 'password' ? 'eye' : 'eye-open'"
          />
        </span>
      </el-form-item>

      <div style="display: flex">
        <el-form-item prop="code">
          <span class="svg-container">
            <svg-icon icon-class="code" />
          </span>
          <el-input
            ref="code"
            v-model="registerForm.code"
            style="width: 300px"
            placeholder="验证码"
            name="code"
            type="text"
            tabindex="5"
            auto-complete="off"
            @keyup.enter.native="registerFn"
          />
        </el-form-item>
        <img
          ref="captchaImg"
          src="/api/auths/captcha"
          style="margin-left: 20px; height: 47px"
          alt=""
          @click="getVerify"
        >
      </div>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 20px;
        "
      >
        <router-link style="color: #66b1ff" to="/login"> 登录 </router-link>
      </div>

      <el-button
        :loading="loading"
        type="primary"
        style="width: 100%; margin-bottom: 30px"
        @click="registerFn"
      >注册</el-button>
    </el-form>
        <!-- 添加备案信息 -->
    <div v-if="icpNumber" class="icp-info">
      <a :href="icpLink" target="_blank">{{ icpNumber }}</a>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import { verifyCode, register } from '@/api/user'
import { Message } from 'element-ui'
import { Encrypt } from '@/utils/Secret'
export default {
  name: 'Register',
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
    const validateRealName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入真实姓名'))
      } else {
        callback()
      }
    }
    const validateCheckedPassword = (rule, value, callback) => {
      if (value  != this.registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    return {
      icpNumber: process.env.VUE_APP_ICP_NUMBER,
      icpLink: process.env.VUE_APP_ICP_LINK,
      registerForm: {
        userName: '',
        password: '',
        realName: '',
        checkedPassword: '',
        code: ''
      },
      loginRules: {
        userName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        realName: [{ required: true, trigger: 'blur', validator: validateRealName }],
        checkedPassword: [{ required: true, trigger: 'blur', validator: validateCheckedPassword }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      loading: false,
      passwordType: 'password',
      checkedPasswordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    // this.getEmail()
  },
  methods: {
    registerFn() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          verifyCode(this.registerForm.code).then((res) => {
            if (res.code) {
              const registerData = {
                userName: this.registerForm.userName,
                realName: this.registerForm.realName,
                password: Encrypt(this.registerForm.password),
                checkedPassword: Encrypt(this.registerForm.checkedPassword)
              }
              register(registerData).then((res2) => {
                if (res2.code) {
                  Message({
                    message: res2.msg,
                    type: 'success',
                    duration: 5 * 1000
                  })
                  this.$router.push({ path: '/login' })
                } else {
                  this.getVerify()
                  Message({
                    message: res2.msg,
                    type: 'error',
                    duration: 5 * 1000
                  })
                }
              }).catch(() => {
                this.getVerify()
                Message({
                  message: '注册失败，请重试',
                  type: 'error',
                  duration: 5 * 1000
                })
              })
            } else {
              this.getVerify()
              Message({
                message: res.msg || '验证码验证失败',
                type: 'error',
                duration: 5 * 1000
              })
            }
          }).catch(() => {
            this.getVerify()
            Message({
              message: '验证码验证失败',
              type: 'error',
              duration: 5 * 1000
            })
          })
        } else {
          Message({
            message: '请填写完整的注册信息',
            type: 'warning',
            duration: 5 * 1000
          })
        }
      })
    },
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
    showPwd2() {
      if (this.checkedPasswordType === 'password') {
        this.checkedPasswordType = ''
      } else {
        this.checkedPasswordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.checkedPassword.focus()
      })
    }
  }
}
</script>

<style lang="scss">
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .but {
    width: 220px;
    height: 39px;
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    /* border: 1px solid; */
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    font-weight: 500;
    text-align: center;
    font-family: sans-serif;
    padding-top: 10px;
  }
  .icp-info {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    
    a {
      color: $dark_gray;
      font-size: 12px;
      text-decoration: none;
      
      &:hover {
        color: $light_gray;
        text-decoration: underline;
      }
    }
  }
}
</style>
