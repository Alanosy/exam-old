<template>
  <div class="app-container">
    <!-- 筛选栏 -->
    <el-form :inline="true" v-model="searchForm" class="demo-form-inline">
      <el-form-item label="真实姓名">
        <el-input v-model="searchForm.searchRealName" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item label="班级">
        <ClassSelect v-model="searchForm.searchClass" :is-multiple="false" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchUser">查询</el-button>
        <el-button type="primary" @click="addUserDiologVisible = true">新增</el-button>
        <el-button type="primary" @click="fileDialogVisible = true">导入</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="data.records" border fit highlight-current-row :header-cell-style="{
      background: '#f2f3f4',
      color: '#555',
      'font-weight': 'bold',
      'line-height': '32px',
    }">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="序号" align="center" width="80px">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="userName" label="用户名" align="center" />
      <el-table-column prop="realName" label="真实姓名" align="center" />
      <el-table-column prop="roleId" label="角色名称" align="center" >
      <template slot-scope="{ row }">
        <span v-if="row.roleId == 1">学生</span>
        <span v-if="row.roleId == 2">教师</span>
        <span v-if="row.roleId == 3">管理员</span>
      </template>
      </el-table-column>
      <el-table-column prop="gradeName" label="班级" align="center" />
      <el-table-column prop="createTime" label="注册时间" align="center" />
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button v-if="(role == 'teacher' && row.roleId == 1) || (role == 'admin' && row.roleId != 3)" type="text" size="small" style="font-size: 14px"
            @click="openEditUser(row)">编辑</el-button>
          <el-button v-if="role == 'teacher'" type="text" size="small" style="color: red; font-size: 14px"
            @click="removeUserClass(row)">移除班级</el-button>
          <el-button v-if="role == 'admin'" type="text" size="small" style="color: red; font-size: 14px"
            @click="delUser(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增弹窗 -->
    <el-dialog title="新增用户" :visible.sync="addUserDiologVisible">
      <el-form :model="addForm">
        <el-row>
          <el-col :span="11">
            <el-form-item label="用户名" :label-width="formLabelWidth">
              <el-input v-model="addForm.userName" autocomplete="off" />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="真实姓名" :label-width="formLabelWidth">
              <el-input v-model="addForm.realName" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item v-if="role == 'admin'" label="身份选择" :label-width="formLabelWidth">
              <el-select v-model="addForm.roleId" placeholder="请选择身份">
                <el-option label="学生" value="1" />
                <el-option label="教师" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item v-if="role == 'teacher' || (role == 'admin' && addForm.roleId == '1')" label="班级选择" :label-width="formLabelWidth">
              <ClassSelect v-model="addForm.gradeId" :is-multiple="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert
          title="新增用户无需填写密码，系统默认初始密码为 123456"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 8px"
        />
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUserDiologVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑弹窗 -->
    <el-dialog title="编辑用户" :visible.sync="editUserDialogVisible">
      <el-form :model="editForm">
        <el-row>
          <el-col :span="11">
            <el-form-item label="用户名" :label-width="formLabelWidth">
              <el-input v-model="editForm.userName" autocomplete="off" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="真实姓名" :label-width="formLabelWidth">
              <el-input v-model="editForm.realName" autocomplete="off" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="11">
            <el-form-item label="身份选择" :label-width="formLabelWidth">
              <el-select v-model="editForm.roleId" placeholder="请选择身份" disabled>
                <el-option label="学生" value="1" />
                <el-option label="教师" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item v-if="editForm.roleId == '1'" label="班级选择" :label-width="formLabelWidth">
              <ClassSelect v-model="editForm.gradeId" :is-multiple="false" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="22">
            <el-form-item label="重置密码" :label-width="formLabelWidth">
              <el-input
                v-model="editForm.password"
                type="password"
                show-password
                autocomplete="new-password"
                placeholder="留空则不重置密码"
              />
              <div class="form-tip">填写新密码将重置该用户密码；留空则保持原密码不变</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 文件上传 -->
    <el-dialog width="400px" :show-close="false" :close-on-click-modal="false" title="上传文件"
      :visible.sync="fileDialogVisible">
      <el-upload class="upload-demo" drag action="xxxxxx" multiple :limit="1" accept=".xlsx, .xls" :auto-upload="false"
        :on-remove="handleRemove" :on-change="handleFileChange" :file-list="fileList">
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且不超过500kb,大小为12kb</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileDialogVisible = false">取 消</el-button>
        <el-button type="success" plain @click="startDownload">下载模板</el-button>

        <el-button type="primary" @click="importUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination :current-page="data.current" :page-sizes="[10, 20, 30, 40]" :page-size="data.size"
        layout="total, sizes, prev, pager, next, jumper" :total="data.total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import ClassSelect from '@/components/ClassSelect'
