<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="考试名称">
        <el-input v-model="searchTitle" placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchUserBook">查询</el-button>
      </el-form-item>
    </el-form>

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
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="title" align="center" label="试卷名称" width="250" />
      <el-table-column prop="numberOfErrors" align="center" label="错题数量" />
      <el-table-column prop="createTime" align="center" label="创建时间" />
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <!-- <el-button type="text" size="small" style="font-size: 14px" @click="updateRow(row)">查看</el-button> -->
          <el-button
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="screenInfo(row)"
          >重刷</el-button>
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
    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="序号  " :label-width="formLabelWidth">
              <el-input v-model="form.xh" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="试卷名称" :label-width="formLabelWidth">
              <el-input v-model="form.sjmc" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="错题数量" :label-width="formLabelWidth">
              <el-input v-model="form.ctsl" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="创建时间" :label-width="formLabelWidth">
              <el-input v-model="form.cjsj" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userbookPaging } from '@/api/userbook'
export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      input: '',
      currentPage1: 5,
      currentPage2: 5,
      currentPage3: 5,
      currentPage4: 4,
      formInline: {
        user: '',
        region: ''
      },

      dialogVisible: false,
      form: {
        name: ''
      },
      cancle() {},
      updateRow(row) {
        this.dialogFormVisible = true
        this.form = row
      },
      searchTitle: '',
      dialogFormVisible: false,
      formLabelWidth: '110px'
    }
  },
  computed: {
    tables() {
      // 在你的数据表格中定义tabels
      const input = this.input
      if (input) {
        return this.tableData.filter((data) => {
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      return this.tableData
    }
  },
  created() {
    this.getUserBookPage()
  },
  methods: {
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getUserBookPage(this.pageNum, val, this.searchTitle)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getUserBookPage(val, this.pageSize, this.searchTitle)
    },
    // 分页查询
    async getUserBookPage(pageNum, pageSize, examName = null) {
      const params = { pageNum: pageNum, pageSize: pageSize, examName: examName }
      const res = await userbookPaging(params)
      this.data = res.data
    },
    searchUserBook() {
      this.getUserBookPage(this.pageNum, this.pageSize, this.searchTitle)
    },

    handleClose(done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    },

    screenInfo(row) {
      localStorage.setItem('userbook_examId', row.examId)
      this.$router.push({ path: '/rebrush' })
    }
  }
}
</script>
<style scoped>
.qb {
  margin-top: 20px;
  width: 100%;
  height: 8000px;
}

.sf {
  width: 100%;
  height: 80px;
}

.xx {
  width: 1200px;
  height: 40px;
  padding: 20px 0px 0px 50px;
}

.block {
  padding: 30px 0 0 50px;
}
</style>
