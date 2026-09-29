<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container question-form-page page-loading-host"
  >
    <h3 class="form-page-title">{{ pageTitle }}</h3>
    <el-form
      ref="postForm"
      :model="postForm"
      :rules="rules"
      label-position="left"
      label-width="150px"
    >
      <el-card class="form-card">
        <div class="form-section">
          <h3 class="form-section-title">基本信息</h3>
          <p class="form-section-desc">选择题型与归属题库</p>
          <el-form-item label="题目类型 " prop="quType">
            <el-select
              v-model="postForm.quType"
              :disabled="quTypeDisabled"
              class="filter-item"
              style="width: 400px"
              @change="handleTypeChange"
            >
              <el-option
                v-for="item in quTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="归属题库" prop="repoId">
            <repo-select v-model="postForm.repoId" :multi="false" style="width: 400px" />
          </el-form-item>

          <el-form-item label="难度" prop="level">
            <el-rate
              v-model="postForm.level"
              :max="5"
              show-text
              :texts="levelTexts"
            />
            <span class="level-tip">1 星最易，5 星最难</span>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="form-section-title">题目内容</h3>
          <p class="form-section-desc">
            {{ postForm.quType === 5
              ? '填写题干，在需要挖空处点击「插入填空」；可上传图片或音频'
              : '填写题干，可按需上传图片或音频' }}
          </p>
          <el-form-item label="题目内容" prop="content">
            <div class="blank-toolbar">
              <template v-if="postForm.quType === 5">
                <el-button type="primary" size="mini" plain @click="insertBlank">插入填空</el-button>
                <el-tooltip placement="top" effect="light" popper-class="sync-blank-tooltip">
                  <div slot="content" class="sync-blank-tip-content">
                    <p class="sync-blank-tip-title">「根据题干同步空位」用来按题干里的占位符，重新对齐下方答案行。</p>
                    <p><strong>典型用法：</strong></p>
                    <ul>
                      <li>
                        <strong>手改/粘贴题干：</strong>
                        你直接在题干里写了 &#123;&#123;1&#125;&#125;、&#123;&#123;2&#125;&#125;，或粘贴了带空位的内容，下方答案行数量可能对不上。点一下同步，会按题干里的占位符个数生成/调整「第 1 空、第 2 空…」。
                      </li>
                      <li>
                        <strong>尽量保留已填答案：</strong>
                        同步时会按序号尽量保留原来的答案内容，而不是全部清空。
                      </li>
                    </ul>
                    <p><strong>和「插入填空」的区别：</strong></p>
                    <ul>
                      <li><strong>插入填空：</strong>在光标处插入下一个 &#123;&#123;n&#125;&#125;，同时下方多一行答案。</li>
                      <li><strong>根据题干同步空位：</strong>不往题干里插内容，只根据题干里已有的 &#123;&#123;n&#125;&#125; 对齐下方答案列表。</li>
                    </ul>
                    <p class="sync-blank-tip-foot">
                      一般流程：用「插入填空」挖空即可；只有题干和答案行对不上（手改、粘贴、删乱了）时，再点「根据题干同步空位」。
                    </p>
                  </div>
                  <el-button type="primary" size="mini" plain @click="syncFillOptions">根据题干同步空位</el-button>
                </el-tooltip>
              </template>
              <el-button type="primary" size="mini" plain @click="previewVisible = true">预览</el-button>
              <span v-if="postForm.quType === 5" class="blank-tip">占位符形如 &#123;&#123;1&#125;&#125;，同义答案用 | 分隔，如 北京|北京市</span>
            </div>
            <el-input
              ref="contentInput"
              class="content-textarea"
              v-model="postForm.content"
              type="textarea"
              :rows="12"
              resize="vertical"
              style="width: 1200px; max-width: 100%"
              @blur="saveContentCursor"
            />
          </el-form-item>

          <el-form-item label="试题图片" style="margin-left: 7px">
            <file-upload v-model="postForm.image" accept=".jpg,.jepg,.png" />
          </el-form-item>

          <el-form-item label="试题音频" style="margin-left: 7px">
            <file-upload
              v-model="postForm.audio"
              accept=".mp3,audio/mpeg"
              list-type="text"
              action="api/questions/uploadAudio"
              :limit="5"
              tips="仅支持 mp3，单个不超过 10MB，最多 5 个"
            />
            <audio-player :src="postForm.audio" />
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="form-section-title">整题解析</h3>
          <p class="form-section-desc">可选，用于考试后核对答案说明</p>
          <el-form-item label="整题解析" prop="oriPrice" style="margin-left: 7px">
            <el-input
              v-model="postForm.analysis"
              :precision="1"
              :max="999999"
              type="textarea"
              :rows="12"
              resize="vertical"
              style="width: 1200px; max-width: 100%"
            />
          </el-form-item>
        </div>
      </el-card>

      <el-card class="form-card options-card">
        <div class="form-section">
          <h3 class="form-section-title">{{ optionsSectionTitle }}</h3>
          <p class="form-section-desc">{{ optionsSectionDesc }}</p>

          <!-- 单选/多选/判断 -->
          <div
            v-if="postForm.quType != 4 && postForm.quType != 5"
            class="filter-container"
          >
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-plus"
              size="small"
              plain
              @click="handleAdd"
            >
              添加
            </el-button>

            <el-table :data="postForm.options.filter(option => !option.isDeleted)" :border="true" style="width: 90%">
              <el-table-column label="编号" width="80" align="center">
                <template v-slot="scope">
                  {{ optionLetter(scope.$index) }}
                </template>
              </el-table-column>

              <el-table-column label="是否答案" width="120" align="center">
                <template v-slot="scope">
                  <el-checkbox v-model="scope.row.isRight">答案</el-checkbox>
                </template>
              </el-table-column>

              <el-table-column
                v-if="itemImage"
                label="选项图片"
                width="120px"
                align="center"
              >
                <template v-slot="scope">
                  <file-upload v-model="scope.row.image" accept=".jpg,.jepg,.png" />
                </template>
              </el-table-column>

              <el-table-column label="答案内容">
                <template v-slot="scope">
                  <el-input v-model="scope.row.content" type="textarea" />
                </template>
              </el-table-column>

              <el-table-column label="操作" align="center" width="100px">
                <template v-slot="scope">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    @click="removeItem(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 简答 -->
          <el-table
            v-if="postForm.quType == 4"
            :data="postForm.options"
            :border="true"
            style="width: 90%"
          >
            <el-table-column label="答案内容">
              <template v-slot="scope">
                <el-input v-model="scope.row.content" type="textarea" />
              </template>
            </el-table-column>
          </el-table>

          <!-- 填空 -->
          <el-table
            v-if="postForm.quType == 5"
            :data="postForm.options"
            :border="true"
            style="width: 90%"
          >
            <el-table-column label="空序号" width="100" align="center">
              <template v-slot="scope">
                第 {{ scope.$index + 1 }} 空
              </template>
            </el-table-column>
            <el-table-column label="标准答案（同义用 | 分隔）">
              <template v-slot="scope">
                <el-input v-model="scope.row.content" placeholder="如：北京|北京市" />
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="100px">
              <template v-slot="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  circle
                  @click="removeFillBlank(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <div class="form-actions">
        <el-button type="primary" @click="submitForm">保存</el-button>
        <el-button plain @click="onCancel">返回</el-button>
      </div>
    </el-form>

    <el-dialog
      title="试题预览（学生端效果）"
      :visible.sync="previewVisible"
      width="680px"
      append-to-body
    >
      <question-preview
        :qu-type="postForm.quType"
        :content="postForm.content"
        :image="postForm.image"
        :audio="postForm.audio"
        :options="postForm.options"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="previewVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
    <back-to-top />
  </div>
