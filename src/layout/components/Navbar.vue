<template>
  <div class="navbar">
    <div class="navbar-inner">
      <hamburger
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />

      <breadcrumb v-if="!isMobile" class="breadcrumb-container" />

      <div class="right-menu">
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <img :src="displayAvatar" class="user-avatar" referrerpolicy="no-referrer">
            <i class="el-icon-caret-bottom" />
          </div>
          <el-dropdown-menu slot="dropdown" class="user-dropdown">
            <router-link to="/myself">
              <el-dropdown-item> 个人中心 </el-dropdown-item>
            </router-link>
            <router-link to="/change-password">
              <el-dropdown-item> 修改密码</el-dropdown-item>
            </router-link>

            <el-dropdown-item divided @click.native="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- tags -->
    <div
      v-if="!isMobile"
      class="tags-bar"
    >
      <template v-for="(item,index) in tags">
        <el-tag
          v-if="item.title"
          :key="index"
          closable
          disable-transitions
          :class="{ active: item.checked }"
          @click="$router.push(item.path)"
          @close="handleTagClose(item)"
        >
          {{ item.title }}
        </el-tag>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getToken } from '@/utils/auth'
import { parseJwt } from '@/utils/jwtUtils'
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      user: {}

    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'tags']),
    displayAvatar() {
      return this.avatar || (this.user && this.user.avatar) || ''
    }
  },
  created() {
    this.decode()
    this.loadLatestAvatar()
  },
  methods: {
    handleTagClose(item) {
      if (this.$route.path === item.path) {
        this.$store.commit('menu/REMOVE_TAG', item)
        const tags = this.$store.state.menu.tags
        if (tags.length > 0) {
          this.$router.push(tags[tags.length - 1].path).then(() => {
            window.location.reload()
          })
        }
      } else {
        this.$store.commit('menu/REMOVE_TAG', item)
      }
    },
    decode() {
      const token = getToken()
      const user = parseJwt(token)
      this.user = JSON.parse(user.userInfo)
    },
    async loadLatestAvatar() {
      try {
        await this.$store.dispatch('user/getInfo')
      } catch (e) {
        // 接口失败时仍使用 token 中的头像
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$store.dispatch('logoutUser')
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login`)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-tag {
  background-color: #f8fafc;
  border-color: #e2e8f0;
  display: inline-block;
  height: 30px;
  padding: 0 12px;
  line-height: 28px;
  margin-left: 8px;
  font-size: 12px;
  color: #475569;
  border-width: 1px;
  border-style: solid;
  border-radius: 999px;
  box-sizing: border-box;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #99f6e4;
    color: #0f766e;
  }
}

.active {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.28);
}

.tags-bar {
  width: 100%;
  height: 42px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 8px 0 4px;
  border-top: 1px solid #f1f5f9;
}

.navbar-inner {
  width: 100%;
  height: 58px;
  display: flex;
  align-items: center;
}

.navbar {
  height: 100px;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);

  .hamburger-container {
    line-height: 58px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;
    border-radius: 10px;
    margin-left: 6px;

    &:hover {
      background: rgba(13, 148, 136, 0.08);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    margin-left: auto;
    height: 100%;
    line-height: 58px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 18px;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          object-fit: cover;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            border-color: #5eead4;
            box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
          }
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          margin-left: 6px;
          font-size: 12px;
          color: #94a3b8;
        }
      }
    }
  }
}
</style>
