<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host">
    <!-- form -->

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="试题名称">
        <el-input v-model="searchName" placeholder="输入试题名称" />
      </el-form-item>
      <el-form-item label="所目题库">
        <repo-select
          v-model="selectedRepoSingleSearch"
          @change="handleRepoChangeSingle"
        />
      </el-form-item>
      <el-form-item label="题库类型">
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
      <el-form-item>
        <el-button type="primary" @click="screenInfo()">新增</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fileDialogVisible = true">导入</el-button>
      </el-form-item>
    </el-form>

    <!-- 文件上传 -->
    <el-dialog
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      title="上传文件"
      :visible.sync="fileDialogVisible"
    >
      <!-- v-model="scope.row.repoId" -->
      <!-- @change="repoChange($event, scope.row)" -->
      请选择题库：
      <repo-select
        v-model="selectedRepoSingle"
        style="margin-bottom: 10px"
        @change="handleRepoChangeSingle"
      />
      <el-upload
        class="upload-demo"
        drag
        action="xxxxxx"
        multiple
        :limit="1"
        accept=".xlsx, .xls"
        :auto-upload="false"
        :on-remove="handleRemove"
        :on-change="handleFileChange"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且不超过500kb</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fileDialogVisible = false">取 消</el-button>
        <el-button type="success" plain @click="startDownload">下载模板</el-button>
        <el-button type="primary" @click="importQu">确 定</el-button>
      </div>
    </el-dialog>

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
      <el-table-column show-overflow-tooltip min-width="160" prop="content" label="题干" align="center">
        <template slot-scope="scope">
          <div class="question-content">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="题目类型" align="center" min-width="88">
        <template slot-scope="scope">
          <span v-if="scope.row.quType == 1">单选题</span>
          <span v-else-if="scope.row.quType == 2">多选题</span>
          <span v-else-if="scope.row.quType == 3">判断题</span>
          <span v-else-if="scope.row.quType == 4">简答题</span>
          <span v-else-if="scope.row.quType == 5">填空题</span>
        </template>
      </el-table-column>
      <el-table-column label="难度" align="center" min-width="140">
        <template slot-scope="{ row }">
          <el-rate
            :value="row.level || 3"
            disabled
            :max="5"
            style="display: inline-block; vertical-align: middle"
          />
        </template>
      </el-table-column>
      <el-table-column prop="repoTitle" label="所属题库" align="center" min-width="120" />
      <el-table-column class-name="datetime-col" prop="createTime" label="创建时间" align="center" min-width="160" />
      <el-table-column align="center" label="操作" min-width="250">
        <template slot-scope="{ row }">
          <div class="op-btns">
            <el-tooltip
              content="请先筛选具体题库后再排序"
              placement="top"
              :disabled="!!selectedRepoSingleSearch"
            >
              <span class="op-btn-wrap">
                <el-button
                  type="text"
                  size="small"
                  style="font-size: 14px"
                  :disabled="!selectedRepoSingleSearch"
                  @click="moveQu(row, 'up')"
                >上移</el-button>
              </span>
            </el-tooltip>
            <el-tooltip
              content="请先筛选具体题库后再排序"
              placement="top"
              :disabled="!!selectedRepoSingleSearch"
            >
              <span class="op-btn-wrap">
                <el-button
                  type="text"
                  size="small"
                  style="font-size: 14px"
                  :disabled="!selectedRepoSingleSearch"
                  @click="moveQu(row, 'down')"
                >下移</el-button>
              </span>
            </el-tooltip>
            <el-button
              type="text"
              size="small"
              style="font-size: 14px"
              @click="previewQuestion(row)"
            >预览</el-button>
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
              @click="delQu(row)"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="试题预览（学生端效果）"
      :visible.sync="previewVisible"
      width="680px"
      append-to-body
      @closed="onPreviewClosed"
    >
      <div v-loading="previewLoading">
        <question-preview
          v-if="previewData"
          :qu-type="previewData.quType"
          :content="previewData.content"
          :image="previewData.image"
          :audio="previewData.audio"
          :options="previewData.options"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="previewVisible = false">关 闭</el-button>
      </div>
    </el-dialog>

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
    <!--编辑弹窗-->

    <!-- <el-dialog title="编辑" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="题干" :label-width="formLabelWidth">
              <el-input v-model="form.content" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form :model="form">
            <el-form-item label="所属题库" :label-width="formLabelWidth">
              <el-input v-model="form.repoTitle" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateQu">确 定</el-button>
      </div>
    </el-dialog> -->
    <back-to-top />
  </div>
