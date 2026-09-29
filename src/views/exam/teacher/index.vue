<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="考试名称">
        <el-input v-model="input" />
      </el-form-item>

      <!-- <el-form-item label="考试时间" style="margin-left: 15px">
          <el-date-picker
            v-model="value1"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item> -->

      <el-form-item>
        <el-button type="primary" @click="searchExam">查询</el-button>
        <el-button type="primary" @click="screenInfo()">新增</el-button>
      </el-form-item>
    </el-form>

    <!-- table -->

    <el-table
      :data="data.records"
      border
      fit
      highlight-current-row
      class="exam-manage-table flex-list-table"
      style="width: 100%"
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
      <el-table-column prop="title" label="试卷名称" align="center" min-width="160" show-overflow-tooltip />
      <el-table-column prop="examDuration" label="考试时间" align="center" min-width="80" />
      <el-table-column prop="maxCount" label="切屏次数" align="center" min-width="80" />
      <el-table-column prop="grossScore" label="总分" align="center" min-width="64" />
      <el-table-column prop="passedScore" label="及格分" align="center" min-width="64" />
      <el-table-column prop="startTime" label="开始时间" align="center" min-width="148" class-name="datetime-col" />
      <el-table-column prop="endTime" label="结束时间" align="center" min-width="148" class-name="datetime-col" />
      <el-table-column label="操作" align="center" min-width="168">
        <template slot-scope="{ row }">
          <div class="op-btns">
            <el-button
              type="text"
              size="small"
              style="color:cornflowerblue; font-size: 14px"
              @click="showExam(row)"
            >查看详情</el-button>
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
              @click="delExam(row)"
            >删除</el-button>
          </div>
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
    <!-- 显示详情对话框 -->
    <el-dialog title="显示详情" :visible.sync="showExamDialogVisible">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="showExamData">
            <el-form-item label="考试标题  " :label-width="formLabelWidth">
              <el-input v-model="showExamData.title" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="考试时长" :label-width="formLabelWidth">
              <el-input v-model="showExamData.examDuration" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="最大切屏次数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.maxCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="及格分" :label-width="formLabelWidth">
              <el-input v-model="showExamData.passedScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <!-- <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="考试班级" :label-width="formLabelWidth">
              <el-input v-model="form.address"></el-input>
            </el-form-item>
          </el-form>
        </el-col> -->
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="单选题数量" :label-width="formLabelWidth">
              <el-input v-model="showExamData.radioCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="单选题分数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.radioScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>

        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="多选题数量" :label-width="formLabelWidth">
              <el-input v-model="showExamData.multiCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="多选题分数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.multiScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="判断题数量" :label-width="formLabelWidth">
              <el-input v-model="showExamData.judgeCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="判断题分数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.judgeScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="简答题数量" :label-width="formLabelWidth">
              <el-input v-model="showExamData.saqCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="简答题分数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.saqScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="填空题数量" :label-width="formLabelWidth">
              <el-input v-model="showExamData.fillCount" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="填空题分数" :label-width="formLabelWidth">
              <el-input v-model="showExamData.fillScore" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="填空需批改" :label-width="formLabelWidth">
              <el-switch
                :value="showExamData.fillNeedMark === 1 || showExamData.fillNeedMark === true"
                disabled
              />
            </el-form-item>
          </el-form>
        </el-col>

      </el-row>
      <div style="display: flex; justify-content: flex-end; with: 100%">
        <el-button @click="showExamDialogVisible = false">关闭详情</el-button>
      </div>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="考试标题  " :label-width="formLabelWidth">
              <el-input v-model="form.title" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="考试时长" :label-width="formLabelWidth">
              <el-input v-model="form.examDuration" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="最大切屏次数" :label-width="formLabelWidth">
              <el-input v-model="form.maxCount" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="及格分" :label-width="formLabelWidth">
              <el-input v-model="form.passedScore" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <!-- <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="考试班级" :label-width="formLabelWidth">
              <el-input v-model="form.address"></el-input>
            </el-form-item>
          </el-form>
        </el-col> -->
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="单选题分数" :label-width="formLabelWidth">
              <el-input v-model="form.radioScore" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="多选题分数" :label-width="formLabelWidth">
              <el-input v-model="form.multiScore" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="判断题分数" :label-width="formLabelWidth">
              <el-input v-model="form.judgeScore" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="简答题分数" :label-width="formLabelWidth">
              <el-input v-model="form.saqScore" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="填空题分数" :label-width="formLabelWidth">
              <el-input v-model="form.fillScore" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="填空需批改" :label-width="formLabelWidth">
              <el-switch
                v-model="form.fillNeedMark"
                :active-value="1"
                :inactive-value="0"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-form>
        </el-col>

      </el-row>
      <div style="display: flex; justify-content: flex-end; width: 100%; align-items: center; gap: 12px; flex-wrap: wrap">
        <span style="flex: 1; font-size: 12px; color: #94a3b8; text-align: left">单题分值请在「查看详情」中设置；此处为题型默认分</span>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateExam()">确 定</el-button>
      </div>
    </el-dialog>
    <back-to-top />
  </div>
