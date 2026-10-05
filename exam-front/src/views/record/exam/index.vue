<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="考试名称">
        <el-input v-model="searchTitle" placeholder="考试名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="searchExam">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="sort-switch-container">
      <span class="sort-label">完成时间：</span>
      <el-switch
        v-model="isASC"
        active-text="升序"
        inactive-text="降序"
        active-color="#13ce66"
        inactive-color="#409EFF"
        @change="toggleSort"
      />
    </div>
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
      <el-table-column prop="title" align="center" label="试卷名称" />
      <el-table-column prop="passedScore" align="center" label="及格分" />
      <el-table-column prop="userScore" align="center" label="用户成绩">
        <template slot-scope="scope">
          <el-tooltip :content="scope.row.userScore >= scope.row.passedScore ? '及格' : '不及格'" placement="top">
            <span
              :style="{
                color: scope.row.userScore >= scope.row.passedScore ? '#67C23A' : '#F56C6C',
                backgroundColor: scope.row.userScore >= scope.row.passedScore ? '#f0f9eb' : '#fef0f0',
                padding: '6px 10px',
                borderRadius: '4px',
                display: 'inline-block'
              }"
            >
              {{ scope.row.userScore }}
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="examDuration" align="center" label="考试时长（分钟）" />
      <el-table-column prop="userTime" align="center" label="用户用时">
        <template slot-scope="scope">
          <div>{{ (Math.ceil(scope.row.userTime/60)).toString() + " 分钟" }}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="screenInfo(row)"
          >查看</el-button>
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
  </div>
</template>

<script>
import { recordExamPaging } from '@/api/record'
export default {
  namespaced: true,
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      input: '',
      searchTitle: '',
      isASC: false, // 默认为降序
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
      diaTitle: '新增',
      dialogTableVisible: false,
      dialogFormVisible: false
    }
  },
  computed: {

    tables() {
      // 在你的数据表格中定义tabels
      const input = this.input
      if (input) {
        //  ("input输入的搜索内容：" + this.input)
        return this.tableData.filter((data) => {
          //  ("object:" + Object.keys(data));
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      return this.tableData
    }
  },

  created() {
    this.getExamRecordPaging()
  },
  methods: {

    searchExam() {
      this.getExamRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },

    toggleSort() {
      this.getExamRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },
    // 分页查询
    async getExamRecordPaging(pageNum, pageSize, examName) {
      const params = { pageNum: pageNum, pageSize: pageSize, examName: examName, isASC: this.isASC }
      const res = await recordExamPaging(params)
      this.data = res.data
    },

    screenInfo(row) {
      localStorage.setItem('record_exam_examId', row.id)
      this.$router.push({ name: 'exam-record-detail', query: { zhi: row }})
    },

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getExamRecordPaging(this.pageNum, val, this.searchTitle)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getExamRecordPaging(val, this.pageSize, this.searchTitle)
    },

    handleClose(done) {
      this.$confirm('确认关闭？')
        .then((_) => {
          done()
        })
        .catch((_) => {})
    }
  }
}
</script>
<style scoped>
.el-table .cell {
  white-space: nowrap;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.sort-switch-container {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}
</style>