</template>

<script>
import { fetchDetail, quAdd, quDetail, quUpdate } from '@/api/question'
import RepoSelect from '@/components/RepoSelect'
import FileUpload from '@/components/FileUpload'
import AudioPlayer from '@/components/AudioPlayer'
import QuestionPreview from '@/components/QuestionPreview'
import BackToTop from '@/components/BackToTop'
import pageLoading from '@/mixin/pageLoading'
import {
  insertBlankAt,
  syncOptionsFromContent,
  validateBlanks,
  parseBlankIndexes
} from '@/utils/blankPlaceholder'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default {

  name: 'QuDetail',
  components: { FileUpload, RepoSelect, AudioPlayer, QuestionPreview, BackToTop },
  mixins: [pageLoading],

  data() {
    return {
      quId: '',
      quTypeDisabled: false,
      itemImage: true,
      contentCursor: { start: 0, end: 0 },
      previewVisible: false,

      levels: [
        { value: 1, label: '很简单' },
        { value: 2, label: '简单' },
        { value: 3, label: '一般' },
        { value: 4, label: '较难' },
        { value: 5, label: '很难' }
      ],
      levelTexts: ['很简单', '简单', '一般', '较难', '很难'],

      quTypes: [
        { value: 1, label: '单选题' },
        { value: 2, label: '多选题' },
        { value: 3, label: '判断题' },
        { value: 4, label: '简答题' },
        { value: 5, label: '填空题' }
      ],

      postForm: {
        repoId: '',
        level: 3,
        options: []
      },
      rules: {
        content: [{ required: true, message: '题目内容不能为空！' }],
        quType: [{ required: true, message: '题目类型不能为空！' }],
        level: [{ required: true, message: '必须选择难度等级！' }],
        repoId: [{ required: true, message: '请先选择题库！' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.quId
    },
    pageTitle() {
      return this.isEdit ? '编辑题目' : '新增题目'
    },
    optionsSectionTitle() {
      if (this.postForm.quType == 4) return '参考答案'
      if (this.postForm.quType == 5) return '填空答案'
      return '选项答案'
    },
    optionsSectionDesc() {
      if (this.postForm.quType == 4) return '填写简答题参考答案'
      if (this.postForm.quType == 5) return '按空填写标准答案，与题干占位符一一对应'
      return '勾选正确答案，可继续添加选项'
    }
  },
  created() {
    const id = this.$route.params.id
    if (typeof id !== 'undefined') {
      this.quTypeDisabled = true
      this.fetchData(id)
    }
    this.quId = localStorage.getItem('quId')
    if (this.quId) {
      this.quTypeDisabled = true
      this.applyPageTitle()
      this.getQuDetail()
    } else {
      this.applyPageTitle()
    }
  },
  beforeDestroy() {
    localStorage.removeItem('quId')
    this.postForm = {}
  },
  methods: {
    optionLetter(index) {
      return LETTERS[index] || `(${index + 1})`
    },
    applyPageTitle() {
      const title = this.pageTitle
      if (this.$route.meta) {
        this.$route.meta.title = title
      }
      document.title = `${title} - 在线考试系统`
      this.$store.commit('menu/UPDATE_TAG_TITLE', {
        path: this.$route.path,
        title
      })
    },
    async getQuDetail() {
      await this.withPageLoading(async() => {
        const res = await quDetail(this.quId)
        if (res.code) {
          res.data.options.forEach(item => {
            item.isRight = !!item.isRight
          })
          this.postForm = res.data
          if (!this.postForm.level) {
            this.$set(this.postForm, 'level', 3)
          }
          this.postForm.options = (this.postForm.options || [])
            .slice()
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
        }
      })
    },
    handleTypeChange(v) {
      this.postForm.options = []
      if (v === 3) {
        this.postForm.options.push({ isRight: true, content: '正确' })
        this.postForm.options.push({ isRight: false, content: '错误' })
      }
      if (v === 1 || v === 2) {
        this.postForm.options.push({ isRight: false, content: '' })
        this.postForm.options.push({ isRight: false, content: '' })
        this.postForm.options.push({ isRight: false, content: '' })
        this.postForm.options.push({ isRight: false, content: '' })
      }
      if (v === 4) {
        this.postForm.options.push({ isRight: true, content: '' })
      }
      if (v === 5) {
        this.postForm.options = []
      }
    },
    saveContentCursor(e) {
      const el = e && e.target
      if (el) {
        this.contentCursor = {
          start: el.selectionStart || 0,
          end: el.selectionEnd || 0
        }
      }
    },
    insertBlank() {
      const text = this.postForm.content || ''
      const { start, end } = this.contentCursor
      const result = insertBlankAt(text, start, end)
      this.$set(this.postForm, 'content', result.content)
      this.postForm.options.push({
        isRight: true,
        content: '',
        sort: result.nextIndex
      })
      this.contentCursor = {
        start: start + result.token.length,
        end: start + result.token.length
      }
      this.$nextTick(() => {
        const textarea = this.$refs.contentInput && this.$refs.contentInput.$refs.textarea
        if (textarea) {
          textarea.focus()
          textarea.setSelectionRange(this.contentCursor.start, this.contentCursor.end)
        }
      })
    },
    syncFillOptions() {
      this.postForm.options = syncOptionsFromContent(this.postForm.content, this.postForm.options)
      this.$message.success(`已同步 ${this.postForm.options.length} 个填空`)
    },
    removeFillBlank(index) {
      const indexes = parseBlankIndexes(this.postForm.content || '')
      const target = indexes[index]
      if (target != null) {
        const re = new RegExp(`\\{\\{${target}\\}\\}`, 'g')
        let content = (this.postForm.content || '').replace(re, '')
        // 重编号剩余占位符
        const remain = parseBlankIndexes(content)
        remain.forEach((oldIdx, i) => {
          const neu = i + 1
          if (oldIdx !== neu) {
            content = content.replace(new RegExp(`\\{\\{${oldIdx}\\}\\}`, 'g'), `{{TMP${neu}}}`)
          }
        })
        content = content.replace(/\{\{TMP(\d+)\}\}/g, '{{$1}}')
        this.$set(this.postForm, 'content', content)
      }
      this.postForm.options.splice(index, 1)
      this.postForm.options.forEach((opt, i) => {
        opt.sort = i + 1
      })
    },
    handleAdd() {
      this.postForm.options.push({ isRight: false, content: '' })
    },
    removeItem(index) {
      const actualIndex = this.postForm.options.findIndex((option, idx) => {
        return idx === index && !option.isDeleted
      })
      if (actualIndex !== -1) {
        this.postForm.options[actualIndex].isDeleted = 1
        let visibleSort = 0
        this.postForm.options.forEach(option => {
          if (!option.isDeleted) {
            option.sort = visibleSort
            visibleSort += 1
          }
        })
      }
    },
    fetchData(id) {
      this.withPageLoading(async() => {
        const response = await fetchDetail(id)
        this.postForm = response.data
      })
    },
    submitForm() {
      let rightCount = 0
      this.postForm.options.forEach(function(item) {
        if (item.isRight) {
          rightCount += 1
        }
      })

      if (this.postForm.quType === 1) {
        if (rightCount !== 1) {
          this.$message({ message: '单选题答案只能有一个', type: 'warning' })
          return
        }
      }
      if (this.postForm.quType === 2) {
        if (rightCount < 2) {
          this.$message({ message: '多选题至少要有两个正确答案！', type: 'warning' })
          return
        }
      }
      if (this.postForm.quType === 3) {
        if (rightCount !== 1) {
          this.$message({ message: '判断题只能有一个正确项！', type: 'warning' })
          return
        }
      }
      if (this.postForm.quType === 5) {
        const err = validateBlanks(this.postForm.content, (this.postForm.options || []).length)
        if (err) {
          this.$message({ message: err, type: 'warning' })
          return
        }
        const empty = (this.postForm.options || []).some(o => !o.content || !String(o.content).trim())
        if (empty) {
          this.$message({ message: '填空题每空答案不能为空', type: 'warning' })
          return
        }
      }

      this.$refs.postForm.validate((valid) => {
        if (!valid) {
          return
        }
        let visibleSort = 0
        for (let i = 0; i < this.postForm.options.length; i++) {
          const option = this.postForm.options[i]
          option.isRight = option.isRight ? 1 : 0
          if (this.postForm.quType === 5) {
            option.isRight = 1
            option.sort = i + 1
          } else if (this.postForm.quType !== 4 && !option.isDeleted) {
            option.sort = visibleSort
            visibleSort += 1
          }
        }

        if (this.quId) {
          quUpdate(this.quId, this.postForm).then(res => {
            if (res.code) {
              this.$notify({ title: '成功', message: `${res.msg}`, type: 'success', duration: 2000 })
              this.$router.push({ name: 'questions-management' })
            } else {
              this.$notify({ title: '失败', message: `${res.msg}`, type: 'error', duration: 2000 })
            }
          })
        } else {
          quAdd(this.postForm).then((response) => {
            if (response.code) {
              this.$notify({ title: '成功', message: '试题保存成功！', type: 'success', duration: 2000 })
              this.$router.push({ name: 'questions-management' })
            } else {
              this.$notify({ title: '失败', message: `${response.msg}`, type: 'error', duration: 2000 })
            }
          })
        }
      })
    },
    onCancel() {
      this.$router.push({ name: 'questions-management' })
    }
  }
}
</script>

<style scoped>
.form-page-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #0f766e;
}

.question-form-page .form-card {
  margin-bottom: 16px;
  border-radius: 16px;
}

.question-form-page .options-card {
  margin-top: 4px;
}

.form-actions {
  margin-top: 8px;
  padding: 4px 0 12px;
}

.blank-toolbar {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.blank-toolbar >>> .el-button,
.blank-toolbar >>> .el-button + .el-button {
  margin: 0;
}

.blank-toolbar >>> .el-tooltip {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.blank-tip {
  color: #94a3b8;
  font-size: 12px;
  line-height: 28px;
}

.sync-blank-tip-content {
  max-width: 420px;
  line-height: 1.6;
  color: #334155;
}

.sync-blank-tip-title {
  margin: 0 0 8px;
  font-weight: 600;
  color: #0f766e;
}

.sync-blank-tip-content p {
  margin: 0 0 6px;
}

.sync-blank-tip-content ul {
  margin: 0 0 8px;
  padding-left: 1.2em;
}

.sync-blank-tip-content li {
  margin-bottom: 4px;
}

.sync-blank-tip-foot {
  margin-bottom: 0 !important;
  color: #64748b;
}

.el-button--primary.is-plain {
  color: #0d9488;
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.35);
}

.blank-toolbar .el-button--primary.is-plain {
  margin: 0;
}

.el-form-item {
  margin-bottom: 22px;
}

.content-textarea >>> .el-textarea__inner {
  min-height: 120px;
  height: 260px;
  font-size: 14px;
  line-height: 1.5;
}

.el-form-item__label {
  font-weight: 500;
}

.level-tip {
  margin-left: 12px;
  color: #94a3b8;
  font-size: 13px;
}
</style>
