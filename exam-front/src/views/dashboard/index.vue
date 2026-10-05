
<template>
  <div>
    <div>
      <com-admin v-if="url == 0" />
      <com-student v-else-if="url == 2" />
    </div>
  </div>
</template>
<script>
import comAdmin from './rolePage/adminAndTeacher.vue'
import comStudent from './rolePage/student.vue'
export default {
  components: {
    comAdmin,
    comStudent
  },
  data() {
    return {
      url: 0

    }
  },
  created() {
    // this.url = this.$route.query.url;
    const roles = localStorage.getItem('roles')
    switch (roles) {
      case 'admin': {
        this.url = 0
        break
      }
      case 'teacher': {
        this.url = 0
        break
      }
      case 'student': {
        this.url = 2
        break
      }
    }
  }

}
</script>
<style scoped>

</style>
