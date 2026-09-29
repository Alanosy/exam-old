<template>
  <transition name="fade">
    <button
      v-show="visible"
      type="button"
      class="back-to-top"
      :style="{ right: rightOffset + 'px' }"
      title="回到顶部"
      @click="scrollToTop"
    >
      <i class="el-icon-top" />
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  props: {
    threshold: {
      type: Number,
      default: 200
    },
    rightOffset: {
      type: Number,
      default: 32
    }
  },
  data() {
    return {
      visible: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.visible = window.pageYOffset > this.threshold
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: 32px;
  bottom: 40px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  color: #fff;
  background: #0f766e;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
  cursor: pointer;
  z-index: 2100;
}
.back-to-top:hover {
  background: #115e59;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
