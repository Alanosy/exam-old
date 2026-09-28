<template>
  <div id="app" :class="{ 'is-mobile': isMobile }">
    <router-view />
  </div>
</template>

<script>
import ResizeMixin from '@/layout/mixin/ResizeHandler'

export default {
  name: 'App',
  mixins: [ResizeMixin],
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    device() {
      return this.$store.state.app.device
    },
    sidebar() {
      return this.$store.state.app.sidebar
    }
  },
  created() {
    const rect = document.body.getBoundingClientRect()
    if (rect.width - 1 < 992) {
      this.$store.dispatch('app/toggleDevice', 'mobile')
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: true })
    }
  },
  watch: {
    isMobile: {
      immediate: true,
      handler(val) {
        document.body.classList.toggle('is-mobile', val)
      }
    }
  }
}
</script>
