<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="题库名称">
        <el-input v-model="searchTitle" placeholder="题库名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="searchExam">查询</el-button>
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
      <el-table-column prop="title" align="center" label="题库名称" />
      <el-table-column prop="createTime" align="center" label="刷题时间" />
      <!-- <el-table-column prop="cjsj" align="center" label="已刷题数"> </el-table-column> -->
      <el-table-column align="center" label="操作">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
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
    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="序号  " :label-width="formLabelWidth">
              <el-input v-model="form.xh" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="班级名称" :label-width="formLabelWidth">
              <el-input v-model="form.sjmc" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="班级口令" :label-width="formLabelWidth">
              <el-input v-model="form.ctsl" :disabled="true" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="班级   " :label-width="formLabelWidth">
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
import { recordExercisePaging } from '@/api/record'
export default {
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      input: '',
      searchTitle: '',
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
        localStorage.setItem('record_exercise_repoId', row.id)
        this.$router.push({ name: 'exercise-record-detail', query: { zhi: row }})
        // this.dialogFormVisible = true;
        // this.form = row;
      },
      diaTitle: '新增',
      dialogTableVisible: false,

      dialogFormVisible: false,
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
    this.getExerciseRecordPaging()
  },
  methods: {
    searchExam() {
      this.getExerciseRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },
    // 分页查询
    async getExerciseRecordPaging(pageNum, pageSize, repoName) {
      const params = { pageNum: pageNum, pageSize: pageSize, repoName: repoName }
      const res = await recordExercisePaging(params)
      this.data = res.data
    },
    onSubmit() {
      //  ("submit!");
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getExerciseRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.getExerciseRecordPaging(this.pageNum, this.pageSize, this.searchTitle)
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
.qb {
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
