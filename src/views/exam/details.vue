<template>
  <div
    v-loading="loading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container exam-details-page page-loading-host"
  >
    <el-form
      v-if="examInfo.id"
      ref="form"
      :model="form"
      class="detail-form"
      label-width="100px"
      label-position="right"
      size="small"
    >
      <el-form-item label="试卷名称" required>
        <el-input v-model="form.title" maxlength="20" show-word-limit placeholder="请输入试卷名称" />
      </el-form-item>

      <el-form-item label="班级列表" required>
        <div class="grade-row">
          <div class="grade-tags">
            <el-tag
              v-for="item in selectedClasses"
              :key="item.id"
              size="small"
              effect="plain"
              class="grade-tag"
            >{{ item.name }}</el-tag>
            <span v-if="!selectedClasses.length" class="empty-tip">暂未选择班级</span>
          </div>
          <el-button type="primary" plain size="mini" icon="el-icon-edit" @click="openClassDialog">编辑</el-button>
        </div>
      </el-form-item>

      <el-form-item label="试卷总分">
        <span class="total-score">{{ totalScore }}</span>
        <span class="inline-unit">分（题目合计）</span>
        <span class="inline-label">总分</span>
        <el-input-number v-model="form.fullScore" :min="1" controls-position="right" />
        <span class="inline-unit">分（必填，须等于题目合计）</span>
        <span class="inline-label">及格分</span>
        <el-input-number v-model="form.passedScore" :min="0" :max="form.fullScore || totalScore || 9999" controls-position="right" />
        <span class="inline-unit">分</span>
      </el-form-item>

      <el-form-item label="题型默认分">
        <div class="score-row">
          <span class="score-item">
            单选
            <el-input-number
              v-model="scores.radioScore"
              :min="0"
              :disabled="!typeCounts.radio"
              controls-position="right"
              size="mini"
            />
            分
            <el-button
              type="text"
              size="mini"
              :disabled="!typeCounts.radio"
              @click="applyDefaultScore(1)"
            >同步到本类</el-button>
          </span>
          <span class="score-item">
            多选
            <el-input-number
              v-model="scores.multiScore"
              :min="0"
              :disabled="!typeCounts.multi"
              controls-position="right"
              size="mini"
            />
            分
            <el-button
              type="text"
              size="mini"
              :disabled="!typeCounts.multi"
              @click="applyDefaultScore(2)"
            >同步到本类</el-button>
          </span>
          <span class="score-item">
            判断
            <el-input-number
              v-model="scores.judgeScore"
              :min="0"
              :disabled="!typeCounts.judge"
              controls-position="right"
              size="mini"
            />
            分
            <el-button
              type="text"
              size="mini"
              :disabled="!typeCounts.judge"
              @click="applyDefaultScore(3)"
            >同步到本类</el-button>
          </span>
          <span class="score-item">
            简答
            <el-input-number
              v-model="scores.saqScore"
              :min="0"
              :disabled="!typeCounts.saq"
              controls-position="right"
              size="mini"
            />
            分
            <el-button
              type="text"
              size="mini"
              :disabled="!typeCounts.saq"
              @click="applyDefaultScore(4)"
            >同步到本类</el-button>
          </span>
          <span class="score-item">
            填空
            <el-input-number
              v-model="scores.fillScore"
              :min="0"
              :disabled="!typeCounts.fill"
              controls-position="right"
              size="mini"
            />
            分
            <el-button
              type="text"
              size="mini"
              :disabled="!typeCounts.fill"
              @click="applyDefaultScore(5)"
            >同步到本类</el-button>
          </span>
        </div>
        <div class="form-tip">默认分用于新加题目；可在每道题上单独改分。点「同步到本类」会覆盖该类全部题目分值。</div>
      </el-form-item>

      <el-form-item v-if="typeCounts.fill" label="填空需批改">
        <el-switch
          v-model="form.fillNeedMark"
          active-text="需人工批改"
          inactive-text="自动判分"
        />
      </el-form-item>

      <el-form-item label="考试时间" required>
        <el-date-picker
          v-model="form.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 400px"
        />
      </el-form-item>

      <el-form-item label="切屏次数">
        <el-input-number v-model="form.maxCount" :min="0" controls-position="right" />
      </el-form-item>

      <el-form-item label="试卷内容">
        <div class="section-toolbar">
          <el-button type="text" size="mini" @click="expandAllSections">全部展开</el-button>
          <el-button type="text" size="mini" @click="collapseAllSections">全部折叠</el-button>
        </div>
      </el-form-item>

      <el-collapse v-model="activeSections" class="question-collapse">
        <el-collapse-item
          v-for="(section, sIdx) in questionSections"
          :key="section.type"
          :name="String(section.type)"
        >
          <template slot="title">
            <div class="collapse-title">
              <span class="collapse-title-main">标题{{ sIdx + 1 }} · {{ section.label }}</span>
              <el-tag size="mini" type="info" effect="plain">{{ section.list.length }} 题</el-tag>
              <span class="collapse-score">{{ sectionScore(section) }} 分</span>
              <el-button
                type="success"
                size="mini"
                @click.stop.prevent="openAddDialog(section.type)"
              >添加题目</el-button>
            </div>
          </template>

          <div class="question-box collapse-body">
            <div
              v-for="(item, qIdx) in section.list"
              :key="item.questionId || qIdx"
              class="question-item"
            >
              <div class="question-item-head">
                <span class="q-label">题目{{ qIdx + 1 }}</span>
                <el-rate
                  class="q-level"
                  :value="item.level || 3"
                  disabled
                  :max="5"
                />
                <span class="q-score-edit">
                  分值
                  <el-input-number
                    v-model="item.score"
                    :min="0"
                    :max="999"
                    size="mini"
                    controls-position="right"
                    @click.native.stop
                  />
                </span>
                <el-button type="danger" size="mini" plain @click="removeQuestion(item)">删除</el-button>
              </div>
              <div class="question-body question-content">{{ item.quType === 5 ? renderStemWithBlanks(item.title) : item.title }}</div>

              <div v-if="item.image" class="media-wrap">
                <el-image
                  :src="item.image"
                  :preview-src-list="[item.image]"
                  fit="contain"
                  style="max-height: 160px"
                />
              </div>
              <audio-player v-if="item.audio" :src="item.audio" />

              <div
                v-if="item.quType === 1 || item.quType === 2 || item.quType === 3"
                class="options-list"
              >
                <div
                  v-for="(opt, optIdx) in item.option || []"
                  :key="optIdx"
                  class="option-line"
                  :class="{ right: opt.isRight }"
                >
                  <span class="opt-letter">{{ numberToLetter(optIdx) }}.</span>
                  <span class="option-content">{{ opt.content }}</span>
                </div>
              </div>

              <div v-if="item.quType === 4" class="meta-block">
                <div class="meta-line">
                  <span class="meta-label">参考答案：</span>{{ item.rightOption || '暂无' }}
                </div>
              </div>

              <div v-if="item.quType === 5" class="meta-block">
                <div class="meta-line">
                  <span class="meta-label">参考答案：</span>{{ item.rightOption || '暂无' }}
                </div>
              </div>

              <div class="meta-block">
                <div v-if="item.quType !== 4 && item.quType !== 5" class="meta-line">
                  <span class="meta-label">正确答案：</span>
                  {{ numberToLetter(item.rightOption) || item.rightOption || '-' }}
                </div>
                <div class="meta-line">
                  <span class="meta-label">试题解析：</span>{{ item.analyse || '暂无解析' }}
                </div>
              </div>
            </div>
            <div v-if="!section.list.length" class="empty-section">暂无题目，请点击「添加题目」</div>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 若某题型尚无题目，仍提供一个可添加入口 -->
      <el-form-item v-if="missingTypes.length" label="补充题型">
        <el-button
          v-for="t in missingTypes"
          :key="t"
          type="success"
          size="mini"
          plain
          @click="openAddDialog(t)"
        >添加{{ quTypeLabel(t) }}</el-button>
      </el-form-item>

      <el-form-item label="建议时长" required>
        <el-input-number v-model="form.examDuration" :min="1" controls-position="right" />
        <span class="inline-unit">分钟</span>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        <el-button @click="loadPage">重置</el-button>
      </el-form-item>
    </el-form>

    <el-empty v-else-if="!loading" description="暂无考试信息" />

    <!-- 实时分数悬浮面板 -->
    <div v-if="examInfo.id" class="score-float" :class="{ collapsed: floatCollapsed }">
      <div class="score-float-head">
        <span>实时统计</span>
        <el-button
          type="text"
          class="score-float-toggle"
          :icon="floatCollapsed ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="floatCollapsed = !floatCollapsed"
        />
      </div>
      <template v-if="!floatCollapsed">
        <div class="score-float-total">
          <span class="num">{{ totalScore }}</span>
          <span class="unit">分</span>
        </div>
        <div class="score-float-sub">共 {{ questionList.length }} 题 · 及格 {{ form.passedScore || 0 }} 分</div>
        <div
          v-if="Number(form.fullScore) > 0"
          class="score-float-gap"
          :class="scoreGapClass"
        >
          {{ scoreGapText }}
        </div>
        <ul class="score-float-list">
          <li>
            <span>单选</span>
            <b>{{ typeCounts.radio }}</b>
            <em>题</em>
            <strong>{{ typeScoreSum(1) }}</strong>
          </li>
          <li>
            <span>多选</span>
            <b>{{ typeCounts.multi }}</b>
            <em>题</em>
            <strong>{{ typeScoreSum(2) }}</strong>
          </li>
          <li>
            <span>判断</span>
            <b>{{ typeCounts.judge }}</b>
            <em>题</em>
            <strong>{{ typeScoreSum(3) }}</strong>
          </li>
          <li>
            <span>简答</span>
            <b>{{ typeCounts.saq }}</b>
            <em>题</em>
            <strong>{{ typeScoreSum(4) }}</strong>
          </li>
          <li>
            <span>填空</span>
            <b>{{ typeCounts.fill }}</b>
            <em>题</em>
            <strong>{{ typeScoreSum(5) }}</strong>
          </li>
        </ul>
        <el-button
          type="primary"
          size="mini"
          class="score-float-save"
          :loading="saving"
          @click="handleSave"
        >保存</el-button>
      </template>
    </div>

    <!-- 选题弹窗 -->
    <el-dialog
      title="添加题目"
      :visible.sync="addDialogVisible"
      width="860px"
      append-to-body
      @open="onAddDialogOpen"
    >
      <el-form :inline="true" size="small">
        <el-form-item label="试题名称">
          <el-input v-model="picker.searchName" clearable placeholder="题干关键词" />
        </el-form-item>
        <el-form-item label="所属题库">
          <repo-select v-model="picker.repoId" @change="onPickerRepoChange" />
        </el-form-item>
        <el-form-item label="题目类型">
          <el-select v-model="picker.quType" placeholder="类型" style="width: 120px">
            <el-option
              v-for="item in typeOptions"
              :key="String(item.value)"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchPicker">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table style="width: 100%" class="flex-list-table"
        ref="pickerTable"
        v-loading="picker.loading"
        :data="picker.records"
        border
        height="360"
        @selection-change="onPickerSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" :selectable="rowSelectable" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="content" label="题干" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" width="90" align="center">
          <template slot-scope="{ row }">{{ quTypeLabel(row.quType) }}</template>
        </el-table-column>
        <el-table-column label="难度" width="130" align="center">
          <template slot-scope="{ row }">
            <el-rate :value="row.level || 3" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column prop="repoTitle" label="题库" width="120" show-overflow-tooltip />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="picker.pageNum"
          :page-sizes="[10, 20, 30]"
          :page-size="picker.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="picker.total"
          @size-change="onPickerSizeChange"
          @current-change="onPickerPageChange"
        />
      </div>

      <span slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="picker.adding" @click="confirmAddQuestions">确定添加</el-button>
      </span>
    </el-dialog>

    <!-- 编辑班级弹窗 -->
    <el-dialog
      title="编辑班级"
      :visible.sync="classDialog.visible"
      width="520px"
      append-to-body
    >
      <div class="class-dialog-block">
        <div class="class-dialog-title">已选班级</div>
        <el-table style="width: 100%" class="flex-list-table" :data="classDialog.list" border size="small" empty-text="暂无班级，请下方添加">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="班级名称" min-width="200" />
          <el-table-column label="操作" width="90" align="center">
            <template slot-scope="{ row, $index }">
              <el-button type="text" style="color: #f56c6c" @click="removeClassInDialog($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="class-dialog-block">
        <div class="class-dialog-title">新增班级</div>
        <div class="class-add-row">
          <el-select
            v-model="classDialog.addId"
            filterable
            clearable
            placeholder="选择要添加的班级"
            style="flex: 1"
          >
            <el-option
              v-for="item in availableClassOptions"
              :key="item.id"
              :label="item.gradeName"
              :value="item.id"
            />
          </el-select>
          <el-button type="success" :disabled="!classDialog.addId" @click="addClassInDialog">添加</el-button>
        </div>
      </div>

      <span slot="footer">
        <el-button @click="classDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmClassDialog">确定</el-button>
      </span>
    </el-dialog>
    <back-to-top />
  </div>
