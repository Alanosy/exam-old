<template>
  <div class="app-container">

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="用户姓名">
        <el-input v-model="realName" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="searchFun"
        >查询</el-button>
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
      <el-table-column prop="userName" label="用户名字" align="center" />
      <el-table-column prop="limitTime" label="提交时间" align="center" />

      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="screenInfo(scope.row)"
          >批改试卷</el-button>
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
import { answerUserPging } from '@/api/answer'
export default {

  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      examId: '',
      realName: '',
      formInline: {}, // 初始化为你需要的值或者对象结构
      handleSizeChange: '',
      handleCurrentChange: ''
    }
  },
  created() {
    this.examId = localStorage.getItem('answer_examId')
    this.getAnswerUserPage(
      this.pageNum,
      this.pageSize,
      this.examId
    )
  },
  methods: {
    searchFun() {
      this.getAnswerUserPage(
        this.pageNum,
        this.pageSize,
        this.examId
      )
    },
    getAnswerUserPage(pageNum, pageSize, examId, realName) {
      const params = { pageNum: pageNum, pageSize: pageSize, examId: examId, 'realName': this.realName }
      answerUserPging(params).then((res) => {
        this.data = res.data
      })
    },
    screenInfo(row) {
      sessionStorage.setItem('answer_info', JSON.stringify(row))
      this.$router.push({ name: 'makeTest' })
    }

  }
}
</script>

<style scoped></style>
