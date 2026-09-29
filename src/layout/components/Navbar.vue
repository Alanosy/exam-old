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
        <el-dropdown class="avatar-container" trigger="click" placement="bottom-end">
          <div class="avatar-wrapper">
            <img
              v-if="!showLetterAvatar"
              :src="displayAvatar"
              class="user-avatar"
              referrerpolicy="no-referrer"
              alt=""
              @error="onAvatarError"
            >
            <div
              v-else
              class="user-avatar user-avatar--letter"
              :style="{ background: letterBg }"
            >
              {{ surnameLetter }}
            </div>
            <div v-if="!isMobile" class="user-meta">
              <span class="user-name">{{ displayName }}</span>
            </div>
            <i class="el-icon-arrow-down avatar-caret" />
          </div>
          <el-dropdown-menu slot="dropdown" class="navbar-user-dropdown">
            <router-link to="/myself">
              <el-dropdown-item>
                <i class="el-icon-user" />
                <span>个人中心</span>
              </el-dropdown-item>
            </router-link>
            <router-link to="/change-password">
              <el-dropdown-item>
                <i class="el-icon-lock" />
                <span>修改密码</span>
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item class="logout-item" @click.native="logout">
              <i class="el-icon-switch-button" />
              <span>退出登录</span>
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
      <div class="tags-list">
        <template v-for="(item,index) in tags">
          <el-tag
            v-if="item.title"
            :key="item.fullPath || item.path"
            :closable="!isHomeTag(item)"
            disable-transitions
            :class="{ active: item.checked }"
            @click="$router.push(item.fullPath || item.path)"
            @close="handleTagClose(item)"
          >
            {{ item.title }}
          </el-tag>
        </template>
      </div>
      <el-button
        v-if="canCloseAll"
        class="tags-close-all"
        type="text"
        size="mini"
        icon="el-icon-circle-close"
        @click="closeAllTags"
      >全部关闭</el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getToken, getRole } from '@/utils/auth'
import { parseJwt } from '@/utils/jwtUtils'
import { resolveAvatar, getDefaultAvatarByRole, hasCustomAvatar } from '@/utils/avatar'

const LETTER_COLORS = [
  '#0f766e', '#0d9488', '#0891b2', '#0284c7',
  '#4f46e5', '#7c3aed', '#c026d3', '#db2777',
  '#ea580c', '#ca8a04'
]

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      user: {},
      forceRoleDefault: false,
      roleDefaultFailed: false
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'name', 'tags']),
    roleId() {
      if (this.user && this.user.roleId != null) {
        return this.user.roleId
      }
      return getRole()
    },
    avatarSynced() {
      return !!this.$store.state.user.avatarSynced
    },
    rawAvatar() {
      // 已与服务端同步后（含恢复默认清空），以 Vuex 为准，不再读 JWT 里的旧头像
      if (this.avatarSynced) {
        return this.avatar || ''
      }
      return (this.user && this.user.avatar) || this.avatar || ''
    },
    displayAvatar() {
      if (this.forceRoleDefault || !hasCustomAvatar(this.rawAvatar)) {
        return getDefaultAvatarByRole(this.roleId)
      }
      return resolveAvatar(this.rawAvatar, this.roleId)
    },
    showLetterAvatar() {
      return this.roleDefaultFailed
    },
    canCloseAll() {
      return (this.tags || []).filter(t => t && t.title && !this.isHomeTag(t)).length > 0
    },
    displayName() {
      return this.name ||
        (this.user && (this.user.realName || this.user.userName)) ||
        '用户'
    },
    surnameLetter() {
      const name = String(this.displayName || '').trim()
      return name ? name.charAt(0) : '用'
    },
    letterBg() {
      const name = String(this.displayName || '')
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      return LETTER_COLORS[Math.abs(hash) % LETTER_COLORS.length]
    }
  },
  watch: {
    rawAvatar() {
      this.forceRoleDefault = false
      this.roleDefaultFailed = false
    },
    avatarSynced(val) {
      if (val && this.user) {
        this.user = { ...this.user, avatar: this.avatar || '' }
      }
    }
  },
  created() {
    this.decode()
    this.loadLatestAvatar()
  },
  methods: {
    isHomeTag(tag) {
      if (!tag) return false
      return tag.title === '主页' || tag.path === '/index' || tag.path === '/dashboard'
    },
    closeAllTags() {
      this.$store.commit('menu/CLOSE_ALL_TAGS')
      if (this.$route.path !== '/index') {
        this.$router.push('/index')
      }
    },
    onAvatarError() {
      if (!this.forceRoleDefault && hasCustomAvatar(this.rawAvatar)) {
        this.forceRoleDefault = true
        return
      }
      this.roleDefaultFailed = true
    },
    handleTagClose(item) {
      const closeKey = item.fullPath || item.path
      this.$store.commit('menu/REMOVE_TAG', item)
      if (this.$route.fullPath === closeKey) {
        const tags = this.$store.state.menu.tags
        const fallback = tags[tags.length - 1]
        if (fallback) {
          this.$router.push(fallback.fullPath || fallback.path)
        }
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
  background-color: #f4f7f6;
  border-color: #d7e3df;
  display: inline-block;
  height: 30px;
  padding: 0 12px;
  line-height: 28px;
  margin-left: 8px;
  font-size: 12px;
  color: #3d524e;
  border-width: 1px;
  border-style: solid;
  border-radius: 10px;
  box-sizing: border-box;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #99d5c8;
    color: #0f766e;
  }
}

.active {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.28);
}

