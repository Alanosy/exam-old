<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <span class="sidebar-mark">考</span>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <span class="sidebar-mark">考</span>
        <h1 class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: process.env.VUE_APP_TITLE || '校园在线考试系统'
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 0.6s ease;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 64px;
  line-height: 64px;
  background: transparent;
  text-align: left;
  overflow: hidden;
  padding: 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;

    & .sidebar-mark {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      font-size: 15px;
      font-weight: 700;
      color: #042f2e;
      background: linear-gradient(135deg, #5eead4, #14b8a6);
      box-shadow: 0 6px 14px rgba(20, 184, 166, 0.35);
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #f8fafc;
      font-weight: 600;
      line-height: 1.2;
      font-size: 14px;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &.collapse {
    padding: 0;
    text-align: center;

    .sidebar-logo-link {
      justify-content: center;
    }

    .sidebar-mark {
      margin-right: 0;
    }
  }
}
</style>
