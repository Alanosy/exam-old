<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline">
      <el-form-item label="试卷名称：      ">
        <el-input v-model="searchTitle" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchExamStu">查询</el-button>
      </el-form-item>
    </el-form>
    <div class="sort-switch-container">
      <span class="sort-label">创建时间：</span>
      <el-switch
        v-model="isASC"
        active-text="升序"
        inactive-text="降序"
        active-color="#13ce66"
        inactive-color="#409EFF"
        @change="toggleSort"
      />
    </div>

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
      <el-table-column prop="title" label="试卷名称" align="center" />
      <el-table-column prop="examDuration" label="考试时长（分钟）" align="center" />
      <el-table-column prop="grossScore" label="总分" align="center" />
      <el-table-column prop="passedScore" label="及格分" align="center" />
      <!-- <el-table-column prop="radioCount" label="单选题数量" align="center" width="100"  />
      <el-table-column prop="multiCount" label="多选题数量" align="center" width="100" />
      <el-table-column prop="judgeCount" label="判断题数量" align="center" width="100" />
      <el-table-column prop="saqCount" label="简答题数量" align="center" width="100" /> -->
      <el-table-column prop="startTime" label="开始时间" align="center" />
      <el-table-column prop="endTime" label="结束时间" align="center" />
      <!-- <el-table-column prop="createTime" label="创建时间" align="center" /> -->
      <el-table-column fixed="right" label="操作" align="center" width="120">
        <template slot-scope="{ row }">
          <el-button
            :type="getExamStatus(row).type"
            :disabled="getExamStatus(row).disabled"
            plain
            size="small"
            @click="screenInfo(row)"
          >{{ getExamStatus(row).text }}</el-button>
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
import { getGradeExamList } from '@/api/exam'
export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      searchTitle: '',
      isASC: false, // 默认为降序
      formInline: {
        user: '',
        region: ''
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
  created() {
    this.getExamGradePage()
  },
  methods: {
    // 分页查询
    async getExamGradePage(pageNum, pageSize, searchTitle = null) {
      const params = { pageNum: pageNum, pageSize: pageSize, title: searchTitle, isASC: this.isASC }
      const res = await getGradeExamList(params)
      this.data = res.data
    },

    // 切换排序方式
    toggleSort() {
      this.getExamGradePage(this.pageNum, this.pageSize, this.searchTitle)
    },

    // 考试状态判断
    getExamStatus(row) {
      const now = new Date().getTime()
      const endTime = new Date(row.endTime).getTime()
      const startTime = new Date(row.startTime).getTime()

      if (now > endTime) {
        return {
          text: '已结束',
          type: 'info',
          disabled: true
        }
      } else if (now < startTime) {
        return {
          text: '未开始',
          type: 'warning',
          disabled: true
        }
      } else {
        return {
          text: '开始考试',
          type: 'success',
          disabled: false
        }
      }
    },
    searchExamStu() {
      this.getExamGradePage(this.pageNum, this.pageSize, this.searchTitle)
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getExamGradePage(this.pageNum, val,this.searchTitle)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getExamGradePage(val, this.pageSize,this.searchTitle)
    },
    handleClick(row) {
    },

    screenInfo(row) {
      const status = this.getExamStatus(row)
      if (status.disabled) {
        return
      }
      localStorage.setItem('examInfo_examId', row.id)
      this.$router.push({ name: 'prepare-exam', query: { zhi: row }})
    }
  }
}
</script>

<style>
.el-table .cell {
  white-space: nowrap;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

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
