<template>
  <div class="app-container">
    <!-- form -->

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="班级">
        <el-input v-model="formInline.searchTitle" placeholder="输入班级名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchExam">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="role==3" :title="diaTitle" type="primary" @click="dialogTableVisible = true">
          新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-if="role==2" type="primary" @click="joinClassVisible = true">
          加入班级</el-button>
      </el-form-item>
    </el-form>

    <!-- table -->

    <el-table
      :data="data.records"
      border
      fit
      highlight-current-row
      :header-cell-style="{
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
    >
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column label="序号" align="center" width="80px">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="gradeName" label="班级名称" align="center" />
      <el-table-column prop="gradeCount" label="班级人数" align="center" />
      <el-table-column prop="code" label="班级口令" align="center" />
      <el-table-column prop="userName" label="创建用户" align="center" />
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <!-- 管理员按钮 -->
          <el-button
            v-if="role==3"
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
          >编辑</el-button>

          <el-button
            v-if="role==3"
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="delClass(row)"
          >删除</el-button>
          <!-- 教师按钮 -->
          <el-button
            v-if="role==2"
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="exitClass(row)"
          >退出班级</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="data.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="data.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="data.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!--新增弹窗-->

    <el-dialog :title="diaTitle" :visible.sync="dialogTableVisible">
      <el-row>
        <el-form :model="addForm">
          <el-form-item label="班级名称" :label-width="formLabelWidth">
            <el-input v-model="addForm.gradeName" autocomplete="off" />
          </el-form-item>
        </el-form>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="addClass">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="加入班级" :visible.sync="joinClassVisible">
      <el-row>
        <el-form :model="teacharForm">
          <el-form-item label="班级代码：" :label-width="formLabelWidth">
            <el-input v-model="teacharForm.classCode" autocomplete="off" />
          </el-form-item>
        </el-form>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="joinClassVisible = false">取 消</el-button>
        <el-button type="primary" @click="joinClass">确 定</el-button>
      </div>
    </el-dialog>

    <!--编辑弹窗-->
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="班级名称" :label-width="formLabelWidth">
              <el-input v-model="form.gradeName" autocomplete="off" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateClass">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { teacherJoinClass, teacherExitClass, classPaging, classDel, classUpdate, classAdd } from '@/api/class_'
import { getRole } from '@/utils/jwtUtils'
export default {
  data() {
    return {
      teacharForm: {
        classCode: ''
      },
      role: 0,
      pageNum: 1,
      pageSize: 10,
      data: {},
      diaTitle: '新增',
      joinClassVisible: false,
      dialogTableVisible: false,
      dialogFormVisible: false,
      addForm: {
        gradeName: ''
      },
      formInline: {
        searchTitle: ''
      },
      form: {
        gradeName: ''
      },
      formLabelWidth: '110px'
    }
  },

  created() {
    this.getClassPage()
    this.role = getRole()
  },
  methods: {
    joinClass() {
      const params = { code: this.teacharForm.classCode }
      teacherJoinClass(params).then((res) => {
        if (res.code) {
          this.joinClassVisible = false
          this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
          this.$message({
            type: 'success',
            message: '加入成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    exitClass(row) {
      const classId = row['id']
      teacherExitClass(classId).then((res) => {
        if (res.code) {
          this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
          this.$message({
            type: 'success',
            message: '加入成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 分页查询
    async getClassPage(pageNum, pageSize, title = null) {
      const params = { pageNum: pageNum, pageSize: pageSize, gradeName: title }
      const res = await classPaging(params)
      this.data = res.data
    },
    addClass() {
      const data = { gradeName: this.addForm.gradeName }
      classAdd(data).then((res) => {
        if (res.code) {
          this.addForm.gradeName = ''
          this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
          this.dialogTableVisible = false
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
    delClass(row) {
      this.$confirm('此操作将永久删除该班级, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          classDel(row.id).then((res) => {
            if (res.code) {
              this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
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
    updateClass() {
      classUpdate(this.form.id, { gradeName: this.form.gradeName })
        .then((res) => {
          if (res.code) {
            this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
            this.dialogFormVisible = false
            this.$message({
              type: 'success',
              message: '编辑成功!'
            })
          } else {
            this.$message({
              type: 'info',
              message: res.msg
            })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          })
        })
    },
    updateRow(row) {
      this.dialogFormVisible = true
      this.form = row
    },
    searchExam() {
      this.getClassPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
    },
    handleClick(row) {
      (row)
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getClassPage(this.pageNum, val,this.formInline.searchTitle)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getClassPage(val, this.pageSize,this.formInline.searchTitle)
    }
  }
}
</script>

<style>
.el-table--border,
.el-table--group {
  border: 1px solid #b3b3b3;
}

.bj {
  margin-top: 40px;
  margin-left: 30px;
}
</style>
