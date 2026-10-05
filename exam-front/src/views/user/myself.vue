<template>
  <div class="item-contain">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>个人信息</span>
        <el-button
          v-if="data.gradeName == null && !isAdmin"
          style="float: right; padding: 3px 0; margin-right: 15px"
          type="text"
          size="mini"
          @click="addClassBt"
        >
          加入班级</el-button>
        <el-button
          v-if="data.gradeName != null"
          size="mini"
          style="float: right; padding: 3px 0; margin-right: 15px"
          type="text"
          @click="exitGrade"
        >
          退出班级</el-button>
        <el-button
          type="text"
          size="mini"
          style="float: right; padding: 3px 0; margin-right: 15px"
          @click="fileDialogVisible = true"
        >编辑头像</el-button>
      </div>
      <div class="card-body">
        <div class="left">
          <div>
            <span>用户名:</span>
            <span> {{ data.userName }}</span>
          </div>
          <div>
            <span>真实姓名:</span>
            <span> {{ data.realName }}</span>
          </div>
          <div v-if="!isAdmin">
            <span>班级:</span>
            <span> {{ data.gradeName?data.gradeName:"暂未加入班级" }} </span>
          </div>
        </div>
        <el-dialog
          width="400px"
          :show-close="false"
          :close-on-click-modal="false"
          title="上传头像"
          :visible.sync="fileDialogVisible"
        >
          <el-upload
            class="upload-demo"
            drag
            action="xxxxxx"
            multiple
            :limit="1"
            accept="png, jpg, jpeg, bmp"
            :auto-upload="false"
            :on-remove="handleRemove"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <div slot="tip" class="el-upload__tip">
              只能上传"png", "jpg", "jpeg",
              "bmp"文件，且不超过2MB。注:右上角头像，重新登录更新
            </div>
          </el-upload>
          <div slot="footer" class="dialog-footer">
            <el-button @click="fileDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="importAvatar">确 定</el-button>
          </div>
        </el-dialog>

        <el-dialog title="加入班级" :visible.sync="addClassDialogVisible">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form :model="form">
                <el-form-item label="班级口令">
                  <el-input v-model="form.code" autocomplete="off" />
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer">
            <el-button
              @click="addClassDialogVisible = false"
            >取 消</el-button>
            <el-button type="primary" @click="addClass">确 定</el-button>
          </div>
        </el-dialog>
        <div class="right">
          <img
            style="
              width: 150px;
              height: 150px;
              border-radius: 200px;
            "
            :src="data.avatar"
            alt=""
          >
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { exitUserGrade, getInfo, userAddClass, uploadAvatar } from '@/api/user'
import { trackPresence } from '@/api/user'
import { setToken } from '@/utils/auth'
import { getTokenInfo, getRole } from '@/utils/jwtUtils'
export default {
  data() {
    return {
      fileDialogVisible: false,
      fileList: [],
      data: {},
      form: {
        code: ''
      },
      isAdmin: false,
      addClassDialogVisible: false,
      hasFiles: false
    }
  },
  created() {
    // 获取角色判断是否是教师和管理员
    const role = getRole()
    if (role === 3 || role === 2) {
      this.isAdmin = true
    }
    this.getInfoFun()
  },
  methods: {
    // 退出班级逻辑
    exitGrade() {
      this.$confirm('退出班级, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          exitUserGrade()
            .then((res) => {
              if (res.code) {
                this.getInfoFun()
                this.$message({
                  type: 'success',
                  message: '退出成功!'
                })
              } else {
                this.$message({
                  type: 'error',
                  message: res.msg
                })
              }
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '已取消退出'
              })
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出'
          })
        })
    },
    // 获取个人系信息
    async getInfoFun() {
      const res = await getInfo()
      if (res.code) {
        this.data = res.data
      } else {
        this.$message.error('获取个人信息失败')
      }
    },
    // 修改文件逻辑
    handleFileChange(file, fileList) {
      this.fileList = fileList // 收集文件信息
    },
    // 移除文件处理方法
    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false
      }
    },
    // 上传文件逻辑
    importAvatar() {
      if (this.fileList.length > 0) {
        const formData = new FormData() // 创建FormData对象
        formData.append('file', this.fileList[0].raw) // 添加文件到formData
        uploadAvatar(formData)
          .then((res) => {
            if (res.code) {
              this.getInfoFun()
              this.$message.success('文件上传成功！')
              this.fileDialogVisible = false // 关闭对话框
              // 可以在这里处理成功后的逻辑，如刷新数据等
            }
          })
          .catch((error) => {
            console.error('文件上传失败：', error)
            this.$message.error('文件上传失败！')
          })
      } else {
        this.$message.warning('请选择文件后再上传！')
      }
    },
    // 添加班级按钮
    addClassBt() {
      this.addClassDialogVisible = true
    },
    // 添加班级逻辑
    addClass() {
      const params = { code: this.form.code }
      userAddClass(params).then((res) => {
        if (res.code) {
          this.addClassDialogVisible = false
          this.getInfoFun()
          this.$message({
            type: 'success',
            message: '加入成功'
          })
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
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.card-body {
  height: 29em;
  display: flex;
  justify-content: space-evenly;
}
.left {
  display: flex;
  flex-direction: column;
  width: 380px;
  height: 100%;
  padding: 60px;
  border-right: 1px solid rgb(228, 232, 235);
  div {
    margin-bottom: 40px;
    font-size: 14px Base;
    span {
      display: inline-block;
      width: 115px;
    }
  }
}
.right{
  padding: 60px;
}
</style>