</template>

<script>
import { quPaging, quDel, quUpdate, importQue, quSort, quDetail } from '@/api/question'
import RepoSelect from '@/components/RepoSelect'
import QuestionPreview from '@/components/QuestionPreview'
import BackToTop from '@/components/BackToTop'

import pageLoading from '@/mixin/pageLoading'
export default {
  mixins: [pageLoading],
  components: { RepoSelect, QuestionPreview, BackToTop },
  data() {
    return {
      options: [
        {
          value: null,
          label: '全部类型'
        },
        {
          value: 1,
          label: '单选题'
        },
        {
          value: 2,
          label: '多选题'
        },
        {
          value: 3,
          label: '判断题'
        },
        {
          value: 4,
          label: '简答题'
        },
        {
          value: 5,
          label: '填空题'
        }
      ],
      length: '',
      fileList: [],
      selValue: '',
      searchName: '',
      pageNum: 1,
      pageSize: 10,
      data: {},
      fileDialogVisible: false,

      selectedRepoSingle: '',
      selectedRepoSingleSearch: '',
      input: '',
      input1: '',
      previewVisible: false,
      previewLoading: false,
      previewData: null,
      formInline: {
        user: '',
        region: ''
      },
      cancle() {},
      dialogTableVisible: false,
      dialogFormVisible: false,
      hasFiles: null,
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
      formLabelWidth: '110px'
    }
  },
  computed: {
    // tables() {
    //   //在你的数据表格中定义tabels
    //   const input = this.input;
    //   const input1 = this.input1;
    //   if (input) {
    //     //  ("input输入的搜索内容：" + this.input)
    //     return this.tableData.filter((data) => {
    //        ("object:" + Object.keys(data));
    //       return Object.keys(data).some((key) => {
    //         return String(data[key]).toLowerCase().indexOf(input) > -1;
    //       });
    //     });
    //   }
    //   if (input1) {
    //     //  ("input输入的搜索内容：" + this.input)
    //     return this.tableData.filter((data) => {
    //        ("object:" + Object.keys(data));
    //       return Object.keys(data).some((key) => {
    //         return String(data[key]).toLowerCase().indexOf(input1) > -1;
    //       });
    //     });
    //   }
    //   return this.tableData;
    // },
  },
  created() {
    this.restoreListState()
    this.getQuPage(
      this.pageNum,
      this.pageSize,
      this.searchName,
      this.selectedRepoSingleSearch,
      this.selValue
    )
  },
  activated() {
    if (this.restoreListState()) {
      this.getQuPage(
        this.pageNum,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue
      )
    }
  },
  methods: {
    handleRepoChangeSingle(repo) {
      ('单选题库变化:', repo)
      // 这里可以进一步处理repo对象，比如更新UI或发送网络请求等
    },
    updateRow(row) {
      this.saveListState()
      localStorage.setItem('quId', row.id)
      this.$router.push({ name: 'questions-add' })
    },
    async previewQuestion(row) {
      this.previewVisible = true
      this.previewLoading = true
      this.previewData = null
      try {
        const res = await quDetail(row.id)
        if (res.code && res.data) {
          this.previewData = {
            quType: res.data.quType,
            content: res.data.content || '',
            image: res.data.image || '',
            audio: res.data.audio || '',
            options: res.data.options || []
          }
        } else {
          this.$message.error(res.msg || '加载预览失败')
          this.previewVisible = false
        }
      } catch (e) {
        this.previewVisible = false
      } finally {
        this.previewLoading = false
      }
    },
    onPreviewClosed() {
      this.previewData = null
      this.previewLoading = false
    },
    async moveQu(row, direction) {
      if (!this.selectedRepoSingleSearch) {
        this.$message.warning('请先筛选具体题库后再调整顺序')
        return
      }
      try {
        const res = await quSort(row.id, direction)
        if (res.code) {
          this.$message.success(res.msg || '排序已更新')
          this.getQuPage(
            this.pageNum,
            this.pageSize,
            this.searchName,
            this.selectedRepoSingleSearch,
            this.selValue
          )
        }
      } catch (e) {
        // 错误已由拦截器提示
      }
    },
    importQu() {
      if (this.fileList && this.fileList.length > 0 && this.selectedRepoSingle  != '') {
        const formData = new FormData() // 创建FormData对象
        formData.append('file', this.fileList[0].raw) // 添加文件到formData
        importQue(this.selectedRepoSingle, formData)
          .then((response) => {
            if (response.code) {
              this.$message.success('导入成功！')
              this.getQuPage(this.pageNum, this.pageSize)
              this.fileDialogVisible = false // 关闭对话框
              // 可以在这里处理成功后的逻辑，如刷新数据等
              // 清空题库选择和文件列表
              this.selectedRepoSingle = ''
              this.fileList = []
            } else {
              this.$message({
                type: 'error',
                message: response.msg
              })
              // 只清空文件列表
              this.fileList = []
            }
          })
          .catch((error) => {
            console.error('文件上传失败：', error)
            this.$message.error('文件上传失败！')
            // 只清空文件列表
            this.fileList = []
          })
      } else {
        this.$message.warning('请选择文件后再上传！')
      }
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList // 收集文件信息
    },
    // 移除文件处理方法
    handleRemove(file, fileList) {
      if (fileList.length === 0) {
        this.hasFiles = false
      }
    },
    // 分页查询
    async getQuPage(pageNum, pageSize, content = null, repoId = null, type = null) {

      await this.withPageLoading(async () => {
        const params = {
          pageNum: pageNum,
          pageSize: pageSize,
          content: content,
          repoId: repoId,
          type: type
        }
        const res = await quPaging(params)
        this.data = res.data

      })

      },
    // 编辑题库
    updateQu() {
      quUpdate(this.form.id, { title: this.form.title })
        .then((res) => {
          if (res.code) {
            this.getQuPage(
              this.pageNum,
              this.pageSize,
              this.searchName,
              this.selectedRepoSingleSearch,
              this.selValue
            )
            this.dialogFormVisible = false
            this.$message({
              type: 'success',
              message: '编辑成功!'
            })
          } else {
            this.$message({
              type: 'info',
              message: res.msg
            })
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '取消编辑'
          })
        })
    },
    // 删除试题
    delQu(row) {
      this.$confirm('此操作将永久删除该试题, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          quDel(row.id).then((res) => {
            if (res.code) {
              this.getQuPage(
                this.pageNum,
                this.pageSize,
                this.searchName,
                this.selectedRepoSingleSearch,
                this.selValue
              )
              // this.tableData.splice(index, 1)
              // this.getQuPage(1);
              this.$message({
                type: 'success',
                message: '删除成功!'
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
    searchQu() {
      this.getQuPage(
        this.pageNum,
        this.pageSize,
        this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue
      )
    },

    screenInfo(row, index, done) {
      this.saveListState()
      this.$router.push({ name: 'questions-add', query: { zhi: row }})
    },
    saveListState() {
      sessionStorage.setItem('questions-list-state', JSON.stringify({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        searchName: this.searchName,
        selectedRepoSingleSearch: this.selectedRepoSingleSearch,
        selValue: this.selValue
      }))
    },
    restoreListState() {
      try {
        const raw = sessionStorage.getItem('questions-list-state')
        if (!raw) return false
        const state = JSON.parse(raw)
        this.pageNum = state.pageNum || 1
        this.pageSize = state.pageSize || 10
        this.searchName = state.searchName || ''
        this.selectedRepoSingleSearch = state.selectedRepoSingleSearch || ''
        this.selValue = state.selValue || ''
        return true
      } catch (e) {
        return false
      }
    },

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getQuPage(this.pageNum, val,this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getQuPage(val, this.pageSize,this.searchName,
        this.selectedRepoSingleSearch,
        this.selValue)
    },
    // 下载模板
    async startDownload() {
      const a = document.createElement('a')
      a.href = './template/ImportQuestionTemplate.xlsx'
      a.download = '导入试题模板.xlsx'
      // 障眼法藏起来a标签
      a.style.display = 'none'
      // 将a标签追加到文档对象中
      document.body.appendChild(a)
      // 模拟点击了<a>标签,会触发<a>标签的href的读取,浏览器就会自动下载了
      a.click()
      // 一次性的,用完就删除a标签
      a.remove()
    }
  }
}
</script>

<style>
/* 题目内容样式 - 支持换行显示 */
.question-content {
  white-space: pre-wrap;
  line-height: 1.6;
  word-wrap: break-word;
}

.op-btns {
  white-space: nowrap;
}

.op-btns .op-btn-wrap,
.op-btns .el-button {
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;
}

.op-btns .op-btn-wrap:first-child,
.op-btns > .el-button:first-child {
  margin-left: 0;
}

.op-btns .op-btn-wrap .el-button {
  margin-left: 0;
  padding: 0 2px;
}

.op-btns > .el-button {
  padding: 0 2px;
}
</style>
