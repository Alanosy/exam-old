<template>
  <div class="make-test-root">
    <el-container
      v-loading="pageLoading"
      element-loading-text="正在查询请等待"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(232, 242, 239, 0.72)"
      class="page-loading-host make-test-page"
    >
      <div class="left-spacer" />

      <el-container class="make-test-main">
        <el-main class="right" :class="{ 'with-float': !floatCollapsed }">
          <el-card class="qu_list">
            <div class="toolbar">
              <el-button size="mini" icon="el-icon-arrow-down" @click="expandAll">全部展开</el-button>
              <el-button size="mini" icon="el-icon-arrow-up" @click="collapseAll">全部折叠</el-button>
              <el-button
                size="mini"
                :icon="floatCollapsed ? 'el-icon-s-data' : 'el-icon-close'"
                @click="floatCollapsed = !floatCollapsed"
              >{{ floatCollapsed ? '显示详情' : '隐藏详情' }}</el-button>
            </div>

            <div v-if="!pageLoading && !allQuestions.length" class="empty-tip">暂无题目详情</div>
            <el-collapse v-model="activeTypes" class="type-collapse">
              <el-collapse-item
                v-for="group in typeGroups"
                :key="'type-' + group.type"
                :name="String(group.type)"
              >
                <template slot="title">
                  <div class="type-head">
                    <div class="type-head-main">
                      <i :class="group.icon" class="type-icon" />
                      <span class="type-title">{{ group.name }}</span>
                      <span class="type-count">{{ group.list.length }} 题 · {{ group.earned }}/{{ group.total }} 分</span>
                    </div>
                    <p class="type-desc">{{ group.desc }}</p>
                  </div>
                </template>

                <div
                  v-for="wrap in group.list"
                  :key="'q-' + wrap.globalIndex"
                  :class="'index' + wrap.globalIndex"
                  class="question-block"
                >
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <div class="qu_content">
                        {{ wrap.globalIndex + 1 }}.
                        <span class="qu-type-tag">【{{ group.name }}】</span>
                        <template v-if="wrap.item.quType === 5">
                          {{ renderStemWithBlanks(wrap.item.title) }}
                        </template>
                        <template v-else>
                          {{ wrap.item.title }}
                        </template>
                      </div>
                      <div v-if="wrap.item.image" class="qu-media">
                        <el-image
                          :src="wrap.item.image"
                          :preview-src-list="[wrap.item.image]"
                          style="height: 100px"
                        />
                      </div>
                      <audio-player v-if="wrap.item.audio" :src="wrap.item.audio" />

                      <el-radio-group
                        v-if="isObjective(wrap.item.quType)"
                        class="qu_choose_group"
                      >
                        <el-radio
                          v-for="(opt, oi) in (wrap.item.option || [])"
                          :key="'opt-' + wrap.globalIndex + '-' + oi"
                          :label="opt.content"
                          border
                          class="qu_choose"
                          :class="{
                            isRight: wrap.item.myOption != null && isCheck(wrap.item.myOption, opt.sort) && opt.isRight,
                            incorrect: wrap.item.myOption != null && isCheck(wrap.item.myOption, opt.sort) && !opt.isRight
                          }"
                        >
                          <div class="qu_choose_tag">
                            <div class="qu_choose_tag_type">
                              {{ numberToLetter(String(oi)) }}、{{ opt.content }}
                            </div>
                            <div v-if="opt.image" class="qu_choose_tag_el_image">
                              <el-image :src="opt.image" :preview-src-list="[opt.image]" style="max-width: 200px" />
                            </div>
                          </div>
                        </el-radio>
                      </el-radio-group>

                      <div v-else-if="wrap.item.quType === 5" class="content fill-answers">
                        <div
                          v-for="(ans, aIdx) in splitFillAnswers(wrap.item.myOption || wrap.item.answer)"
                          :key="'fill-ans-' + wrap.globalIndex + '-' + aIdx"
                          style="margin-bottom: 4px"
                        >
                          空{{ aIdx + 1 }}：{{ ans || '（未作答）' }}
                        </div>
                      </div>

                      <div v-else class="content">
                        {{ wrap.item.myOption || wrap.item.answer || '（未作答）' }}
                      </div>

                      <div class="qu_analysis">
                        <el-card>
                          <template v-if="isObjective(wrap.item.quType)">
                            <div class="result-line">
                              <span>作答结果：</span>
                              <el-tag
                                size="mini"
                                :type="wrap.item.isRight === 1 ? 'success' : (wrap.item.isRight === 0 ? 'danger' : 'info')"
                              >
                                {{ wrap.item.isRight === 1 ? '正确' : (wrap.item.isRight === 0 ? '错误' : '未作答') }}
                              </el-tag>
                              <span v-if="wrap.item.score != null" class="score-chip">本题 {{ wrap.item.score }} 分</span>
                            </div>
                            <div class="result-line">
                              <span>考生答案：</span>
                              <span>{{ numberToLetter(wrap.item.myOption) || '未作答' }}</span>
                            </div>
                            <div class="result-line">
                              <span>正确答案：</span>
                              <span>{{ numberToLetter(wrap.item.rightOption) }}</span>
                            </div>
                            <div v-if="wrap.item.analyse" class="result-line">
                              <span>试题解析：</span>
                              <span>{{ wrap.item.analyse }}</span>
                            </div>
                          </template>

                          <template v-else>
                            <div style="display: flex; align-items: center; flex-wrap: wrap">
                              <span style="color: #e6a23c">分数：</span>
                              <el-input
                                v-model="wrap.item.correctScore"
                                type="number"
                                :disabled="!canEditScore(wrap.item)"
                                style="width: 100px; margin-left: 20px"
                              />
                              <span
                                v-if="wrap.item.quType === 5 && !isFillRemarkable(wrap.item)"
                                class="score-hint"
                              >该卷填空题仅自动评分，不可改分</span>
                              <span
                                v-else-if="canEditScore(wrap.item) && (wrap.item.correctScore < 0 || wrap.item.correctScore > wrap.item.totalScore)"
                                style="color: #f00; margin-left: 10px"
                              >评分只能在 0-{{ wrap.item.totalScore }}之间</span>
                            </div>

                            <div style="margin-top: 14px">
                              <span>参考答案:</span>
                              <br>
                              <template v-if="wrap.item.quType === 5">
                                <div
                                  v-for="(ans, aIdx) in splitFillAnswers(wrap.item.rightOption || wrap.item.refAnswer)"
                                  :key="'ref-' + wrap.globalIndex + '-' + aIdx"
                                  style="margin-top: 4px"
                                >
                                  空{{ aIdx + 1 }}：{{ ans || '-' }}
                                </div>
                              </template>
                              <span v-else>{{ wrap.item.rightOption || wrap.item.refAnswer }}</span>
                            </div>

                            <div v-if="wrap.item.analyse" style="margin-top: 10px">
                              <span>试题解析：</span>
                              <span>{{ wrap.item.analyse }}</span>
                            </div>

                            <el-collapse class="auto-score-collapse">
                              <el-collapse-item title="机器自动评分" name="auto">
                                <template v-if="wrap.item.quType !== 5">
                                  <div class="auto-line">
                                    <span class="auto-label">AI 得分：</span>
                                    <span v-if="wrap.item.aiScore !== null && wrap.item.aiScore !== undefined">{{ wrap.item.aiScore }} 分</span>
                                    <span v-else class="auto-muted">暂无（可能仍在评分中）</span>
                                  </div>
                                  <div class="auto-line">
                                    <span class="auto-label">评分说明：</span>
                                    <span v-if="wrap.item.aiReason">{{ wrap.item.aiReason }}</span>
                                    <span v-else class="auto-muted">暂无</span>
                                  </div>
                                </template>
                                <template v-else>
                                  <div class="auto-line">
                                    <span class="auto-label">自动得分：</span>
                                    <span>{{ wrap.item.earnedScore != null ? wrap.item.earnedScore : 0 }} 分</span>
                                    <span class="auto-muted">（满分 {{ wrap.item.totalScore || wrap.item.score || 0 }}）</span>
                                  </div>
                                  <div
                                    v-for="blank in blankAutoResults(wrap.item)"
                                    :key="'blank-' + wrap.globalIndex + '-' + blank.index"
                                    class="blank-result"
                                    :class="blank.ok ? 'is-ok' : 'is-bad'"
                                  >
                                    <span class="blank-flag">{{ blank.ok ? '正确' : '错误' }}</span>
                                    空{{ blank.index }}：作答「{{ blank.user || '未作答' }}」
                                    ／ 标准「{{ blank.ref || '-' }}」
                                  </div>
                                </template>
                                <div
                                  v-if="wrap.item.manualScore !== null && wrap.item.manualScore !== undefined"
                                  class="auto-line manual-line"
                                >
                                  <span class="auto-label">人工得分：</span>
                                  <span>{{ wrap.item.manualScore }} 分</span>
                                </div>
                              </el-collapse-item>
                            </el-collapse>
                          </template>
                        </el-card>
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <el-row class="qu_assign_score">
                        本题
                        <el-input-number
                          :controls="false"
                          :min="0"
                          :precision="2"
                          disabled
                          :value="wrap.item.totalScore != null ? wrap.item.totalScore : wrap.item.score"
                          class="qu_assign_score_content"
                        />
                        分
                      </el-row>
                    </el-col>
                  </el-row>
                  <el-divider />
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-main>
      </el-container>
    </el-container>

    <!-- 挂到 body，保证相对视口固定、不随中间内容滚动 -->
    <div ref="leftFloat" class="left-float" :style="leftFloatStyle">
      <div class="fk">
        <div class="sj">
          <el-divider />
          <p>
            共 <span class="hl">{{ allQuestions.length }}</span> 题
            <template v-if="manualTargets.length">
              ，待阅 <span class="hl">{{ manualTargets.length }}</span> 题
            </template>
          </p>
          <div class="nav-by-type">
            <div
              v-for="group in typeGroups"
              :key="'nav-' + group.type"
              class="nav-type-block"
            >
              <div class="nav-type-label">
                <i :class="group.icon" />
                {{ group.name }}
              </div>
              <div class="nav-grid">
                <button
                  v-for="wrap in group.list"
                  :key="'nav-q-' + wrap.globalIndex"
                  type="button"
                  class="nav-cell"
                  :class="{
                    active: wrap.globalIndex === quIndex,
                    pending: needManualScore(wrap.item)
                  }"
                  :title="'第' + (wrap.globalIndex + 1) + '题 · ' + group.name"
                  @click="handleTag(wrap.globalIndex)"
                >
                  {{ wrap.globalIndex + 1 }}
                </button>
              </div>
            </div>
          </div>
          <el-button
            v-if="!readonly"
            type="success"
            class="ann"
            @click="subCorrect"
          >提交批改</el-button>
          <el-button
            v-else
            type="primary"
            plain
            class="ann"
            @click="goBack"
          >返回列表</el-button>
        </div>
      </div>
    </div>

    <div ref="detailFloat" class="detail-float" :class="{ collapsed: floatCollapsed }">
      <div class="detail-float-head">
        <span><i class="el-icon-document" /> 考试详情</span>
        <el-button
          type="text"
          class="detail-float-toggle"
          :icon="floatCollapsed ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="floatCollapsed = !floatCollapsed"
        />
      </div>
      <template v-if="!floatCollapsed">
        <div class="detail-row">
          <span class="k">考试</span>
          <span class="v">{{ summary.examTitle || info.examTitle || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="k">姓名</span>
          <span class="v">{{ summary.userName || info.userName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="k">班级</span>
          <span class="v">{{ summary.gradeName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="k">总分</span>
          <span class="v hl">{{ summary.userScore != null ? summary.userScore : paperEarnedSum }} / {{ paperTotalSum }}</span>
        </div>
        <div class="detail-row">
          <span class="k">开考时间</span>
          <span class="v">{{ summary.createTime || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="k">交卷时间</span>
          <span class="v">{{ summary.limitTime || info.limitTime || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="k">使用时间</span>
          <span class="v">{{ formatDuration(summary.userTime) }}</span>
        </div>
        <div class="detail-section">题型得分</div>
        <div
          v-for="g in typeGroups"
          :key="'score-' + g.type"
          class="detail-row"
        >
          <span class="k">{{ g.name }}</span>
          <span class="v">{{ g.earned }}/{{ g.total }}（{{ g.list.length }}题）</span>
        </div>
        <div class="detail-section">难度分布</div>
        <div
          v-for="lv in levelStats"
          :key="'lv-' + lv.level"
          class="detail-row"
        >
          <span class="k">难度 {{ lv.level }}</span>
          <span class="v">{{ lv.count }} 题</span>
        </div>
        <div v-if="!levelStats.length" class="detail-muted">暂无难度数据</div>
      </template>
    </div>
  </div>
</template>

<script>
import { answerDetail, answerPaperSummary, correct } from '@/api/answer'
import { recordExamDetail } from '@/api/record'
import pageLoading from '@/mixin/pageLoading'
import AudioPlayer from '@/components/AudioPlayer'
import { renderStemWithBlanks, splitAnswers, matchBlank } from '@/utils/blankPlaceholder'

var TYPE_META = [
  {
    type: 1,
    name: '单选题',
    icon: 'el-icon-circle-check',
    desc: '客观题，系统自动判分；绿色为选对，红色为选错。'
  },
  {
    type: 2,
    name: '多选题',
    icon: 'el-icon-finished',
    desc: '客观题，需选全正确选项才得分；系统自动判分。'
  },
  {
    type: 3,
    name: '判断题',
    icon: 'el-icon-s-help',
    desc: '客观题，系统自动判分，显示对错结果。'
  },
  {
    type: 5,
    name: '填空题',
    icon: 'el-icon-edit-outline',
    desc: '按空自动判分；若试卷开启「填空需批改」则可人工改分。'
  },
  {
    type: 4,
    name: '简答题',
    icon: 'el-icon-edit',
    desc: '主观题，需人工阅卷给分。'
  }
]

export default {
  mixins: [pageLoading],
  name: 'ExamProcess',
  components: { AudioPlayer },
  data() {
    return {
      quIndex: -1,
      info: {},
      allQuestions: [],
      activeTypes: [],
      summary: {},
      floatCollapsed: false
    }
  },
  computed: {
    readonly() {
      const info = this.info || {}
      if (Number(info.whetherMark) === 1) return true
      const text = String(info.corrected || '')
      return text === '已阅卷' || text === '是'
    },
    leftFloatStyle() {
      const mobile = this.$store.state.app.device === 'mobile'
      const opened = this.$store.state.app.sidebar.opened
      const side = mobile ? 0 : (opened ? 220 : 54)
      return {
        left: (side + 15) + 'px',
        top: '120px'
      }
    },
    typeGroups() {
      const self = this
      return TYPE_META.map(meta => {
        const list = []
        let earned = 0
        let total = 0
        self.allQuestions.forEach((item, globalIndex) => {
          if (Number(item.quType) === meta.type) {
            list.push({ item: item, globalIndex: globalIndex })
            total += Number(item.totalScore != null ? item.totalScore : item.score) || 0
            earned += self.questionEarned(item)
          }
        })
        return {
          type: meta.type,
          name: meta.name,
          icon: meta.icon,
          desc: meta.desc,
          list: list,
          earned: earned,
          total: total
        }
      }).filter(g => g.list.length > 0)
    },
    manualTargets() {
      return this.allQuestions.filter(item => this.needManualScore(item))
    },
    paperTotalSum() {
      return this.typeGroups.reduce((s, g) => s + g.total, 0)
    },
    paperEarnedSum() {
      return this.typeGroups.reduce((s, g) => s + g.earned, 0)
    },
    levelStats() {
      const map = {}
      this.allQuestions.forEach(q => {
        const lv = q.level != null ? Number(q.level) : null
        if (lv == null || isNaN(lv)) return
        if (!map[lv]) map[lv] = 0
        map[lv] += 1
      })
      return Object.keys(map)
        .map(k => ({ level: Number(k), count: map[k] }))
        .sort((a, b) => a.level - b.level)
    }
  },
  created() {
    this.info = JSON.parse(sessionStorage.getItem('answer_info') || '{}')
    const title = this.readonly ? '查看答卷' : '批改试卷'
    if (this.$route.meta) {
      this.$route.meta.title = title
    }
    document.title = title + ' - 在线考试系统'
    this.$store.commit('menu/UPDATE_TAG_TITLE', {
      path: this.$route.path,
      title: title
    })
    this.loadPaper()
  },
  mounted() {
    this.mountFixedPanels()
  },
  beforeDestroy() {
    this.unmountFixedPanels()
  },
  methods: {
    mountFixedPanels() {
      ;['leftFloat', 'detailFloat'].forEach(ref => {
        const el = this.$refs[ref]
        if (el && el.parentNode !== document.body) {
          document.body.appendChild(el)
        }
      })
    },
    unmountFixedPanels() {
      ;['leftFloat', 'detailFloat'].forEach(ref => {
        const el = this.$refs[ref]
        if (el && el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })
    },
    renderStemWithBlanks,
    splitFillAnswers(val) {
      return splitAnswers(val)
    },
    isObjective(quType) {
      const t = Number(quType)
      return t === 1 || t === 2 || t === 3
    },
    isFillRemarkable(item) {
      return Number(item && item.fillNeedMark) === 1
    },
    canEditScore(item) {
      if (this.readonly) return false
      if (Number(item.quType) === 5) return this.isFillRemarkable(item)
      if (Number(item.quType) === 4) return true
      return false
    },
    needManualScore(item) {
      if (Number(item.quType) === 5) return this.isFillRemarkable(item)
      return Number(item.quType) === 4
    },
    questionEarned(item) {
      if (item == null) return 0
      if (item.correctScore != null && item.correctScore !== '') {
        const n = Number(item.correctScore)
        if (!isNaN(n)) return n
      }
      if (item.earnedScore != null) return Number(item.earnedScore) || 0
      if (item.manualScore != null) return Number(item.manualScore) || 0
      if (item.aiScore != null) return Number(item.aiScore) || 0
      if (item.score != null && this.isObjective(item.quType)) return Number(item.score) || 0
      return 0
    },
    isCheck(myOption, sort) {
      if (myOption == null || myOption === '') return false
      const arr = String(myOption).split(',').map(s => Number(String(s).trim()))
      return arr.indexOf(Number(sort)) !== -1
    },
    numberToLetter(input) {
      if (input == null || input === '') return ''
      const map = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H' }
      const toOne = (num) => map[parseInt(num, 10)] || ''
      const str = String(input).trim()
      if (/^\d+$/.test(str)) return toOne(str)
      if (/^\d+(,\d+)*$/.test(str)) {
        return str.split(',').map(s => toOne(s.trim())).join(',')
      }
      return ''
    },
    blankAutoResults(item) {
      const users = splitAnswers(item.myOption || item.answer)
      const refs = splitAnswers(item.rightOption || item.refAnswer)
      const n = Math.max(users.length, refs.length)
      const list = []
      for (let i = 0; i < n; i++) {
        const user = users[i] || ''
        const ref = refs[i] || ''
        list.push({
          index: i + 1,
          user: user,
          ref: ref,
          ok: matchBlank(user, ref)
        })
      }
      return list
    },
    formatDuration(seconds) {
      if (seconds == null || seconds === '') return '-'
      const n = Number(seconds)
      if (isNaN(n) || n < 0) return '-'
      const m = Math.floor(n / 60)
      const s = Math.floor(n % 60)
      if (m <= 0) return s + ' 秒'
      return m + ' 分 ' + s + ' 秒'
    },
    expandAll() {
      this.activeTypes = this.typeGroups.map(g => String(g.type))
    },
    collapseAll() {
      this.activeTypes = []
    },
    goBack() {
      this.$router.push({ name: 'answer-show' })
    },
    handleTag(index) {
      this.quIndex = index
      const item = this.allQuestions[index]
      if (item && this.activeTypes.indexOf(String(item.quType)) === -1) {
        this.activeTypes = this.activeTypes.concat([String(item.quType)])
      }
      this.$nextTick(() => {
        const page = document.querySelector('.index' + index)
        if (page) page.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    async loadPaper() {
      await this.withPageLoading(async() => {
        const examId = this.info.examId
        const userId = this.info.userId
        const params = { examId: examId, userId: userId }
        const results = await Promise.all([
          recordExamDetail(params),
          answerDetail(params).catch(() => ({ data: [] })),
          answerPaperSummary(params).catch(() => ({ data: null }))
        ])
        const recordList = results[0].data || []
        const scoreList = results[1].data || []
        this.summary = results[2].data || {}
        const scoreMap = {}
        scoreList.forEach(s => {
          if (s && s.quId != null) scoreMap[s.quId] = s
        })
        this.allQuestions = recordList.map(q => {
          const score = scoreMap[q.questionId] || {}
          const merged = Object.assign({}, q, score)
          merged.quId = q.questionId
          merged.userId = userId
          merged.examId = examId
          if (merged.totalScore == null) merged.totalScore = q.score
          if (merged.answer == null) merged.answer = q.myOption
          if (merged.refAnswer == null) merged.refAnswer = q.rightOption
          if (merged.quTitle == null) merged.quTitle = q.title
          if (this.isObjective(merged.quType) && merged.correctScore == null) {
            merged.correctScore = merged.isRight === 1 ? (merged.score || 0) : 0
          }
          return merged
        })
        if (this.readonly) {
          this.activeTypes = this.typeGroups.map(g => String(g.type))
        } else {
          const needTypes = this.typeGroups
            .filter(g => g.list.some(w => this.needManualScore(w.item)))
            .map(g => String(g.type))
          this.activeTypes = needTypes.length ? needTypes : this.typeGroups.map(g => String(g.type))
        }
      })
    },
    subCorrect() {
      if (this.readonly) {
        this.$message.warning('该答卷已批改，仅可查看')
        return
      }
      const targets = this.manualTargets
      if (!targets.length) {
        this.$message.warning('当前没有需要人工评分的题目')
        return
      }
      const list = []
      for (let i = 0; i < targets.length; i++) {
        const element = targets[i]
        const displayIndex = this.allQuestions.indexOf(element) + 1
        if (element.correctScore === '' || element.correctScore === null || element.correctScore === undefined) {
          this.$message({ message: `请先给第${displayIndex}题评分`, type: 'error' })
          return
        }
        if (element.correctScore < 0 || element.correctScore > element.totalScore) {
          this.$message({
            message: `第${displayIndex}题的评分只能在0-${element.totalScore}之间`,
            type: 'error'
          })
          return
        }
        list.push({
          userId: element.userId,
          examId: element.examId,
          questionId: element.quId || element.questionId,
          score: element.correctScore
        })
      }
      correct(list).then((res) => {
        if (res.code) {
          this.$notify({
            title: '成功',
            message: `${res.msg}`,
            type: 'success',
            duration: 2000
          })
          this.$router.push({ name: 'answer-show' })
        } else {
          this.$notify({
            title: '失败',
            message: `${res.msg}`,
            type: 'error',
            duration: 2000
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.make-test-root {
  width: 100%;
}
.make-test-page {
  min-height: calc(100vh - 100px);
  border: 1px solid #eee;
  box-sizing: border-box;
  background: #fff;
  align-items: flex-start;
}
.make-test-main {
  flex: 1;
  min-width: 0;
  overflow: visible;
}
.hl {
  color: #0f766e;
}
.toolbar {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.empty-tip {
  padding: 40px 12px;
  text-align: center;
  color: #909399;
}
.type-collapse {
  border: none;
}
.type-head {
  width: 100%;
  padding: 2px 28px 2px 0;
  box-sizing: border-box;
  text-align: left;
}
.type-head-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  min-height: 22px;
}
.type-icon {
  color: #0f766e;
  font-size: 16px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.type-title {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  line-height: 22px;
}
.type-count {
  color: #909399;
  font-size: 13px;
  line-height: 22px;
}
.type-desc {
  margin: 4px 0 0 28px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  white-space: normal;
  word-break: break-all;
}
.question-block {
  padding: 4px 0 8px;
}
.content {
  width: 97%;
  min-height: 60px;
  border: 1px solid #0f766e;
  margin-top: 8px;
  margin-left: 10px;
  padding: 10px;
  font-weight: 200;
}
.content.fill-answers {
  height: auto;
}
.qu-type-tag {
  color: #0f766e;
  font-weight: 600;
  margin-right: 4px;
}
.qu-media {
  margin: 8px 0 8px 10px;
}
.ann {
  width: 130px;
  margin: 16px 0 12px;
}
.sj {
  margin: 10px;
  line-height: 22px;
}
.fk {
  width: 200px;
  box-shadow: none;
  margin: 0;
  background: transparent;
}
.left-spacer {
  width: 215px;
  flex-shrink: 0;
}
.left-float {
  position: fixed;
  z-index: 2000;
  width: 200px;
  max-height: calc(100vh - 160px);
  overflow: auto;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 0 15px rgb(197, 197, 197);
}
.right {
  padding: 12px !important;
  box-sizing: border-box;
  overflow: visible;
}
.right.with-float {
  padding-right: 328px !important;
}
.nav-by-type {
  margin-top: 8px;
  padding-right: 2px;
}
.nav-type-block {
  margin-bottom: 10px;
}
.nav-type-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
  margin-bottom: 6px;
}
.nav-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.nav-cell {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d9e8e4;
  border-radius: 4px;
  background: #f7fbfa;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  line-height: 30px;
  text-align: center;
}
.nav-cell:hover {
  border-color: #0f766e;
  color: #0f766e;
}
.nav-cell.active {
  background: #0f766e;
  border-color: #0f766e;
  color: #fff;
}
.nav-cell.pending:not(.active) {
  border-color: #e6a23c;
  background: #fdf6ec;
  color: #b88230;
}
.score-hint {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
.result-line {
  margin-top: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 13px;
}
.score-chip {
  margin-left: 10px;
  color: #909399;
}
.auto-score-collapse {
  margin-top: 14px;
  border-top: 1px solid #ebeef5;
}
.auto-line {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 13px;
}
.auto-label {
  color: #303133;
  font-weight: 600;
  margin-right: 4px;
}
.auto-muted {
  color: #909399;
}
.blank-result {
  margin: 6px 0;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}
.blank-result.is-ok {
  background: #f0f9eb;
  color: #67c23a;
}
.blank-result.is-bad {
  background: #fef0f0;
  color: #f56c6c;
}
.blank-flag {
  display: inline-block;
  min-width: 36px;
  font-weight: 600;
  margin-right: 6px;
}
.manual-line {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e4e7ed;
}

.detail-float {
  position: fixed;
  right: 24px;
  top: 120px;
  width: 300px;
  z-index: 2000;
  background: #fff;
  border: 1px solid #d9e8e4;
  box-shadow: 0 8px 24px rgba(15, 118, 110, 0.12);
  border-radius: 8px;
  padding: 12px 14px 14px;
  max-height: calc(100vh - 160px);
  overflow: auto;
  box-sizing: border-box;
}
.detail-float.collapsed {
  width: 44px;
  padding: 8px 6px;
  overflow: hidden;
}
.detail-float.collapsed .detail-float-head span {
  display: none;
}
.detail-float-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #0f766e;
  margin-bottom: 8px;
}
.detail-float-toggle {
  padding: 0;
  color: #0f766e;
}
.detail-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  column-gap: 10px;
  align-items: start;
  font-size: 12px;
  line-height: 1.7;
  color: #606266;
  margin-bottom: 2px;
}
.detail-row .k {
  color: #909399;
  text-align: left;
}
.detail-row .v {
  text-align: left;
  word-break: break-all;
}
.detail-section {
  margin: 10px 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  border-top: 1px dashed #e4e7ed;
  padding-top: 8px;
}
.detail-muted {
  font-size: 12px;
  color: #c0c4cc;
}

.qu_list {
  width: 100%;
  box-sizing: border-box;

  .qu_content {
    padding-left: 10px;
  }

  .qu_analysis {
    padding: 10px;
  }

  .qu_assign_score {
    background: #f5f5f5;
    height: 100px;
    padding-top: 35px;

    .qu_assign_score_content {
      width: 80px;
    }
  }

  .qu_choose_group {
    width: 100%;
    margin-top: 8px;
    padding-left: 10px;

    .qu_choose {
      display: block;
      margin: 10px;
      height: auto;
      white-space: normal;

      ::v-deep .el-radio__input .el-radio__inner {
        display: none;
      }

      .qu_choose_tag {
        display: inline-flex;
        width: 90%;
        flex-direction: column;

        .qu_choose_tag_type {
          font-weight: bold;
          color: #0f766e;
        }
      }
    }

    .isRight {
      border-color: #67c23a !important;
      background: #f0f9eb;
    }
    .incorrect {
      border-color: #f56c6c !important;
      background: #fef0f0;
    }
  }
}

::v-deep .type-collapse .el-collapse-item__header {
  height: auto !important;
  line-height: 1.4 !important;
  padding: 12px 0;
  align-items: center;
}
::v-deep .type-collapse .el-collapse-item__arrow {
  margin-top: 0;
  line-height: 22px;
}
::v-deep .type-collapse .el-collapse-item__content {
  padding-bottom: 8px;
}
</style>
