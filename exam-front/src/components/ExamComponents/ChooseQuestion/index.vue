<template>
  <div class="app-container">
    <!-- form -->
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="试题名称">
        <el-input v-model="searchName" placeholder="输入试题名称" />
      </el-form-item>
      <el-form-item label="所属题库">
        <repo-select
          v-model="selectedRepoSingleSearch"
          @change="handleRepoChangeSingle"
        />
      </el-form-item>
      <el-form-item label="题目类型">
        <el-select v-model="selValue" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchQu">查询</el-button>
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="单选分数" v-if="singleChoiceQuestions">
        <el-input
          v-model="questionList.radioScore"
          placeholder="输入试题名称"
          @change = "scoreFun"
        />
      </el-form-item>
      <el-form-item label="多选分数" v-if="multipleChoiceQuestions">
        <el-input
          v-model="questionList.multiScore"
          placeholder="输入试题名称"
          @change = "scoreFun"
        />
      </el-form-item>
      <el-form-item label="判断分数" v-if="trueOrFalseQuestions">
        <el-input
          v-model="questionList.judgeScore"
          placeholder="输入试题名称"
        @change = "scoreFun"
        />
      </el-form-item>
      <el-form-item label="简答分数" v-if="shortAnswerQuestions">
        <el-input v-model="questionList.saqScore" placeholder="输入试题名称" @change = "scoreFun"/>
      </el-form-item>
    </el-form>
    <!-- table -->

    <el-table
      :data="data.records"
      border
      fit
      @selection-change="handleSelectionChange"
      highlight-current-row
      :header-cell-style="{
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
      ref="multipleTable"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
        :reserve-selection="true"
      />
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="content" label="题干" align="center" />
      <el-table-column label="题目类型" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.quType == 1">单选题</span>
          <span v-else-if="scope.row.quType == 2">多选题</span>
          <span v-else-if="scope.row.quType == 3">判断题</span>
          <span v-else-if="scope.row.quType == 4">简答题</span>
        </template>
      </el-table-column>
      <el-table-column prop="repoTitle" label="所属题库" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
    </el-table>

    <!-- 分页 -->
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
import { quPaging, quDel, quUpdate, importQue } from "@/api/question";
import RepoSelect from "@/components/RepoSelect";

