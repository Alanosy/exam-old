export default {
  computed: {
    isMobile() {
      return this.$store.state.app.device === 'mobile'
    },
    paginationLayout() {
      return this.isMobile
        ? 'total, prev, next'
        : 'total, sizes, prev, pager, next, jumper'
    }
  }
}