import { userPaging, classAdd, userDel, userImport, userUpdate } from '@/api/user'
import { userClassRemove } from '@/api/class_'
export default {
  components: { ClassSelect },
  data() {
    return {
      // 当前登录角色
      role: '',
      pageNum: 1,
      pageSize: 10,
      // 分页查找的数据
      data: {},
      // 导入用户上传文件的文件列表
      fileList: [],
      // 新增用户对话框
      addUserDiologVisible: false,
      // 编辑用户对话框
      editUserDialogVisible: false,
      // 导入用户对话框
      fileDialogVisible: false,
      // 新增用户表单
      addForm: {
        userName: '',
        realName: '',
        roleId: '',
        gradeId: ''
      },
      // 编辑用户表单
      editForm: {
        id: '',
        userName: '',
        realName: '',
        roleId: '',
        gradeId: '',
        password: ''
      },
      // 筛选栏表单
      searchForm: {
        searchRealName: '',
        searchClass: ''
      },
      // eslint-disable-next-line no-dupe-keys
      formLabelWidth: '80px'
    }
  },
  created() {
    // 获取用户角色
    this.role = localStorage.getItem('roles')
    // 获取分页数据
    this.getUserPage()
  },
  methods: {
    // 分页查询用户
    async getUserPage(pageNum, pageSize, realName = null, gradeId = null) {
      const params = {
        pageNum: pageNum,
        pageSize: pageSize,
        realName: realName,
        gradeId: gradeId
      }
      const res = await userPaging(params)
      this.data = res.data
    },
    // 搜索功能用户
    searchUser() {
      this.getUserPage(
        this.pageNum,
        this.pageSize,
        this.searchForm.searchRealName,
        this.searchForm.searchClass
      )
    },
    // 设置每页多少条逻辑
    handleSizeChange(val) {
      this.pageSize = val
      this.getUserPage(this.pageNum, val,this.searchForm.searchRealName,
      this.searchForm.searchClass)
    },
    // 设置当前页逻辑
    handleCurrentChange(val) {
      this.pageNum = val
      this.getUserPage(val, this.pageSize,this.searchForm.searchRealName,
      this.searchForm.searchClass)
    },
    // 添加用户逻辑
    addUser() {
      const data = {
        userName: this.addForm.userName,
        realName: this.addForm.realName,
        roleId: this.addForm.roleId,
        gradeId: this.addForm.gradeId
      }
      classAdd(data).then((res) => {
        if (res.code) {
          // 清空新增用户表单
          this.addForm.userName = ''
          this.addForm.realName = ''
          this.addForm.roleId = ''
          this.addForm.gradeId = ''
          // 刷新页面数据
          this.getUserPage(this.pageNum, this.pageSize)
          // 关闭新增用户对话框
          this.addUserDiologVisible = false
          this.$message({
            type: 'success',
            message: '新增成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 打开编辑用户对话框
    openEditUser(row) {
      this.editForm = {
        id: row.id,
        userName: row.userName,
        realName: row.realName,
        roleId: row.roleId != null ? String(row.roleId) : '',
        gradeId: row.gradeId || '',
        password: ''
      }
      this.editUserDialogVisible = true
    },
    // 编辑用户逻辑（密码为空则不重置）
    updateUser() {
      const password = (this.editForm.password || '').trim()
      if (password && password.length < 6) {
        this.$message({
          type: 'warning',
          message: '新密码不能少于6位'
        })
        return
      }
      const data = {
        userName: this.editForm.userName,
        realName: this.editForm.realName,
        roleId: this.editForm.roleId,
        gradeId: this.editForm.gradeId || null
      }
      if (password) {
        // 有填写才传 password；为空表示不重置
        data.password = password
      }
      userUpdate(this.editForm.id, data).then((res) => {
        if (res.code) {
          this.getUserPage(this.pageNum, this.pageSize, this.searchForm.searchRealName, this.searchForm.searchClass)
          this.editUserDialogVisible = false
          this.editForm.password = ''
          this.$message({
            type: 'success',
            message: password ? '修改成功，密码已重置!' : '修改成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 上传文件逻辑
    importUser() {
      if (this.fileList.length > 0) {
        const formData = new FormData() // 创建FormData对象
        formData.append('file', this.fileList[0].raw) // 添加文件到formData
        userImport(formData)
          .then((response) => {
            if (response.code) {
              this.getUserPage(this.pageNum, this.pageSize)
              this.$message.success(`${response.msg}`)
              this.fileDialogVisible = false // 关闭对话框
            } else {
              this.$message.error(`${response.msg}`)
            }

            // 可以在这里处理成功后的逻辑，如刷新数据等
          })
          .catch((error) => {
            console.error('文件上传失败：', error)
            this.$message.error('文件上传失败！')
          })
      } else {
        this.$message.warning('请选择文件后再上传！')
      }
    },
    // 上传文件出触发
    handleFileChange(file, fileList) {
      this.fileList = fileList // 收集文件信息
    },
    // 移除文件处理方法
    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false
      }
    },
    // 删除用户方法
    delUser(row) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          userDel(row.id).then((res) => {
            if (res.code) {
              // 刷新页面数据
              this.getUserPage(this.pageNum, this.pageSize)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'info',
                message: res.msg
              })
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 将用户移出班级
    removeUserClass(row) {
      userClassRemove(row.id).then((res) => {
        if (res.code) {
          // 刷新页面数据
          this.getUserPage(this.pageNum, this.pageSize)
          this.$message({
            type: 'success',
            message: '移除成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 下载模板
    async startDownload() {
      const a = document.createElement('a')
      a.href = './template/ImportUserTemplate.xlsx'
      a.download = '导入用户模板.xlsx'
      // 障眼法藏起来a标签
      a.style.display = 'none'
      // 将a标签追加到文档对象中
      document.body.appendChild(a)
      // 模拟点击了<a>标签,会触发<a>标签的href的读取,浏览器就会自动下载了
      a.click()
      // 一次性的,用完就删除a标签
      a.remove()
    }
  }
}
</script>
<style scoped>
/* 表格边框由全局 page.scss 统一控制 */
.form-tip {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: #94a3b8;
}
</style>
