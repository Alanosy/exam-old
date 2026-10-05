<template>
  <div style="width: 100%; height: 100%; background-color: #f0f2f5; padding: 20px 0 0">
    <!-- 开头 -->
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card style="margin-bottom: 10px">
          题库：{{ repoTitle }}
          <el-button
            :loading="loading"
            style="float: right; margin-top: -10px"
            type="primary"
            @click="exitFun()"
          >
            结束刷题
          </el-button>
        </el-card>
      </el-col>

      <!-- 答题卡 -->
      <el-col :span="5" :xs="24" style="margin-bottom: 10px">
        <el-card class="content-h">
          <div class="btn_switch">
            <button
              class="btn_anniu"
              :class="{ newStyle: 0 === number }"
              @click="change(0)"
            >
              按顺序
            </button>
            <button
              class="btn_anniu"
              :class="{ newStyle: 1 === number }"
              @click="change(1)"
            >
              按题型
            </button>
            <div style="height: 20px" />
            <el-row :gutter="24" class="card-line" style="padding-left: 10px">
              <el-tag type="success">回答正确</el-tag>
              <el-tag type="danger">回答错误</el-tag>
              <el-tag type="info">未作答</el-tag>
              <el-tag type="warning">当前试题</el-tag>
              <div style="margin-bottom: 15px" />
            </el-row>
          </div>
          <!-- <div> -->
          <div v-if="0 === number">
            <!-- <p>我是题型</p> -->
            <p class="card-title">答题卡</p>
            <el-row :gutter="24" class="card-line" style="padding-left: 10px">
              <el-tag
                v-for="(item, index) in quList"
                :key="index"
                style="width: calc(100% / 8); text-align: center"
                :type="cardItemClass(item.exercised, item.quId, item.isRight)"
                @click="selectQuNum(item, index)"
              >{{ index + 1 }}</el-tag>
            </el-row>
          </div>

          <div v-if="1 === number">
            <div v-if="paperData.radioList.length > 0">
              <p class="card-title">单选题</p>
              <el-row :gutter="24" class="card-line">
                <el-tag
                  v-for="(item, index) in paperData.radioList"
                  :key="index"
                  :type="cardItemClass(item.exercised, item.quId, item.isRight)"
                  @click="selectQuId(item, index)"
                >
                  {{ index + 1 }}</el-tag>
              </el-row>
            </div>

            <div
              v-if="paperData.multiList  != undefined && paperData.multiList.length > 0"
            >
              <p class="card-title">多选题</p>
              <el-row :gutter="24" class="card-line">
                <el-tag
                  v-for="(item, index) in paperData.multiList"
                  :key="index"
                  :type="cardItemClass(item.exercised, item.quId, item.isRight)"
                  @click="selectQuId(item, index)"
                >{{ index + 1 }}</el-tag>
              </el-row>
            </div>

            <div
              v-if="paperData.judgeList  != undefined && paperData.judgeList.length > 0"
            >
              <p class="card-title">判断题</p>
              <el-row :gutter="24" class="card-line">
                <el-tag
                  v-for="(item, index) in paperData.judgeList"
                  :key="index"
                  :type="cardItemClass(item.exercised, item.quId, item.isRight)"
                  @click="selectQuId(item, index)"
                >{{ index + 1 }}</el-tag>
              </el-row>
            </div>
            <div v-if="paperData.saqList  != undefined && paperData.saqList.length > 0">
              <p class="card-title">简答题</p>
              <el-row :gutter="24" class="card-line">
                <el-tag
                  v-for="(item, index) in paperData.saqList"
                  :key="index"
                  :type="cardItemClass(item.exercised, item.quId, item.isRight)"
                  @click="selectQuId(item, index)"
                >{{ index + 1 }}</el-tag>
              </el-row>
            </div>
          </div>

          <!-- </div> -->
        </el-card>
      </el-col>

      <el-col :span="19" :xs="24">
        <el-card class="qu-content content-h">
          <p v-if="quDetail.content">
            <span :class="['question-type', {
              'single-choice': quDetail.quType === 1,
              'multiple-choice': quDetail.quType === 2,
              'judgment': quDetail.quType === 3,
              'short-answer': quDetail.quType === 4
            }]">{{ shouQuType(quDetail.quType) }}</span>
            {{ number == 1 ? curTypeIndex + 1 : currentQuIndex + 1 }}.{{ quDetail.content }}
          </p>
          <p v-if="quDetail.image != null && quDetail.image != ''">
            <el-image 
            :src="quDetail.image" 
            style="max-width: 100px;max-height:100%" 
            :preview-src="[quDetail.image]" />
          </p>
          <div v-if="quDetail.quType == 1 || quDetail.quType == 3">
            <el-radio-group v-model="radioValue" :disabled="isAnswered">
              <el-radio
                v-for="item in quDetail.options"
                :key="item.id"
                :label="item.id"
                @click="handleRadioClick(item.id)"
              >
                <!-- 给选项文本添加 getOptionClass 动态 class -->
                <span :class="getOptionClass(item)">
                  {{ numberToLetter(item.sort + 1) }}.{{ item.content }}
                </span>
                <div v-if="item.image && item.image  != ''" style="clear: both">
                  <el-image :src="item.image" style="max-width: 100px" />
                </div>
              </el-radio>
            </el-radio-group>

          </div>

          <div v-if="quDetail.quType == 2">
            <el-checkbox-group v-model="multiValue" :disabled="isAnswered">
              <el-checkbox
                v-for="item in quDetail.options"
                :key="item.id"
                :label="item.id"
              >
                <span :class="getOptionClass(item)">
                  {{ numberToLetter(item.sort + 1) }}.{{ item.content }}
                </span>
                <div v-if="item.image && item.image  != ''" style="clear: both">
                  <el-image :src="item.image" style="max-width: 100px" />
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
          <div v-if="quDetail.quType === 4">
            <el-input
              v-model="radioValue"
              :disabled="isAnswered"
              type="textarea"
              resize="none"
              :clearable="true"
              placeholder="请输入答案"
            />
          </div>

          <div v-if="rightQuAnswer.data != null">
            <p v-if="quDetail.quType != 4">
              <span :class="{ 'bg-green': rightQuAnswer.msg === '回答正确', 'bg-red': rightQuAnswer.msg === '回答错误' }">
                {{ rightQuAnswer.msg }}
              </span>
            </p>
            <p v-if="rightQuAnswer.data">正确答案：{{ getRightAnswer() }}</p>
            <p>试题分析：{{ rightQuAnswer.data.analysis }}</p>
          </div>

          <div style="margin-top: 20px">
            <el-button
              v-if="showPrevious"
              type="primary"
              icon="el-icon-back"
              @click="handPrevious()"
            >
              {{ preText }}
            </el-button>

            <el-button
              v-if="showNext"
              type="warning"
              icon="el-icon-right"
              @click="handNext()"
            >
              {{ nextText }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 答题统计弹框 -->
    <el-dialog title="答题统计" :visible.sync="statisticsDialogVisible" width="400px">
      <div class="statistics-container">
        <!-- 上半部分：统计数字 -->
        <el-row :gutter="20" class="stat-row">
          <el-col :span="8" class="stat-item">
            <div class="stat-number">{{ totalQuestions }}</div>
            <div class="stat-label">总题数</div>
          </el-col>
          <el-col :span="8" class="stat-item">
            <div class="stat-number">{{ correctCount }}</div>
            <div class="stat-label">正确</div>
          </el-col>
          <el-col :span="8" class="stat-item">
            <div class="stat-number">{{ wrongCount }}</div>
            <div class="stat-label">错误</div>
          </el-col>
        </el-row>
        <el-row :gutter="20" class="stat-row" style="margin-top: 20px;">
          <el-col :span="12" class="stat-item">
            <div class="stat-number">{{ unansweredCount }}</div>
            <div class="stat-label">未答</div>
          </el-col>
          <el-col :span="12" class="stat-item">
            <div class="stat-number">{{ accuracyRate }}</div>
            <div class="stat-label">正确率</div>
          </el-col>
        </el-row>
        <!-- 下半部分：进度条直观显示正确率 -->
        <el-progress
          :percentage="parseInt(accuracyRate)"
          status="success"
          stroke-width="16"
          style="margin-top: 20px;"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onDialogCancel">取消</el-button>
        <el-button type="primary" @click="finishExam">结束刷题</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { getQuestion, getQuestionDetail, submitAnswer, getAnswerInfo } from '@/api/exercise'
import { Loading } from 'element-ui'

export default {
  name: 'ExamProcess',

  data() {
    return {
      flag: false,
      showAnalysis: 0,
      repoId: '',
      repoTitle: '',
      quId: '',
      curQuId: '',
      quDetail: {},
      quList: [],
      preText: '上一题',
      nextText: '提交答案',
      rightQuAnswer: {},
      number: 0,
      receivedRow: null,
      curTypeIndex: 0,
      curListIndex: 1,
      isFullscreen: false,
      showPrevious: false,
      showNext: true,
      loading: false,
      handleText: '提交',
      pageLoading: false,
      currentQuIndex: 0,
      paperId: '',
      cardItem: {},
      allItem: [],
      quData: {
        answerList: []
      },
      paperData: {
        radioList: [],
        multiList: [],
        judgeList: [],
        saqList: []
      },
      radioValue: '',
      multiValue: [],
      answeredIds: [],
      debounceFlag: false,
      isAnswered: false,
      // 新增属性，控制统计弹框的显示
      statisticsDialogVisible: false
    }
  },
  computed: {
    // 根据不同模式统计总题数
    totalQuestions() {
      if (this.number === 0) {
        return this.quList.length
      } else {
        return this.paperData.radioList.length +
               this.paperData.multiList.length +
               this.paperData.judgeList.length +
               this.paperData.saqList.length
      }
    },
    // 统计回答正确的题数
    correctCount() {
      let list = []
      if (this.number === 0) {
        list = this.quList
      } else {
        list = this.paperData.radioList.concat(
          this.paperData.multiList,
          this.paperData.judgeList,
          this.paperData.saqList
        )
      }
      return list.filter(item => item.isRight).length
    },
    // 统计已作答但回答错误的题数
    wrongCount() {
      let list = []
      if (this.number === 0) {
        list = this.quList
      } else {
        list = this.paperData.radioList.concat(
          this.paperData.multiList,
          this.paperData.judgeList,
          this.paperData.saqList
        )
      }
      return list.filter(item => item.exercised && !item.isRight).length
    },
    // 未作答题数
    unansweredCount() {
      return this.totalQuestions - this.correctCount - this.wrongCount
    },
    // 正确率计算
    accuracyRate() {
      let list = []
      if (this.number === 0) {
        list = this.quList
      } else {
        list = this.paperData.radioList.concat(
          this.paperData.multiList,
          this.paperData.judgeList,
          this.paperData.saqList
        )
      }
      // 筛选出所有已作答的题目
      const answered = list.filter(item => item.exercised)
      if (answered.length === 0) return '0%'
      // 对于非简答题，根据 isRight 判断；简答题只要作答就认为正确
      const correct = answered.filter(item => {
        if (item.quType === 4) {
          return true
        } else {
          return item.isRight
        }
      }).length
      const rate = Math.round((correct / answered.length) * 100)
      return rate + '%'
    }

  },
  watch: {
    radioValue(newVal) {
      if (newVal && (this.quDetail.quType === 1 || this.quDetail.quType === 3) && !this.isAnswered) {
        this.isAnswered = true
        this.$nextTick(() => {
          this.fillAnswer()
          this.showAnalysis = 1
          this.nextText = '下一题'
          this.showButton()
        })
      }
    }
  },
  created() {
    this.repoId = this.$route.query.repoId
    this.repoTitle = this.$route.query.repoTitle
    this.test()
  },
  methods: {
    // 根据答案返回class
    getOptionClass(option) {
      // 未提交答案不做样式处理
      if (!this.rightQuAnswer.data) return ''
      // 从返回的答案数据中查找对应选项
      const answerOption = this.rightQuAnswer.data.options.find(o => o.id === option.id)
      const isCorrect = answerOption ? answerOption.isRight : false
      let isChosen = false
      // 单选和判断题：用户选择存储在 radioValue 中
      if (this.quDetail.quType === 1 || this.quDetail.quType === 3) {
        isChosen = (this.radioValue === option.id)
      } else if (this.quDetail.quType === 2) {
        // 多选题：用户选择存储在 multiValue 数组中
        isChosen = this.multiValue.includes(option.id)
      }
      // 正确选项始终显示绿色背景
      if (isCorrect) {
        return 'bg-green'
      }
      // 如果用户选中但该选项不正确，则显示红色背景
      if (isChosen) {
        return 'bg-red'
      }
      return ''
    },

    // 重置答题状态
    resetAnswerState() {
      this.radioValue = ''
      this.multiValue = []
      this.rightQuAnswer = {}
      this.showAnalysis = 0
      this.isAnswered = false
    },
    // 处理题型切换逻辑
    handleQuestionTypeSwitch() {
      const currentList = {
        1: this.paperData.radioList,
        2: this.paperData.multiList,
        3: this.paperData.judgeList,
        4: this.paperData.saqList
      }[this.curListIndex]

      if (this.curTypeIndex < currentList.length - 1) {
        this.curTypeIndex++
        this.curQuId = currentList[this.curTypeIndex].quId
      } else {
        const nextTypeMap = {
          1: { index: 2, list: this.paperData.multiList },
          2: { index: 3, list: this.paperData.judgeList },
          3: { index: 4, list: this.paperData.saqList },
          4: { index: 1, list: this.paperData.radioList }
        }
        const nextType = nextTypeMap[this.curListIndex]
        this.curListIndex = nextType.index
        this.curTypeIndex = 0
        this.curQuId = nextType.list[0]?.quId || ''
      }
    },

    // 修改结束刷题逻辑：确认后显示答题统计弹框
    exitFun() {
      this.statisticsDialogVisible = true
    },

    // 点击弹框中“确定结束”按钮后的处理：关闭弹框并进行跳转或其他后续处理
    finishExam() {
      // 删除当前标签页
      this.$store.commit('menu/REMOVE_TAG', {
        title: this.$route.meta.title, // 从路由元数据中获取标题
        path: this.$route.path,
        name: this.$route.name // 添加路由名称
      })
      this.statisticsDialogVisible = false
      this.$router.push({ name: 'exercise-center', params: { id: this.paperId }})
    },
    // 取消弹框，不结束刷题
    onDialogCancel() {
      this.statisticsDialogVisible = false
    },
    async test() {
    
      const res = await getQuestion(null, this.repoId)
      this.quList = res.data

      // 清空各题型数组
      this.paperData.radioList = []
      this.paperData.multiList = []
      this.paperData.judgeList = []
      this.paperData.saqList = []

      if (this.number === 1) {
        this.quList.forEach((item) => {
          if (item.quType === 1) {
            this.paperData.radioList.push(item)
          } else if (item.quType === 2) {
            this.paperData.multiList.push(item)
          } else if (item.quType === 3) {
            this.paperData.judgeList.push(item)
          } else if (item.quType === 4) {
            this.paperData.saqList.push(item)
          }
        })
        this.quList = []
        // 初始化试题Id
        this.initQuId()
      }
      this.getCurrentQuDetial()
    },
    // 获取试题Id列表
    async getQuestionList() {
      const res = await getQuestion(null, this.repoId)
      this.quList = res.data

      // 按顺序
      // if (this.number == 0) {
      this.paperData.radioList = []
      this.paperData.multiList = []
      this.paperData.judgeList = []
      this.paperData.saqList = []
      // }
      // 按题型
      if (this.number === 1) {
        this.quList.forEach((item) => {
          if (item.quType === 1) {
            this.paperData.radioList.push(item)
          } else if (item.quType === 2) {
            this.paperData.multiList.push(item)
          } else if (item.quType === 3) {
            this.paperData.judgeList.push(item)
          } else if (item.quType === 4) {
            this.paperData.saqList.push(item)
          }
        })
        this.quList = []
        // 初始化试题Id
        this.initQuId()
      }
    },
    numberToLetter(sort) {
      switch (sort) {
        case 1:
          return 'A'
        case 2:
          return 'B'
        case 3:
          return 'C'
        case 4:
          return 'D'
        case 5:
          return 'E'
        case 6:
          return 'F'
        default:
          return '' // 默认值，或者可以处理其他情况
      }
    },
    change(index) {
      this.number = index
      this.preText = '上一题'
      this.nextText = '提交答案'
      this.showAnalysis = 0

      this.getQuestionList()

      setTimeout(() => this.getCurrentQuDetial(), 200)
    },

    getRightAnswer() {
      // eslint-disable-next-line vue/no-template-shadow
      const arr = []
      if (this.rightQuAnswer.data) {
        this.rightQuAnswer.data.options.forEach((option) => {
          if (option.isRight) {
            arr.push(this.numberToLetter(option.sort + 1))
          }
        })
      }

      let res = arr.join(',')
      if (this.quDetail.quType === 4) {
        res = this.rightQuAnswer.data.options[0].content
      }

      return res
      // },100)
    },
    // 按题型选择题号
    selectQuId(item, index) {
      this.resetAnswerState()
      this.curTypeIndex = index
      this.curQuId = item.quId
      if (item.quType === 1) {
        this.curListIndex = 1
      } else if (item.quType === 2) {
        this.curListIndex = 2
      } else if (item.quType === 3) {
        this.curListIndex = 3
      } else if (item.quType === 4) {
        this.curListIndex = 4
      }
      this.getCurrentQuDetial()
    },
    async getCurrentQuDetial() {
      this.isAnswered = false
      const loading = Loading.service({
        text: '拼命加载中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      if (this.number === 0) {
        setTimeout(() => {
          getQuestionDetail(this.quList[this.currentQuIndex].quId).then((res) => {
            this.quDetail = res.data
          })
        }, 100)
      } else if (this.number === 1) {
        getQuestionDetail(this.curQuId).then((res) => {
          this.quDetail = res.data
        })
      }
      loading.close()
    },

    // 答题卡样式
    cardItemClass(answered, id, isright) {
      if (id === this.quDetail.id) {
        return 'warning'
      } else if (isright) {
        return 'success'
      } else if (answered) {
        return 'danger'
      } else {
        return 'info'
      }
    },
    // 用户按顺序刷题，初始化试题Id
    initQuId() {
      this.curQuId = this.paperData.radioList[0].quId
    },

    // 用于按顺序刷题，初始化试题顺序
    initCurrentIndex() {
      var exercisedCount = 0

      setTimeout(() => {
        this.quList.forEach((element) => {
          if (element.exercised) {
            this.currentQuIndex++
            exercisedCount++
          }
          if (exercisedCount === this.quList.length) {
            this.currentQuIndex = 0
          }
        })
        this.showButton()
      }, 100)
    },
    // 选择题号
    selectQuNum(item, index) {
      // alert(this.nextText)
      // alert(this.rightQuAnswer);
      const loading = Loading.service({
        text: '拼命加载中',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      // this.fillAnswer();
      this.preText = '上一题'
      this.nextText = '提交答案'
      this.resetAnswerState()
      this.currentQuIndex = index
      this.showButton()
      this.getCurrentQuDetial()
      loading.close()
    },

    // 题干显示题型
    shouQuType(type) {
      if (type === 1) {
        return '单选题'
      } else if (type === 2) {
        return '多选题'
      } else if (type === 3) {
        return '判断题'
      } else if (type === 4) {
        return '简答题'
      }
    },
    async handNext() {
      const loading = Loading.service({
        text: '拼命加载中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      try {
        if (this.nextText === '结束刷题') {
          this.exitFun()
          loading.close()
          return
        }
        if (this.nextText === '下一题') {
          this.resetAnswerState()
          if (this.number === 0) {
            if (this.currentQuIndex < this.quList.length - 1) {
              this.currentQuIndex++
            }
          } else if (this.number === 1) {
            this.handleQuestionTypeSwitch()
          }
          await this.getCurrentQuDetial()
          this.nextText = '提交答案'
        } else if (this.nextText === '提交答案') {
          await this.fillAnswer()
          this.isAnswered = true
          this.showAnalysis = 1
          if ((this.number === 0 && this.currentQuIndex === this.quList.length - 1) ||
              (this.number === 1 && this.isLastQuestion())) {
            this.nextText = '结束刷题'
          } else {
            this.nextText = '下一题'
          }
        }
        this.showButton()
      } catch (error) {
        console.error('操作失败:', error)
        this.$message.error('操作失败，请重试')
      } finally {
        loading.close()
      }
    },
    async fillAnswer() {
      if (this.radioValue || this.multiValue.length) {
        let params = {}
        if (this.radioValue) {
          params = {
            repoId: this.quDetail.repoId,
            quId: this.quDetail.id,
            answer: this.radioValue,
            quType: parseInt(this.quDetail.quType)
          }
        }
        if (this.multiValue.length) {
          params = {
            repoId: this.quDetail.repoId,
            quId: this.quDetail.id,
            answer: this.multiValue.join(','),
            quType: parseInt(this.quDetail.quType)
          }
        }
        const res = await submitAnswer(params)
        this.rightQuAnswer = res
      }
      this.getQuestionList()
    },
    async showButton() {
      if (this.currentQuIndex === 0) {
        this.showPrevious = false
      } else {
        this.showPrevious = true
      }
      if ((this.number === 0 && this.currentQuIndex === this.quList.length - 1) ||
          (this.number === 1 && this.isLastQuestion())) {
        if (this.isAnswered) {
          this.nextText = '结束刷题'
        } else {
          this.nextText = '提交答案'
        }
      }
    },
    async handPrevious() {
      const loading = Loading.service({
        text: '拼命加载中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      this.resetAnswerState()
      if (this.currentQuIndex > 0) {
        this.currentQuIndex--
        this.showButton()
        this.getCurrentQuDetial()
        
        // 检查上一题是否已作答
        const previousQuestion = this.quList[this.currentQuIndex]
        if (previousQuestion && previousQuestion.exercised) {
          try {
            const res = await getAnswerInfo(previousQuestion.repoId, previousQuestion.quId)
            this.rightQuAnswer = res
            if (res.data) {
              this.isAnswered = true
              if (res.data.quType === 1 || res.data.quType === 3 || res.data.quType === 4) {
                if (res.data.quType === 1 || res.data.quType === 3) {
                  this.radioValue = parseInt(res.data.answerContent)
                } else if (res.data.quType === 4) {
                  this.radioValue = res.data.answerContent
                }
              } else if (res.data.quType === 2) {
                const arr = res.data.answerContent.split(',')
                arr.forEach(element => {
                  for (let index = 0; index < res.data.options.length; index++) {
                    const option = res.data.options[index]
                    if (parseInt(element) === option.id) {
                      this.multiValue.push(option.id)
                    }
                  }
                })
              }
            }
          } catch (error) {
            console.error('获取答案信息失败:', error)
            this.$message.error('获取答案信息失败')
          }
        } else {
          // 如果题目未作答，重置相关状态
          this.isAnswered = false
          this.rightQuAnswer = {}
        }
      }
      loading.close()
    },
    handleRadioClick(answer) {
      this.radioValue = answer
    },
    isLastQuestion() {
      if (this.number === 1) {
        const currentList = this.getCurrentTypeList()
        return this.curTypeIndex === currentList.length - 1 &&
               this.curListIndex === this.getLastTypeIndex()
      }
      return false
    },
    getCurrentTypeList() {
      switch (this.curListIndex) {
        case 1: return this.paperData.radioList
        case 2: return this.paperData.multiList
        case 3: return this.paperData.judgeList
        case 4: return this.paperData.saqList
      }
    },
    getLastTypeIndex() {
      if (this.paperData.saqList.length > 0) return 4
      if (this.paperData.judgeList.length > 0) return 3
      if (this.paperData.multiList.length > 0) return 2
      return 1
    }
  }
}
</script>

<style scoped>
page {
  background: #ebecee;
}

.btn_anniu {
  width: 50%;
  padding: 10px 0;
  font-size: 19px;
  font-weight: bold;
  border: 0 solid #fff;
  color: #000;
  outline: none;
  background: #fff;
}

.newStyle {
  border-bottom: 2px solid #f0892e;
  color: #f0892e;
  font-size: 21px;
  font-weight: bold;
}

.qu-content div {
  line-height: 30px;
  width: 100%;
}

.el-checkbox-group label,
.el-radio-group label {
  width: 100%;
}

.content-h {
  height: calc(100vh - 110px);
  overflow-y: auto;
}

.card-title {
  background: #eee;
  line-height: 35px;
  text-align: center;
  font-size: 14px;
}

.card-line {
  padding-left: 10px;
}

.card-line span {
  cursor: pointer;
  margin: 2px;
}

::v-deep .el-radio,
.el-checkbox {
  padding: 9px 20px 9px 10px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-bottom: 10px;
  width: 100%;
}

.is-checked {
  border: #409eff 1px solid;
}

.el-radio img,
.el-checkbox img {
  max-width: 200px;
  max-height: 200px;
  border: #dcdfe6 1px dotted;
}

::v-deep .el-checkbox__inner {
  display: none;
}

::v-deep .el-radio__inner {
  display: none;
}

::v-deep .el-checkbox__label {
  line-height: 30px;
}

::v-deep .el-radio__label {
  line-height: 30px;
}

 .bg-green {
    background-color: #dff0d8; /* 绿色背景 */
    color: #3c763d;
    padding: 2px 4px;
    border-radius: 3px;
  }
  .bg-red {
    background-color: #f2dede; /* 红色背景 */
    color: #a94442;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .statistics-container {
  text-align: center;
  padding: 20px;
  background: #fff;
}
.stat-row {
  margin-bottom: 10px;
}
.stat-item {
  background-color: #f7f9fc;
  padding: 10px;
  border-radius: 8px;
}
.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.question-type {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 8px;
}

.single-choice {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.multiple-choice {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.judgment {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.short-answer {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

</style>
