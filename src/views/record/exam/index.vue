<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host"
  >
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
        active-color="#0f766e"
        inactive-color="#c5d5d0"
        @change="toggleSort"
      />
    </div>
    <el-table class="flex-list-table"
      v-if="!isMobile"
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
      <el-table-column show-overflow-tooltip min-width="160" prop="title" align="center" label="试卷名称" />
      <el-table-column prop="passedScore" align="center" label="及格分" min-width="90" />
      <el-table-column prop="userScore" align="center" label="用户成绩" min-width="120">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.whetherMark !== 0"
            :content="scope.row.userScore >= scope.row.passedScore ? '及格' : '不及格'"
            placement="top"
          >
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
          <el-tag v-else type="warning" size="small" effect="plain">待阅卷</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" min-width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.whetherMark === 0" type="warning" size="mini">待阅卷</el-tag>
          <el-tag v-else-if="scope.row.whetherMark === 1" type="success" size="mini">已出分</el-tag>
          <el-tag v-else size="mini" type="info">已交卷</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="90" prop="examDuration" align="center" label="考试时长（分钟）" />
      <el-table-column min-width="90" prop="userTime" align="center" label="用户用时">
        <template slot-scope="scope">
          <div>{{ formatDuration(scope.row.userTime) }}</div>
        </template>
      </el-table-column>
      <el-table-column min-width="140" align="center" label="操作">
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

    <div v-else class="h5-card-list">
      <div v-if="!(data.records && data.records.length)" class="h5-card-empty">暂无考试记录</div>
      <div v-for="(row, index) in (data.records || [])" :key="row.id || index" class="h5-card">
        <div class="h5-card-title">{{ row.title }}</div>
        <div class="h5-card-row">
          <span>成绩 / 及格分</span>
          <span v-if="row.whetherMark === 0" style="color: #e6a23c">待阅卷</span>
          <span v-else :style="{ color: row.userScore >= row.passedScore ? '#67C23A' : '#F56C6C' }">
            {{ row.userScore }} / {{ row.passedScore }}
          </span>
        </div>
        <div class="h5-card-row"><span>考试时长</span><span>{{ row.examDuration }} 分钟</span></div>
        <div class="h5-card-row"><span>实际用时</span><span>{{ formatDuration(row.userTime) }}</span></div>
        <div class="h5-card-actions">
          <el-button type="primary" size="small" @click="screenInfo(row)">查看</el-button>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <el-pagination
        :current-page="data.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="data.size"
        :layout="paginationLayout"
        :total="data.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { recordExamPaging } from '@/api/record'
import pageLoading from '@/mixin/pageLoading'
import { formatDuration } from '@/utils/duration'
import { getUserId } from '@/utils/auth'
export default {
  mixins: [pageLoading],
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
    formatDuration,

    searchExam() {
      this.getExamRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },

    toggleSort() {
      this.getExamRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },
    // 分页查询
    async getExamRecordPaging(pageNum, pageSize, examName) {
      await this.withPageLoading(async() => {
        const params = { pageNum: pageNum, pageSize: pageSize, examName: examName, isASC: this.isASC }
        const res = await recordExamPaging(params)
        this.data = res.data
      })
    },

    screenInfo(row) {
      sessionStorage.setItem('answer_info', JSON.stringify({
        ...row,
        examId: row.id,
        userId: row.userId != null ? row.userId : getUserId(),
        whetherMark: 1
      }))
      sessionStorage.setItem('exam_record_context', JSON.stringify({
        examId: row.id,
        userId: row.userId != null ? row.userId : getUserId()
      }))
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
