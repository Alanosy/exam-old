<template>
  <el-container style="height: 700px; border: 1px solid #eee">
    <div class="left">
      <div class="fk">
        <!-- <div
          style="
            font-size: 25px;
            font-weight: 500;
            margin-left: 10px;
            padding: 10px 0 0 0;
          "
        >
          11
        </div> -->
        <div class="sj">
          <!-- <div>
            <span>得分</span>
            <span>50</span>
          </div>
          <div>
            <span>耗时</span>
            <span>50</span>
          </div>
          <div>
            <span>提交人</span>
            <span>50</span>
          </div> -->
          <el-divider />
          <p>
            共 <span style="color: #1890ff"> {{ waitQuList.length }} </span> 题, 共
            <span style="color: #1890ff">{{
              waitQuList.length * waitQuList[0].totalScore
            }}</span>
            分
          </p>
          <el-row>
            <el-tag
              v-for="(item, index) in waitQuList"
              :key="index"
              :type="index === quIndex ? 'success' : ''"
              class="type_tag"
              @click="handleTag(index)"
            >
              {{ index + 1 }}
            </el-tag>
          </el-row>
          <el-button type="success" class="ann" @click="subCorrect">提交批改</el-button>
        </div>
      </div>
    </div>

    <el-container>
      <el-main class="right">
        <el-col>
          <el-card class="qu_list">
            <div>
              <template v-for="(item, index) in waitQuList">
                <!-- eslint-disable-next-line vue/require-v-for-key -->
                <div :class="'index' + index">
                  <!-- 简答 -->
                  <el-row :gutter="24">
                    <el-col :span="20" style="text-align: left">
                      <!-- 题目: 序号、类型、题干 -->
                      <div>
                        <!-- <div class="qu_num">{{ item.quId }}</div>
                      【 简答题 】 -->
                        <div class="qu_content">{{ index + 1 }}. {{ item.quTitle }}</div>
                      </div>
                      <div class="content">
                        {{ item.answer }}
                      </div>
                      <!-- 题目解析 -->
                      <div class="qu_analysis">
                        <el-card>
                          <div style="display: flex; align-items: center">
                            <span style="color: #e6a23c">分数：</span>
                            <el-input
                              v-model="item.correctScore"
                              type="number"
                              style="width: 100px; margin-left: 20px"
                            />
                            <span
                              v-if="item.correctScore < 0 ||
                                item.correctScore > item.totalScore "
                              style="color: #f00; margin-left: 10px"
                            >

                              评分只能在 0-{{ item.totalScore }}之间
                            </span>
                          </div>
                          <div style="margin-top: 18px">
                            <span>参考答案:</span>
                            <br/>
                            <span>{{ item.refAnswer }}</span>
                            <br/><br/>
                            <span v-if="item.aiReason!==null">AI评分</span>
                            <br/>
                            <span v-if="item.aiReason!==null">{{ item.aiReason }}</span>
                          </div>
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
                          :value="item.totalScore"
                          class="qu_assign_score_content"
                        />
                        分
                      </el-row>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </div>
            <el-divider />
          </el-card>
        </el-col>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// {{ computedStatus(userForm.agencyBaseVO.status) }}
import { answerDetail, correct } from '@/api/answer'
export default {
//   computedStatus(val) {
//      ('val', val)
//     return val === '' ? '' : this.optionsBasic.statusMap[val]
// },
  name: 'ExamProcess',
  data() {
    return {
      quIndex: -1,
      // 考试信息
      info: {},
      // 待批改试题
      waitQuList: [],
      scoreData: null
    }
  },
  created() {
    this.info = JSON.parse(sessionStorage.getItem('answer_info'))

    this.getUserAnswerDetail()
  },
  methods: {
    // 点击答题卡题号, 右侧题目滑动
    handleTag(index) {
      // 高亮选中的题目index标签
      this.quIndex = index
      // 题目滑动到锚定点
      const page = document.querySelector('.index' + index)
      page.scrollIntoView()
    },
    // 获取用户作答信息
    async getUserAnswerDetail() {
      const params = { userId: this.info.userId, examId: this.info.examId }

      const res = await answerDetail(params)
      this.waitQuList = res.data
    },
    subCorrect() {
      const list = []
      // 校验合法
      for (let i = 0; i < this.waitQuList.length; i++) {
        const element = this.waitQuList[i]
        if (!element.correctScore) {
          // 显示警告的操作
          this.$message({
            message: `请先给第${i + 1}题评分`,
            type: 'error'
          })
          return
        }
        if (element.correctScore < 0 || element.correctScore > element.totalScore) {
          this.$message({
            message: `第${i + 1}题的评分只能在0-${element.totalScore}之间`,
            type: 'error'
          })
          return
        }
        const obj = {
          userId: element.userId,
          examId: element.examId,
          questionId: element.quId,
          score: element.correctScore
        }
        list.push(obj)
      }
      // 发送请求
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
.content {
  width: 97%;
  height: 60px;
  border: 1px solid #0a84ff;
  margin-top: 8px;
  margin-left: 10px;
  padding: 10px;
  font-weight: 200;
}
.ann {
  width: 130px;
  margin-top: 25px;
  margin-left: 15px;
}
.sj {
  margin-top: 10px;
  margin-left: 10px;
  line-height: 22px;
}
.fk {
  width: 200px;
  height: 100%;
  box-shadow: 0 0 15px rgb(197, 197, 197);
  margin: auto;
  margin-top: 20px;
  margin-left: 15px;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.left {
  width: 17%;
  height: 100%;
}
.right {
  width: 70%;
  height: 100%;
}
.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 95%;
  margin: 24px 0;
}
.type_tag {
  margin-right: 5px;
  margin-top: 10px;
}

// 试题内容样式
.qu_list {
  height: 100%;
  width: 100%;
  overflow: auto;
  page-break-after: always;

  .qu_num {
    display: inline-block;
    // background: url('~@/assets/images/tkxl/btbj.png') no-repeat 100% 100%;
    background-size: contain;
    height: 30px;
    width: 30px;
    line-height: 25px;
    color: #fff;
    font-size: 14px;
    text-align: center;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .qu_content {
    padding-left: 10px;
  }

  // 选项组
  .qu_choose_group {
    width: 100%;

    // 单个选项
    .qu_choose {
      display: block;
      margin: 10px;

      // 去除前面的radio
      ::v-deep .el-radio__input .el-radio__inner {
        display: none;
      }

      // 单个选项内容样式
      .qu_choose_tag {
        display: inline-flex;
        width: 90%;
        // 选项标签
        .qu_choose_tag_type {
          font-weight: bold;
          color: #0a84ff;
          width: 10px;
        }
        // 选项内容
        .qu_choose_tag_content {
          padding: 0 10px 10px 10px;
        }
        .qu_choose_tag_img {
          height: auto;
          display: block;
          margin: 10px;
        }

        .qu_choose_tag_el_image {
          clear: both;
          padding-top: 10px;
        }
      }
      // 选项答案
      .qu_choose_answer {
        float: right;
      }
    }
  }

  // 试题解析
  .qu_analysis {
    padding: 10px;

    .qu_analysis_content {
      padding-top: 10px;
    }
  }

  // 试题赋分
  .qu_assign_score {
    background: #f5f5f5;
    height: 100px;
    padding-top: 35px;

    .qu_assign_score_content {
      width: 80px;
    }
  }
}
</style>
