<template>
  <span style="color: #ff0000; font-weight: 700">{{ min }}分钟{{ sec }}秒</span>
</template>

<script>
export default {
  name: 'ExamTimer',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: Number
  },
  data() {
    return {
      leftSeconds: 0,
      min: '00',
      sec: '00',
      timer: null
    }
  },
  watch: {
    value: {
      handler() {
        this.leftSeconds = this.value
        // 清除之前的定时器
        if (this.timer) {
          clearInterval(this.timer)
        }
        this.startCountdown()
      }
    }
  },
  created() {
    this.leftSeconds = this.value
    this.startCountdown()
  },
  beforeDestroy() {
    // 组件销毁时清除定时器
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    startCountdown() {
      // 使用setInterval替换setTimeout
      this.timer = setInterval(() => {
        // 倒计时结束了
        if (this.leftSeconds < 0) {
          clearInterval(this.timer)
          this.$emit('timeout')
          return
        }
        // 时
        const min = parseInt(this.leftSeconds / 60)
        const sec = parseInt(this.leftSeconds % 60)
        this.min = min > 9? min : '0' + min
        this.sec = sec > 9? sec : '0' + sec
        this.leftSeconds -= 1
      }, 1000)
    }
  }
}
</script>