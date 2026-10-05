<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
      </div>
      <app-main />
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import routes from '@/router'
export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    AppMain
  },
  mixins: [ResizeMixin],
  data() {
    return {

    }
  },
  computed: {
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  created() {
    this.menuList = routes.options.routes

    this.roles = window.localStorage.getItem('roles')

    this.menuList.forEach((element) => {
      if (
        element.children &&
        element.children[0] &&
        element.children[0].meta &&
        element.children[0].meta.roles
      ) {
        const roleKey = localStorage.getItem('roles')
        let isVisible = false
        element.children.forEach((item) => {
          item.meta.roles.forEach((role) => {
            if (role.startsWith(roleKey)) {
              isVisible = true
              // 一旦找到匹配项，可以提前结束循环，无需继续检查其他项
              return
            }
          })
        }
        )
        element.children.forEach((item) => {
          item.meta.visible = isVisible
        }
        )
        // 循环结束后根据isVisible的值设置visiable
        // element.children[0].meta.visible = isVisible
      }
    })
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
@use "~@/styles/mixin.scss" as mixins;
@use "~@/styles/variables.scss" as vars;

.app-wrapper {
  @include mixins.clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{vars.$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
