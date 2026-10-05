<template>
  <div class="navbar">
    <div style="width:100%;height:66px;box-shadow: rgb(0 21 41 / 9%) 0px 1px 4px;}">
      <hamburger
        :is-active="sidebar.opened"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />

      <breadcrumb class="breadcrumb-container" />

      <div class="right-menu">
        <el-dropdown class="avatar-container" trigger="click">
          <div class="avatar-wrapper">
            <img :src="user.avatar" class="user-avatar">
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
      style="
        width: 100%;
        height: 45px;
        background-color: write;
        overflow: hidden;
        display: flex;
        align-items: center;
      "
    >
      <template v-for="(item,index) in tags">
        <el-tag
          v-if="item.title"
          :key="index"
          closable
          disable-transitions
          style="border: 1px solid #cacaca"
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
    ...mapGetters(['sidebar', 'avatar', 'tags'])
  },
  created() {
    this.decode()
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
  background-color: #ffffff;
  border-color: #cacaca;
  display: inline-block;
  height: 32px;
  padding: 0 10px;
  line-height: 30px;
  margin-left: 5px;
  font-size: 12px;
  color: #000000;
  border-width: 1.5px;
  border-style: solid;
  border-radius: 3px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  white-space: nowrap;
}

.active {
  background-color: #58b289;
  color: rgb(255, 255, 255);
}

.navbar {
  height: 110px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 21 41 / 16%);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

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
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
