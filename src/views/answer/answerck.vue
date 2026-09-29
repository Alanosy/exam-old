<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host"
  >
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="用户姓名">
        <el-input v-model="realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="searchFun"
        >查询</el-button>
      </el-form-item>
    </el-form>
    <!-- table -->
    <el-table class="flex-list-table"
      :data="data.records"
      border
      fit
      highlight-current-row
      :header-cell-style="{
        background: '#eef6f3',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
    >
      <el-table-column align="center" type="selection" min-width="48" />
      <el-table-column label="序号" align="center" min-width="56">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column min-width="120" prop="userName" label="用户名字" align="center" />
      <el-table-column min-width="148" class-name="datetime-col" prop="limitTime" label="提交时间" align="center" />
      <el-table-column min-width="100" label="阅卷状态" align="center">
        <template slot-scope="{ row }">
          <el-tag
            size="small"
            :type="isMarked(row) ? 'success' : 'warning'"
          >{{ statusText(row) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="140" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="screenInfo(scope.row)"
          >{{ isMarked(scope.row) ? '查看答卷' : '批改试卷' }}</el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <div class="empty-tip">暂无已交卷考生</div>
      </template>
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

    <back-to-top />
  </div>
</template>

<script>
import { answerUserPging } from '@/api/answer'
import pageLoading from '@/mixin/pageLoading'
import BackToTop from '@/components/BackToTop'
export default {
  mixins: [pageLoading],
  components: { BackToTop },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      examId: '',
      realName: '',
      formInline: {}
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
    isMarked(row) {
      if (!row) return false
      if (Number(row.whetherMark) === 1) return true
      const text = String(row.corrected || '')
      return text === '已阅卷' || text === '是'
    },
    statusText(row) {
      if (this.isMarked(row)) return '已阅卷'
      if (row && row.corrected) return row.corrected
      return '待阅卷'
    },
    searchFun() {
      this.pageNum = 1
      this.getAnswerUserPage(
        this.pageNum,
        this.pageSize,
        this.examId
      )
    },
    getAnswerUserPage(pageNum, pageSize, examId) {
      this.withPageLoading(async() => {
        const params = { pageNum: pageNum, pageSize: pageSize, examId: examId, realName: this.realName }
        const res = await answerUserPging(params)
        this.data = res.data
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getAnswerUserPage(this.pageNum, val, this.examId)
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getAnswerUserPage(val, this.pageSize, this.examId)
    },
    screenInfo(row) {
      const payload = Object.assign({}, row, {
        whetherMark: this.isMarked(row) ? 1 : 0
      })
      sessionStorage.setItem('answer_info', JSON.stringify(payload))
      this.$router.push({ name: 'makeTest' })
    }

  }
}
</script>

<style scoped>
.empty-tip {
  padding: 28px 12px;
  color: #909399;
  font-size: 14px;
}
</style>