</template>

<script>
import { examPaging, examUpdate, examDel } from '@/api/exam'
import pageLoading from '@/mixin/pageLoading'
import BackToTop from '@/components/BackToTop'
export default {
  mixins: [pageLoading],
  components: { BackToTop },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {
      },
      input: '',
      formInline: {
        user: '',
        region: '',
        date1: '',
        date2: ''
      },
      value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      dialogVisible: false,
      showExamDialogVisible: false,
      dialogTableVisible: false,
      dialogFormVisible: false,
      showExamData: {},
      form: {
        name: ''
      },
      cancle() {},
      updateRow(row) {
        this.dialogFormVisible = true
        this.form = row
      },
      diaTitle: '新增',
      formLabelWidth: '110px'
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
    this.getExamPage()
  },
  methods: {
    delExam(row) {
      this.$confirm(
        '删除后将同时清除该考试的作答、成绩、错题本与证书发放记录，且不可恢复。是否继续？',
        '提示',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }
      )
        .then(() => {
          examDel(row.id).then((res) => {
            if (res.code) {
              this.getExamPage(this.pageNum, this.pageSize)
              this.$message({
                type: 'success',
                message: res.msg || '删除成功!'
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
    showExam(row) {
      localStorage.setItem('exam-details-examId', String(row.id))
      this.$router.push({ name: 'exam-details', query: { examId: row.id }})
    },
    updateExam() {
      const data = {
        examDuration: this.form.examDuration,

        judgeScore: this.form.judgeScore,

        maxCount: this.form.maxCount,

        multiScore: this.form.multiScore,

        passedScore: this.form.passedScore,

        radioScore: this.form.radioScore,

        saqScore: this.form.saqScore,

        fillScore: this.form.fillScore,

        fillNeedMark: this.form.fillNeedMark === 1 || this.form.fillNeedMark === true ? 1 : 0,

        title: this.form.title
      }
      examUpdate(this.form.id, data).then((res) => {
        if (res.code) {
          this.getExamPage(this.pageNum, this.pageSize)
          this.dialogFormVisible = false
          this.$message({
            type: 'success',
            message: '修改成功'
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
    async getExamPage(pageNum, pageSize, title = null) {

      await this.withPageLoading(async () => {
        const params = { pageNum: pageNum, pageSize: pageSize, title: title }
        const res = await examPaging(params)
        this.data = res.data

      })

      },
    searchExam() {
      this.getExamPage(this.pageNum, this.pageSize, this.input)
    },

    screenInfo(row) {
      this.$router.push({ name: 'exam-add', query: { zhi: row }})
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getExamPage(this.pageNum, val,this.input)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getExamPage(val, this.pageSize,this.input)
    }
  }
}
</script>
<style>
.exam-manage-table {
  width: 100%;
}

.op-btns {
  white-space: nowrap;
}

.op-btns .el-button {
  margin-left: 4px;
  padding: 0 2px;
}

.op-btns .el-button:first-child {
  margin-left: 0;
}

.datetime-col .cell {
  white-space: nowrap;
}
</style>
