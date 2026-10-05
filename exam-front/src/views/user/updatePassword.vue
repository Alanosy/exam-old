<template>
  <div class="item-contain">

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>修改密码</span>
      </div>
      <div class="card-body">
        <el-form ref="updatePasswordForm" :label-position="labelPosition" :model="updatePasswordForm" label-width="80px">
          <el-form-item label="原密码" :label-width="formLabelWidth">
            <el-input v-model="updatePasswordForm.originPassword" autocomplete="off" />
          </el-form-item>
          <el-form-item label="新密码" :label-width="formLabelWidth">
            <el-input v-model="updatePasswordForm.newPassword" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="确认密码" :label-width="formLabelWidth">
            <el-input v-model="updatePasswordForm.checkedPassword" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updatePassword">确认</el-button>
            <el-button @click="cancelFun">取消</el-button>
          </el-form-item>

        </el-form>
      </div>
    </el-card>
  </div>

</template>

<script>
import { changePassword } from '@/api/user'

export default {
  data() {
    return {
      labelPosition: 'right',
      updatePasswordForm: {
        originPassword: '',
        newPassword: '',
        checkedPassword: ''
      },
      formLabelWidth: '70px'
    }
  },
  methods: {
    cancelFun() {
      this.$router.push({ path: 'index' })
    },
    updatePassword() {
      const data = { originPassword: this.updatePasswordForm.originPassword,
        newPassword: this.updatePasswordForm.newPassword,
        checkedPassword: this.updatePasswordForm.checkedPassword }
      changePassword(data).then((res) => {
        if (res.code) {
          this.$message({
            type: 'success',
            message: '修改成功'
          })
          this.$router.push({ path: '/login', query: { zhi: 1 }})
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      })
    }
  }
}
</script>
<style scoped>

 /* 卡片样式 */
.item-contain {
  padding: 30px 100px 0;
  display: flex;
  justify-content: center;
  height: 60vh;
}
.box-card {
  padding: 15px;
  width: 70% !important;
}

</style>