export default {
  components: { RepoSelect },
  data() {
    return {
      singleChoiceQuestions: false,
      multipleChoiceQuestions: false,
      trueOrFalseQuestions: false,
      shortAnswerQuestions: false,

      options: [
        {
          value: null,
          label: "全部类型",
        },
        {
          value: 1,
          label: "单选题",
        },
        {
          value: 2,
          label: "多选题",
        },
        {
          value: 3,
          label: "判断题",
        },
        {
          value: 4,
          label: "简答题",
        },
      ],
      length: "",
      fileList: [],
      selValue: "",
      searchName: "",
      pageNum: 1,
      pageSize: 10,
      data: {},
      fileDialogVisible: false,

      selectedRepoSingle: "",
      selectedRepoSingleSearch: "",
      input: "",
      input1: "",
      formInline: {
        user: "",
        region: "",
      },
      // 题库
      questionList: {
        radioCount: 0,
        radioScore: 0,
        multiCount: 0,
        multiScore: 0,
        judgeCount: 0,
        judgeScore: 0,
        saqCount: 0,
        saqScore: 0,
      },
      cancle() {},
      dialogTableVisible: false,
      dialogFormVisible: false,
      hasFiles: null,
      form: {
        name: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: "",
      },
      selectedRows: [], // 存储所有选中的行数据
      formLabelWidth: "110px",
    };
  },
  computed: {
    selectedIds() {
      return this.selectedRows.map((item) => item.id);
    },
  },
  created() {
    this.getQuPage();
  },
  methods: {
    handleRepoChangeSingle(repo) {
      console.log("单选题库变化:", repo);
    },
    updateRow(row) {
      localStorage.setItem("quId", row.id);
      this.$router.push({ name: "questions-add" });
    },

    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },

    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false;
      }
    },

    async getQuPage(
      pageNum,
      pageSize,
      content = null,
      repoId = null,
      type = null
    ) {
      const params = {
        pageNum: pageNum,
        pageSize: pageSize,
        content: content,
        repoId: repoId,
        type: type,
      };
      const res = await quPaging(params);
      this.data = res.data;

      // 数据加载完成后，设置选中状态
      this.$nextTick(() => {
        this.data.records.forEach((row) => {
          if (this.selectedIds.includes(row.id)) {
            this.$refs.multipleTable.toggleRowSelection(row, true);
          }
        });
      });
    },

    searchQu() {
      this.pageNum = 1; // 搜索时重置页码
      this.getQuPage(
        this.pageNum,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue
      );
    },

    screenInfo(row, index, done) {
      this.$router.push({ name: "questions-add", query: { zhi: row } });
    },

    handleSizeChange(val) {
      this.pageSize = val;
       this.pageNum,
        this.pageSize,

      this.getQuPage(this.pageNum,
        val,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue);
    },

    handleCurrentChange(val) {
      this.pageNum = val;
      this.getQuPage(
        val,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue);
    },
    scoreFun(){
      this.questionList.radioCount = 0;
      this.questionList.multiCount = 0;
      this.questionList.judgeCount = 0;
      this.questionList.saqCount = 0;

      this.singleChoiceQuestions = false;
      this.multipleChoiceQuestions = false;
      this.trueOrFalseQuestions = false;
      this.shortAnswerQuestions = false;
      this.selectedRows.forEach((item) => {
        if (item.quType == 1) {
          this.questionList.radioCount += 1;
          this.singleChoiceQuestions = true;
        }
        if (item.quType == 2) {
          this.questionList.multiCount += 1;
          this.multipleChoiceQuestions = true;
        }
        if (item.quType == 3) {
          this.questionList.judgeCount += 1;
          this.trueOrFalseQuestions = true;
        }
        if (item.quType == 4) {
          this.questionList.saqCount += 1;
          this.shortAnswerQuestions = true;
        }
      });
      if (this.questionList.radioCount === 0) {
        this.questionList.radioScore = 0;
      }
      if (this.questionList.multiCount === 0) {
        this.questionList.multiScore = 0;
      }
      if (this.questionList.judgeCount === 0) {
        this.questionList.judgeScore = 0;
      }
      if (this.questionList.saqCount === 0) {
        this.questionList.saqScore = 0;
      }
      const data = {
        selectedRows: this.selectedRows,
        questionList: this.questionList,
      };
      console.log("this.selectedRows", this.selectedRows);
      // 触发自定义事件，将选中的ID数组传递给父组件
      this.$emit("selected-change", data);
    },
    handleSelectionChange(val) {
      // 合并新旧选中项，去重
      const newSelected = [...this.selectedRows];
      // 添加新选中的项
      val.forEach((item) => {
        if (!this.selectedIds.includes(item.id)) {
          newSelected.push(item);
        }
      });

      // 移除取消选中的项
      const currentPageIds = this.data.records.map((item) => item.id);
      this.selectedRows = newSelected.filter((item) => {
        // 如果当前行在当前页且未被选中，则移除
        if (
          currentPageIds.includes(item.id) &&
          !val.some((v) => v.id === item.id)
        ) {
          return false;
        }
        return true;
      });

      this.questionList.radioCount = 0;
      this.questionList.multiCount = 0;
      this.questionList.judgeCount = 0;
      this.questionList.saqCount = 0;

      this.singleChoiceQuestions = false;
      this.multipleChoiceQuestions = false;
      this.trueOrFalseQuestions = false;
      this.shortAnswerQuestions = false;
      this.selectedRows.forEach((item) => {
        if (item.quType == 1) {
          this.questionList.radioCount += 1;
          this.singleChoiceQuestions = true;
        }
        if (item.quType == 2) {
          this.questionList.multiCount += 1;
          this.multipleChoiceQuestions = true;
        }
        if (item.quType == 3) {
          this.questionList.judgeCount += 1;
          this.trueOrFalseQuestions = true;
        }
        if (item.quType == 4) {
          this.questionList.saqCount += 1;
          this.shortAnswerQuestions = true;
        }
      });
      if (this.questionList.radioCount === 0) {
        this.questionList.radioScore = 0;
      }
      if (this.questionList.multiCount === 0) {
        this.questionList.multiScore = 0;
      }
      if (this.questionList.judgeCount === 0) {
        this.questionList.judgeScore = 0;
      }
      if (this.questionList.saqCount === 0) {
        this.questionList.saqScore = 0;
      }

      const data = {
        selectedRows: this.selectedRows,
        questionList: this.questionList,
      };
      console.log("data",data)
      console.log("this.selectedRows", this.selectedRows);
      // 触发自定义事件，将选中的ID数组传递给父组件
      this.$emit("selected-change", data);
    },

    // 清空所有选中
    clearSelection() {
      this.selectedRows = []; // 清空内部存储
      this.$refs.multipleTable.clearSelection(); // 清空表格UI的选中状态
    },
  },
};
</script>