</template>

<script>
import { details, getExamDetail, updateExamQuestions, examUpdate } from '@/api/exam'
import { quPaging, quDetail } from '@/api/question'
import { fetchClasses } from '@/api/class_'
import AudioPlayer from '@/components/AudioPlayer'
import RepoSelect from '@/components/RepoSelect'
import BackToTop from '@/components/BackToTop'
import { renderStemWithBlanks, joinAnswers } from '@/utils/blankPlaceholder'

const QU_TYPE_MAP = {
  1: '单选题',
  2: '多选题',
  3: '判断题',
  4: '简答题',
  5: '填空题'
}

export default {
  name: 'ExamDetails',
  components: { AudioPlayer, RepoSelect, BackToTop },
  data() {
    return {
      loading: false,
      saving: false,
      examId: '',
      examInfo: {},
      questionList: [],
      selectedClasses: [],
      allClassList: [],
      form: {
        title: '',
        classIds: [],
        passedScore: 0,
        fullScore: 0,
        maxCount: 0,
        examDuration: 60,
        timeRange: [],
        fillNeedMark: false
      },
      scores: {
        radioScore: 0,
        multiScore: 0,
        judgeScore: 0,
        saqScore: 0,
        fillScore: 0
      },
      activeSections: [],
      floatCollapsed: false,
      keepSectionsCollapsed: false,
      classDialog: {
        visible: false,
        list: [],
        addId: null
      },
      addDialogVisible: false,
      picker: {
        searchName: '',
        repoId: '',
        quType: null,
        pageNum: 1,
        pageSize: 10,
        total: 0,
        records: [],
        loading: false,
        adding: false,
        selected: []
      },
      typeOptions: [
        { value: null, label: '全部类型' },
        { value: 1, label: '单选题' },
        { value: 2, label: '多选题' },
        { value: 3, label: '判断题' },
        { value: 4, label: '简答题' },
        { value: 5, label: '填空题' }
      ]
    }
  },
  computed: {
    existingIds() {
      return this.questionList.map((q) => q.questionId).filter(Boolean)
    },
    availableClassOptions() {
      const selectedIds = this.classDialog.list.map((c) => c.id)
      return (this.allClassList || []).filter((c) => !selectedIds.includes(c.id))
    },
    typeCounts() {
      return {
        radio: this.questionList.filter((q) => q.quType === 1).length,
        multi: this.questionList.filter((q) => q.quType === 2).length,
        judge: this.questionList.filter((q) => q.quType === 3).length,
        saq: this.questionList.filter((q) => q.quType === 4).length,
        fill: this.questionList.filter((q) => q.quType === 5).length
      }
    },
    totalScore() {
      return this.questionList.reduce((sum, q) => sum + Number(q.score || 0), 0)
    },
    scoreGap() {
      const full = Number(this.form.fullScore || 0)
      if (full <= 0) return 0
      return full - this.totalScore
    },
    scoreGapText() {
      const gap = this.scoreGap
      if (gap > 0) return `距总分还差 ${gap} 分`
      if (gap < 0) return `已超出总分 ${Math.abs(gap)} 分`
      return '已与总分一致'
    },
    scoreGapClass() {
      const gap = this.scoreGap
      if (gap > 0) return 'is-short'
      if (gap < 0) return 'is-over'
      return 'is-ok'
    },
    questionSections() {
      const order = [1, 2, 3, 4, 5]
      const present = order.filter((type) => this.questionList.some((q) => q.quType === type))
      // 始终至少展示已有题型；若完全为空则展示全部空标题便于添加
      const types = present.length ? present : order
      return types.map((type) => ({
        type,
        label: QU_TYPE_MAP[type],
        list: this.questionList.filter((q) => q.quType === type)
      }))
    },
    missingTypes() {
      if (!this.questionList.length) return []
      return [1, 2, 3, 4, 5].filter((t) => !this.questionList.some((q) => q.quType === t))
    }
  },
  watch: {
    questionSections: {
      handler(sections) {
        const names = sections.map((s) => String(s.type))
        const validActive = (this.activeSections || [])
          .map(String)
          .filter((n) => names.includes(n))
        if (!validActive.length && names.length && !this.keepSectionsCollapsed) {
          const firstWithQu = sections.find((s) => s.list.length) || sections[0]
          this.activeSections = firstWithQu ? [String(firstWithQu.type)] : []
        } else {
          this.activeSections = validActive
        }
      },
      immediate: true
    },
    activeSections(val) {
      if (val && val.length) this.keepSectionsCollapsed = false
    },
    '$route.query.examId'(val, oldVal) {
      if (val && val !== oldVal) this.loadPage()
    },
    'typeCounts.radio'(n) {
      if (!n) this.scores.radioScore = 0
    },
    'typeCounts.multi'(n) {
      if (!n) this.scores.multiScore = 0
    },
    'typeCounts.judge'(n) {
      if (!n) this.scores.judgeScore = 0
    },
    'typeCounts.saq'(n) {
      if (!n) this.scores.saqScore = 0
    },
    'typeCounts.fill'(n) {
      if (!n) this.scores.fillScore = 0
    }
  },
  created() {
    this.loadAllClasses()
    this.loadPage()
  },
  activated() {
    this.loadPage()
  },
  methods: {
    sectionScore(section) {
      return (section.list || []).reduce((sum, q) => sum + Number(q.score || 0), 0)
    },
    typeScoreSum(quType) {
      return this.questionList
        .filter((q) => q.quType === quType)
        .reduce((sum, q) => sum + Number(q.score || 0), 0)
    },
    defaultScoreByType(quType) {
      const map = {
        1: this.scores.radioScore,
        2: this.scores.multiScore,
        3: this.scores.judgeScore,
        4: this.scores.saqScore,
        5: this.scores.fillScore
      }
      return Number(map[quType] || 0)
    },
    renderStemWithBlanks,
    applyDefaultScore(quType) {
      const score = this.defaultScoreByType(quType)
      this.questionList.forEach((q) => {
        if (q.quType === quType) {
          this.$set(q, 'score', score)
        }
      })
      this.$message.success(`已将${this.quTypeLabel(quType)}默认分 ${score} 同步到本类全部题目`)
    },
    expandAllSections() {
      this.keepSectionsCollapsed = false
      this.activeSections = this.questionSections.map((s) => String(s.type))
    },
    collapseAllSections() {
      this.keepSectionsCollapsed = true
      this.activeSections = []
    },
    async loadAllClasses() {
      try {
        const res = await fetchClasses()
        const data = (res && res.data) || []
        this.allClassList = Array.isArray(data) ? data : (data.records || [])
      } catch (e) {
        this.allClassList = []
      }
    },
    syncSelectedClasses(ids, names) {
      const idList = Array.isArray(ids) ? ids : []
      const nameList = Array.isArray(names) ? names : []
      this.selectedClasses = idList.map((id, i) => {
        const fromAll = this.allClassList.find((c) => c.id === id)
        return {
          id,
          name: (fromAll && fromAll.gradeName) || nameList[i] || `班级${id}`
        }
      })
      this.form.classIds = idList.slice()
    },
    openClassDialog() {
      this.classDialog.list = this.selectedClasses.map((c) => ({ ...c }))
      this.classDialog.addId = null
      this.classDialog.visible = true
      if (!this.allClassList.length) {
        this.loadAllClasses()
      }
    },
    addClassInDialog() {
      const id = this.classDialog.addId
      if (!id) return
      if (this.classDialog.list.some((c) => c.id === id)) {
        this.$message.info('该班级已添加')
        return
      }
      const found = this.allClassList.find((c) => c.id === id)
      this.classDialog.list.push({
        id,
        name: (found && found.gradeName) || `班级${id}`
      })
      this.classDialog.addId = null
    },
    removeClassInDialog(index) {
      this.classDialog.list.splice(index, 1)
    },
    confirmClassDialog() {
      this.selectedClasses = this.classDialog.list.map((c) => ({ ...c }))
      this.form.classIds = this.selectedClasses.map((c) => c.id)
      this.classDialog.visible = false
    },
    quTypeLabel(type) {
      return QU_TYPE_MAP[type] || '题目'
    },
    resolveExamId() {
      const fromQuery = this.$route.query && this.$route.query.examId
      const fromStorage = localStorage.getItem('exam-details-examId')
      return fromQuery || fromStorage || ''
    },
    numberToLetter(input) {
      const map = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F' }
      const single = (num) => map[parseInt(num, 10)] || ''
      if (input == null || input === '') return ''
      const str = String(input)
      if (/^\d+$/.test(str)) return single(str)
      if (/^\d+(,\d+)*$/.test(str)) {
        return str.split(',').map((n) => single(n.trim())).join(',')
      }
      return ''
    },
    buildRightOption(quType, options) {
      if (!options || !options.length) return ''
      if (quType === 4) return options[0].content || ''
      if (quType === 5) {
        return joinAnswers(options.map((o) => (o && o.content != null ? o.content : '')))
      }
      return options
        .filter((o) => o.isRight === 1 || o.isRight === true)
        .map((o) => o.sort)
        .join(',')
    },
    mapQuestionFromDetail(detail) {
      const options = detail.options || detail.option || []
      const quType = detail.quType
      const score = detail.score != null
        ? Number(detail.score)
        : this.defaultScoreByType(quType)
      return {
        questionId: detail.id || detail.questionId,
        title: detail.content || detail.title,
        quType,
        level: detail.level || 3,
        score,
        image: detail.image,
        audio: detail.audio,
        analyse: detail.analysis || detail.analyse,
        option: (detail.quType === 4) ? null : options,
        rightOption: this.buildRightOption(detail.quType, options)
      }
    },
    async loadPage() {
      const examId = this.resolveExamId()
      this.examId = examId
      if (!examId) {
        this.examInfo = {}
        this.questionList = []
        this.$message.warning('未找到考试编号，请从考试列表重新进入')
        return
      }
      localStorage.setItem('exam-details-examId', String(examId))
      this.loading = true
      this.keepSectionsCollapsed = false
      try {
        const [infoRes, quRes] = await Promise.all([
          getExamDetail(examId),
          details(examId)
        ])
        this.examInfo = (infoRes && infoRes.data) || {}
        this.questionList = ((quRes && quRes.data) || []).map((item) => ({
          ...item,
          score: item.score != null ? Number(item.score) : this.defaultScoreByType(item.quType)
        }))
        this.scores = {
          radioScore: Number(this.examInfo.radioScore || 0),
          multiScore: Number(this.examInfo.multiScore || 0),
          judgeScore: Number(this.examInfo.judgeScore || 0),
          saqScore: Number(this.examInfo.saqScore || 0),
          fillScore: Number(this.examInfo.fillScore || 0)
        }
        this.form = {
          title: this.examInfo.title || '',
          classIds: Array.isArray(this.examInfo.gradeIds) ? [...this.examInfo.gradeIds] : [],
          passedScore: Number(this.examInfo.passedScore || 0),
          fullScore: Number(this.examInfo.grossScore || 0),
          maxCount: Number(this.examInfo.maxCount || 0),
          examDuration: Number(this.examInfo.examDuration || 60),
          timeRange: this.examInfo.startTime && this.examInfo.endTime
            ? [this.normalizeTime(this.examInfo.startTime), this.normalizeTime(this.examInfo.endTime)]
            : [],
          fillNeedMark: this.examInfo.fillNeedMark === 1 || this.examInfo.fillNeedMark === true
        }
        this.syncSelectedClasses(this.examInfo.gradeIds, this.examInfo.gradeNames)
      } catch (e) {
        this.examInfo = {}
        this.questionList = []
      } finally {
        this.loading = false
      }
    },
    normalizeTime(val) {
      if (!val) return ''
      return String(val).replace('T', ' ').slice(0, 19)
    },
    toIsoLocal(val) {
      if (!val) return null
      const s = this.normalizeTime(val)
      return s.includes('T') ? s : s.replace(' ', 'T')
    },
    removeQuestion(item) {
      this.$confirm('确定从本试卷移除该题目吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.questionList = this.questionList.filter((q) => q.questionId !== item.questionId)
        this.$message.success('已移除，请点击「保存试题」生效')
      }).catch(() => {})
    },
    openAddDialog(quType) {
      this.picker.quType = quType || null
      this.picker.selected = []
      this.picker.pageNum = 1
      this.addDialogVisible = true
    },
    onAddDialogOpen() {
      this.fetchPicker()
    },
    onPickerRepoChange() {
      // repo-select 已 v-model
    },
    searchPicker() {
      this.picker.pageNum = 1
      this.fetchPicker()
    },
    onPickerSizeChange(val) {
      this.picker.pageSize = val
      this.fetchPicker()
    },
    onPickerPageChange(val) {
      this.picker.pageNum = val
      this.fetchPicker()
    },
    async fetchPicker() {
      this.picker.loading = true
      try {
        const res = await quPaging({
          pageNum: this.picker.pageNum,
          pageSize: this.picker.pageSize,
          content: this.picker.searchName || null,
          repoId: this.picker.repoId || null,
          type: this.picker.quType
        })
        const page = (res && res.data) || {}
        this.picker.records = page.records || []
        this.picker.total = page.total || 0
      } finally {
        this.picker.loading = false
      }
    },
    rowSelectable(row) {
      return !this.existingIds.includes(row.id)
    },
    onPickerSelectionChange(rows) {
      this.picker.selected = rows || []
    },
    async confirmAddQuestions() {
      const rows = this.picker.selected.filter((r) => !this.existingIds.includes(r.id))
      if (!rows.length) {
        this.$message.info('请先勾选要添加的题目')
        return
      }
      this.picker.adding = true
      try {
        const added = []
        for (const row of rows) {
          try {
            const res = await quDetail(row.id)
            added.push(this.mapQuestionFromDetail(res.data || row))
          } catch (e) {
            added.push({
              questionId: row.id,
              title: row.content,
              quType: row.quType,
              level: row.level || 3,
              score: this.defaultScoreByType(row.quType),
              image: row.image,
              audio: row.audio,
              analyse: row.analysis,
              option: null,
              rightOption: ''
            })
          }
        }
        this.questionList = this.questionList.concat(added)
        this.addDialogVisible = false
        this.$message.success(`已添加 ${added.length} 题，总分已更新为 ${this.totalScore}`)
      } finally {
        this.picker.adding = false
      }
    },
    async handleSave() {
      if (!this.examId) return
      if (!this.form.title || this.form.title.trim().length < 3) {
        this.$message.warning('试卷名称请输入 3-20 个字符')
        return
      }
      if (!this.form.classIds || !this.form.classIds.length) {
        this.$message.warning('请选择考试班级')
        return
      }
      if (!this.form.timeRange || this.form.timeRange.length !== 2) {
        this.$message.warning('请选择考试起止时间')
        return
      }
      if (!this.form.examDuration || this.form.examDuration < 1) {
        this.$message.warning('请设置建议时长')
        return
      }
      if (!this.questionList.length) {
        this.$message.warning('请至少保留一道试题')
        return
      }
      const quIds = this.questionList.map((q) => q.questionId).filter(Boolean)
      if (!quIds.length) {
        this.$message.warning('试题数据异常，请刷新后重试')
        return
      }
      if (Number(this.form.passedScore) > this.totalScore) {
        this.$message.warning('及格分不能大于试卷总分')
        return
      }
      const declared = Number(this.form.fullScore)
      if (!declared || declared <= 0) {
        this.$message.warning('请填写总分')
        return
      }
      if (declared !== this.totalScore) {
        this.$message.warning(`总分须等于所选题目合计（当前合计 ${this.totalScore} 分，填写 ${declared} 分）`)
        return
      }
      this.saving = true
      try {
        const scorePayload = {
          radioScore: Number(this.scores.radioScore || 0),
          multiScore: Number(this.scores.multiScore || 0),
          judgeScore: Number(this.scores.judgeScore || 0),
          saqScore: Number(this.scores.saqScore || 0),
          fillScore: Number(this.scores.fillScore || 0),
          fillCount: Number(this.typeCounts.fill || 0),
          fillNeedMark: this.form.fillNeedMark ? 1 : 0
        }
        const quScores = this.questionList
          .filter((q) => q.questionId)
          .map((q) => `${q.questionId}:${Number(q.score || 0)}`)
          .join(',')
        // 先保存试题与单题分值（同步题量/总分）
        await updateExamQuestions(this.examId, {
          quIds: quIds.join(','),
          quScores,
          ...scorePayload
        })
        // 再保存考试基础信息与班级
        await examUpdate(this.examId, {
          title: this.form.title.trim(),
          examDuration: Number(this.form.examDuration),
          maxCount: Number(this.form.maxCount || 0),
          passedScore: Number(this.form.passedScore || 0),
          startTime: this.toIsoLocal(this.form.timeRange[0]),
          endTime: this.toIsoLocal(this.form.timeRange[1]),
          gradeIds: this.form.classIds.join(','),
          ...scorePayload
        })
        this.$message.success('保存成功')
        await this.loadPage()
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.exam-details-page {
  position: relative;
  min-height: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px 32px;
  padding-right: 220px;
}

.detail-form {
  max-width: 980px;
}

.section-toolbar {
  display: flex;
  gap: 4px;
}

.question-collapse {
  margin: 0 0 16px;
  border: none;

  ::v-deep .el-collapse-item {
    margin-bottom: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  ::v-deep .el-collapse-item__header {
    height: auto;
    min-height: 48px;
    line-height: 1.4;
    padding: 10px 14px;
    background: #f8fafc;
    border-bottom: none;
  }

  ::v-deep .el-collapse-item__wrap {
    border-bottom: none;
  }

  ::v-deep .el-collapse-item__content {
    padding: 0 12px 12px;
  }
}

.collapse-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  width: calc(100% - 24px);
  padding-right: 8px;
}

.collapse-title-main {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.collapse-score {
  color: #0d9488;
  font-size: 13px;
  font-weight: 600;
}

.collapse-body {
  margin: 0;
}

.score-float {
  position: fixed;
  top: 120px;
  right: 24px;
  z-index: 20;
  width: 188px;
  padding: 14px 14px 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transition: width 0.2s ease;
  max-height: calc(100vh - 160px);
  overflow: auto;
  box-sizing: border-box;

  &.collapsed {
    width: 44px;
    padding: 10px 6px;
    overflow: hidden;
  }
}

.score-float-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.score-float-toggle {
  padding: 0;
  color: #64748b;
}

.score-float-total {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;

  .num {
    font-size: 28px;
    font-weight: 800;
    color: #0d9488;
    line-height: 1;
  }

  .unit {
    font-size: 13px;
    color: #64748b;
  }
}

.score-float-sub {
  margin-bottom: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.score-float-gap {
  margin: -4px 0 12px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.score-float-gap.is-short {
  color: #b45309;
  background: #fffbeb;
}

.score-float-gap.is-over {
  color: #b91c1c;
  background: #fef2f2;
}

.score-float-gap.is-ok {
  color: #0f766e;
  background: #f0fdfa;
}

.score-float-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;

  li {
    display: grid;
    grid-template-columns: 32px 20px 1fr auto;
    gap: 4px;
    align-items: center;
    padding: 6px 0;
    border-top: 1px dashed #e2e8f0;
    font-size: 12px;
    color: #64748b;

    b {
      color: #334155;
      font-weight: 600;
    }

    em {
      font-style: normal;
      color: #94a3b8;
    }

    strong {
      color: #0d9488;
      font-weight: 700;
    }
  }
}

.score-float-save {
  width: 100%;
}

.total-score {
  color: #0d9488;
  font-size: 22px;
  font-weight: 700;
  margin-right: 4px;
}

.grade-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.grade-tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 28px;
  align-items: center;
}

.grade-tag {
  margin: 0;
}

.class-dialog-block {
  margin-bottom: 18px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.class-dialog-title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.class-add-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.empty-tip {
  color: #94a3b8;
  font-size: 13px;
}

.inline-unit {
  margin: 0 12px 0 8px;
  color: #64748b;
  font-size: 13px;
}

.inline-label {
  display: inline-block;
  margin: 0 12px 0 8px;
  color: #606266;
  font-size: 14px;
  width: 70px;
  text-align: right;
}

.score-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 18px;
  padding-top: 2px;
}

.score-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 13px;

  ::v-deep .el-input-number {
    width: 100px;
  }
}

.section-toolbar {
  display: flex;
  gap: 4px;
}

.question-box {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fafafa;
}

.section-block {
  margin: 8px 0 20px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title-text {
  display: inline-block;
  min-width: 80px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.question-item {
  padding: 12px 4px 16px;
  border-bottom: 1px dashed #e4e7ed;

  &:last-child {
    border-bottom: none;
    padding-bottom: 4px;
  }
}

.question-item-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin-bottom: 8px;
}

.q-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  flex-shrink: 0;
}

.q-level {
  flex: 1;
  min-width: 100px;
}

.q-score-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}

.q-score-edit .el-input-number {
  width: 100px;
}

.question-item-head > .el-button {
  margin-left: auto;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: #94a3b8;
}

.question-body {
  font-size: 14px;
  color: #303133;
  line-height: 1.7;
  margin-bottom: 10px;
}

.question-content,
.option-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.media-wrap {
  margin: 8px 0;
}

.options-list {
  margin: 4px 0 8px;
}

.option-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
  font-size: 14px;
  color: #606266;

  &.right {
    color: #0d9488;
    font-weight: 500;
  }
}

.opt-letter {
  flex-shrink: 0;
  min-width: 20px;
  font-weight: 600;
}

.meta-block {
  margin-top: 8px;
  padding: 8px 10px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.meta-line {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  margin-top: 4px;

  &:first-child {
    margin-top: 0;
  }
}

.meta-label {
  color: #909399;
  font-weight: 600;
}

.empty-section {
  color: #94a3b8;
  font-size: 13px;
  padding: 12px 4px;
}

.pagination-container {
  margin-top: 12px;
  text-align: right;
}

@media screen and (max-width: 1200px) {
  .exam-details-page {
    padding-right: 24px;
  }

  .score-float {
    top: auto;
    bottom: 20px;
    right: 16px;
  }
}

@media screen and (max-width: 768px) {
  .question-box {
    margin-left: 0;
  }

  .inline-label {
    display: block;
    width: auto;
    text-align: left;
    margin: 10px 0 6px;
  }

  .collapse-title {
    width: 100%;
  }

  .score-float {
    width: 160px;

    &.collapsed {
      width: 40px;
    }
  }
}
</style>
