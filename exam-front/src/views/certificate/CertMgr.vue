
<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="证书名称">
        <el-input v-model="searchCertificateName" placeholder="证书名称" />
      </el-form-item>
      <el-form-item label="认证单位">
        <el-input v-model="searchCertificationNuit" placeholder="认证单位" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchCertificate">查询</el-button>
        <el-button type="primary" @click="dialogTableVisible = true">新增</el-button>
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
      <el-table-column fixed label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="certificateName" label="证书名称" align="center" />
      <el-table-column prop="certificationNuit" label="认证单位" align="center" />

      <el-table-column prop="createTime" label="创建时间" align="center" />

      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="delCertificate(row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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
        <el-form :model="form">
          <el-form-item label="证书名称" :label-width="formLabelWidth">
            <el-input v-model="form.certificateName" autocomplete="off" />
          </el-form-item>
          <el-form-item label="认证单位" :label-width="formLabelWidth">
            <el-input v-model="form.certificationNuit" autocomplete="off" />
          </el-form-item>
        </el-form>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCertificate">确 定</el-button>
      </div>
    </el-dialog>

    <!--编辑弹窗-->

    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="证书名称" :label-width="formLabelWidth">
              <el-input v-model="form.certificateName" autocomplete="off" />
            </el-form-item>
            <el-form-item label="认证单位" :label-width="formLabelWidth">
              <el-input v-model="form.certificationNuit" autocomplete="off" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateCertificate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  certificatePaging,
  certificateDel,
  certificateAdd,
  certificateUpdate
} from '@/api/certificate'
export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      input: '',
      input1: '',
      currentPage1: 5,
      currentPage2: 5,
      currentPage3: 5,
      currentPage4: 4,
      diaTitle: '',
      searchCertificateName: '',
      searchCertificationNuit: '',
      formInline: {
        user: '',
        region: ''
      },
      cancle() {},
      updateRow(row) {
        this.dialogFormVisible = true
        this.form = row
      },
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      formLabelWidth: '120px'
    }
  },
  computed: {
    tables() {
      // 在你的数据表格中定义tabels
      const input = this.input
      const input1 = this.input1
      if (input) {
        return this.tableData.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      if (input1) {
        //  ("input输入的搜索内容：" + this.input)
        return this.tableData.filter((data) => {
          //  ("object:" + Object.keys(data));
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input1) > -1
          })
        })
      }

      return this.tableData
    }
  },
  created() {
    this.getCertificatePage()
  },
  methods: {
    // 分页查询
    async getCertificatePage(
      pageNum,
      pageSize,
      certificateName = null,
      searchCertificationNuit = null
    ) {
      const params = {
        pageNum: pageNum,
        pageSize: pageSize,
        certificateName: certificateName,
        certificationUnit: searchCertificationNuit
      }
      const res = await certificatePaging(params)
      this.data = res.data
    },
    searchCertificate() {
      this.getCertificatePage(
        this.pageNum,
        this.pageSize,
        this.searchCertificateName,
        this.searchCertificationNuit
      )
    },
    updateCertificate() {
      const data = {
        certificateName: this.form.certificateName,
        certificationNuit: this.form.certificationNuit
      }
      certificateUpdate(this.form.id, data).then((res) => {
        if (res.code) {
          this.getCertificatePage(this.pageNum, this.pageSize)
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
    },
    addCertificate() {
      const data = {
        certificateName: this.form.certificateName,
        certificationNuit: this.form.certificationNuit
      }
      certificateAdd(data).then((res) => {
        if (res.code) {
          this.form.certificateName = ''
          this.form.certificationNuit = ''
          this.getCertificatePage(this.pageNum, this.pageSize)
          this.dialogTableVisible = false
          this.$message({
            type: 'success',
            message: '添加成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    delCertificate(id) {
      this.$confirm('此操作将永久删除该证书, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          certificateDel(id).then((res) => {
            if (res.code) {
              this.getCertificatePage(this.pageNum, this.pageSize)
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

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getCertificatePage(this.pageNum, val,this.searchCertificateName,
      this.searchCertificationNuit)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getCertificatePage(val, this.pageSize,this.searchCertificateName,
      this.searchCertificationNuit)
    },
    handleClick(row) {
    }
  }
}
</script>
<style></style>
