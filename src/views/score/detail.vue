<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="真实姓名">
        <el-input v-model="realName" placeholder="真实姓名" />
      </el-form-item>
      <!-- <el-form-item label="所属班级">
        <el-input v-model="input1" placeholder="所属班级"></el-input>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
        <el-button type="primary" @click="getExportScores">导出</el-button>
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
      <el-table-column show-overflow-tooltip min-width="160" prop="title" label="试卷名称" align="center" />
      <el-table-column min-width="120" prop="realName" label="真实姓名" align="center" />
      <el-table-column min-width="80" prop="userScore" label="用户得分" align="center" />
      <el-table-column min-width="72" prop="count" label="切屏次数" align="center" />
      <el-table-column min-width="110" prop="userTime" label="用户用时" align="center">
        <template slot-scope="scope">{{ formatDuration(scope.row.userTime) }}</template>
      </el-table-column>
      <el-table-column min-width="148" class-name="datetime-col" prop="limitTime" label="提交时间" align="center" />
      
      <el-table-column min-width="140" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
            >查看详情</el-button
          >
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
import { scorePaging, exportScores } from '@/api/score'
import pageLoading from '@/mixin/pageLoading'
import { formatDuration } from '@/utils/duration'
export default {
  mixins: [pageLoading],
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      gradeId: '',
      examId: '',
      realName: '',
      examTitle: '',
      gradeName: '',
      data: {},
      formInline: {
        user: '',
        region: ''
      },
      input: '',
      input1: '',

      form: {
        name: ''
      },
      diaTitle: '',
      dialogTableVisible: false,
      dialogFormVisible: false,

      formLabelWidth: '120px'
    }
  },
  computed: {
    tables() {
      // 在你的数据表格中定义tabels
      const input = this.input
      const input1 = this.input1
      if (input) {
        //  ("input输入的搜索内容：" + this.input)
        return this.tableData.filter((data) => {
          //  ("object:" + Object.keys(data));
          return Object.keys(data).some((key) => {
            return String(data[key]).toLowerCase().indexOf(input) > -1
          })
        })
      }
      if (input1) {
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
    this.examId = this.$route.query.examId
    this.gradeId = this.$route.query.gradeId
    this.examTitle = this.$route.query.examTitle
    this.gradeName = this.$route.query.gradeName
    this.getScorePage()
  },
  methods: {
      formatDuration,
      updateRow(row) {
        row.type= 1;
        sessionStorage.setItem('answer_info', JSON.stringify({
          ...row,
          whetherMark: 1
        }))
        sessionStorage.setItem('exam_record_context', JSON.stringify({
          examId: row.examId,
          userId: row.userId
        }))
        this.$router.push({ name: 'exam-record-detail', query: { data: row }})
      },
    // 分页查询
    async getScorePage() {
      if (this.examId == null || this.examId === '' || this.gradeId == null || this.gradeId === '') {
        this.data = {}
        this.$message.warning('缺少考试或班级参数，请从成绩分析重新进入')
        return
      }
      await this.withPageLoading(async () => {
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          examId: this.examId,
          gradeId: this.gradeId,
          realName: this.realName
        }
        const res = await scorePaging(params)
        this.data = res.data

      })

      },
    getExportScores() {
      exportScores(this.examId, this.gradeId).then(res => {
        (res) // 控制台输出：Blob {size: 30208, type: 'application/x-msdownload'}
        var debug = res
        if (debug) {
          var elink = document.createElement('a')
          var filename = 'downloaded-file.xlsx'
          if (this.gradeName) {
            filename = this.gradeName + '-' + this.examTitle + '.xlsx'
          }
          elink.download = filename
          elink.style.display = 'none'
          // var blob = new Blob([debug], { type: 'application/x-msdownload' })(blob)
          // const filename = decodeURIComponent(res.headers['Content-Disposition'])
          //  (filename)
          elink.href = URL.createObjectURL(res)
          document.body.appendChild(elink)
          elink.click()
          document.body.removeChild(elink)
        } else {
          this.$message.error('导出异常请联系管理员')
        }
      }).catch(err => {
        (err)
      })
    },

    onSubmit() {
      this.getScorePage()
      //  ("submit!");
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getScorePage(this.pageNum, val)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getScorePage(val, this.pageSize)
    },

    handleClick(row) {
    }
  }
}
</script>
<style></style>
