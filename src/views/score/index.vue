<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="试卷名称">
        <el-input v-model="examTitle" placeholder="试卷名称" />
      </el-form-item>
      <el-form-item label="所属班级">
        <ClassSelect v-model="gradeId" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
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
      <el-table-column show-overflow-tooltip min-width="160" prop="examTitle" label="考试名称" align="center" />
      <el-table-column min-width="120" prop="gradeName" label="班级" align="center" />
      <el-table-column min-width="72" prop="maxScore" label="最高分" align="center" />
      <el-table-column min-width="72" prop="minScore" label="最低分" align="center" />
      <el-table-column min-width="72" prop="avgScore" label="平均分" align="center" />
      <el-table-column min-width="80" prop="attendNum" label="参考人数" align="center" />
      <!-- <el-table-column min-width="148" class-name="datetime-col" prop="limitTime" label="提交时间" align="center" /> -->

      <el-table-column min-width="140" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            :disabled="row.maxScore == null"
            style="font-size: 14px"
            @click="updateRow(row)"
          >查看详情</el-button>
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
import ClassSelect from '@/components/ClassSelect'
import { getExamScore } from '@/api/score'
import pageLoading from '@/mixin/pageLoading'
export default {
  mixins: [pageLoading],
  components: { ClassSelect },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      gradeId: '',
      examTitle: '',
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
      cancle() {},
      updateRow(row) {
        this.$router.push({
          name: 'user-score',
          query: {
            examId: row.examId,
            gradeId: row.gradeId,
            examTitle: row.examTitle,
            gradeName: row.gradeName
          }
        })
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
    this.getScorePage()
  },
  methods: {
    // 分页查询
    async getScorePage() {

      await this.withPageLoading(async () => {
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          gradeId: this.gradeId,
          examTitle: this.examTitle
        }
        const res = await getExamScore(params)
        this.data = res.data

      })

      },
    onSubmit() {
      this.getScorePage()
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getScorePage()
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getScorePage()
    },
    handleClick(row) {
    }
  }
}
</script>
<style></style>