.tags-bar {
  width: 100%;
  height: 42px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(10px);
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 10px 0 4px;
  border-top: 1px solid #eaf2ef;
  gap: 8px;
}

.tags-list {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    height: 0;
  }
}

.tags-close-all {
  flex-shrink: 0;
  padding: 4px 8px !important;
  font-size: 12px !important;
  color: #5b6f6c !important;
  border-radius: 8px !important;

  &:hover {
    color: #0f766e !important;
    background: rgba(15, 118, 110, 0.08) !important;
  }
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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(215, 227, 223, 0.95);
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
      background: rgba(15, 118, 110, 0.08);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    margin-left: auto;
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .avatar-container {
      margin-right: 16px;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 10px 4px 4px;
        border-radius: 999px;
        cursor: pointer;
        transition: background 0.2s ease, box-shadow 0.2s ease;
        outline: none;

        &:hover {
          background: rgba(15, 118, 110, 0.08);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #d7e3df;
          object-fit: cover;
          flex-shrink: 0;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:hover {
            border-color: #5eead4;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.15);
          }
        }

        .user-avatar--letter {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1;
          user-select: none;
          border-color: transparent;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
          max-width: 120px;
          line-height: 1.2;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #102a2a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .avatar-caret {
          font-size: 12px;
          color: #7d9590;
          transition: transform 0.2s ease;
        }
      }
    }
  }
}
</style>

<!-- dropdown 挂到 body，需非 scoped -->
<style lang="scss">
.navbar-user-dropdown {
  min-width: 168px !important;
  padding: 8px !important;
  border-radius: 14px !important;
  border: 1px solid #d7e3df !important;
  box-shadow: 0 12px 32px rgba(16, 42, 42, 0.12) !important;
  margin-top: 8px !important;

  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 42px;
    line-height: 42px;
    padding: 0 14px !important;
    font-size: 14px;
    color: #3d524e;
    border-radius: 10px;
    margin: 2px 0;

    i {
      font-size: 16px;
      color: #0f766e;
      width: 18px;
      text-align: center;
      margin-right: 0;
    }

    &:hover {
      background: rgba(15, 118, 110, 0.1) !important;
      color: #0f766e;
    }

    &.logout-item {
      position: relative;
      margin-top: 8px;
      color: #b45353;

      &::before {
        content: '';
        position: absolute;
        top: -5px;
        left: 8px;
        right: 8px;
        height: 1px;
        background: #e8efec;
        pointer-events: none;
      }

      i {
        color: #b45353;
        margin-right: 0;
      }

      &:hover {
        background: rgba(180, 83, 83, 0.1) !important;
        color: #9f3a3a;

        i {
          color: #9f3a3a;
        }
      }
    }
  }

  .popper__arrow {
    display: none;
  }
}
</style>
