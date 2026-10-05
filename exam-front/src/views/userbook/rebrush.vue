<template>
  <div
    style="
      width: 100%;
      height: 100%;
      background-color: #f0f2f5;
      padding: 20px 0 0;
    "
  >
    <el-row :gutter="24">
      <el-col :span="24">
        <el-card style="margin-bottom: 10px">
          错题本
          <el-button
            :loading="loading"
            style="float: right; margin-top: -10px"
            type="primary"
            icon="el-icon-plus"
            @click="handHandExam()"
          >
            {{ handleText }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-card class="qu-content content-h">
          <!-- 题干 -->
          <p v-if="quData.content">
            <span>({{ getQuestionType(quData.quType) }}) {{ index + 1 }}.</span>
            {{ quData.content }}
          </p>
          <p v-if="quData.image != null && quData.image != ''">
            <el-image :src="quData.image" style="max-width: 200px" />
          </p>
          <div v-if="quData.quType === 1 || quData.quType === 3">
            <!-- 选项 -->
            <el-radio-group v-model="radioValue">
              <el-radio
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
                >{{ numberToLetter(item.sort) }}.{{ item.content }}
                <div
                  v-if="item.image != null && item.image != ''"
                  style="clear: both"
                >
                  <el-image :src="item.image" style="max-width: 200px" />
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          <div
            v-if="flag == true && (quData.quType === 1 || quData.quType === 3)"
          >
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span
                >正确答案:
                {{ numberToLetter(parseInt(failQuData.rightAnswers)) }}</span
              >
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
          </div>
          <div v-if="quData.quType === 2">
            <el-checkbox-group v-model="multiValue">
              <el-checkbox
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
                >{{ numberToLetter(item.sort) }}.{{ item.content }}
                <div
                  v-if="item.image != null && item.image != ''"
                  style="clear: both"
                >
                  <el-image :src="item.image" style="max-width: 200px" />
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <div v-if="flag == true && quData.quType === 2">
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span
                >正确答案: {{ numberToLetter(failQuData.rightAnswers) }}</span
              >
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
          </div>

          <div v-if="quData.quType === 4">
            <el-input
              v-model="saqTextarea"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="请输入内容"
            />
            <!-- <el-checkbox-group v-model="multiValue"> -->
            <!-- <el-checkbox
                v-for="item in quData.answerList"
                :key="item.id"
                :label="item.id"
                >{{  numberToLetter(item.sort)  }}.{{ item.content }}
                <div v-if="item.image != null && item.image != ''" style="clear: both">
                  <el-image :src="item.image" style="max-width: 100%" />
                </div>
              </el-checkbox> -->
            <!-- </el-checkbox-group> -->
          </div>
          <div
            v-if="flag == true && quData.quType === 4"
            style="margin-top: 10px"
          >
            <!-- <div>
              <span>我的答案:{{ myAnswers }}</span>
            </div> -->
            <div>
              <span>正确答案: {{ failQuData.rightAnswers }}</span>
            </div>
            <div>
              <span>试题分析: {{ failQuData.analysis }}</span>
            </div>
          </div>
          <div style="margin-top: 20px">
            <!-- <el-button type="primary" @click="handPrevious()">
              上一题
            </el-button> -->
            <el-button type="warning" icon="el-icon-right" @click="handNext()">
              下一题
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { fullBook, getSingleQu, getUserBookList } from "@/api/userbook";
export default {
  data() {
    return {
      repoId: "",
      repoTitle: "",
      routeData: {},
      // 全屏/不全屏
      isFullscreen: false,
      showPrevious: false,
      showNext: true,
      loading: false,
      handleText: "提交",
      pageLoading: false,
      nextText: false,
      userBookList: [],
      index: 0,
      quDataLen: 0,
      examId: "",
      failQuData: {},
      flag: false,
      // 当前题目内容
      quData: {
        answerList: [],
      },
      // 试卷信息
      radioValue: "",
      showAnswer: false,
      // 多选选定值
      multiValue: [],
      // 已答ID
      answeredIds: [],
      saqTextarea: "",
      myAnswers: "",
      lastIndex: 0,
      paperData: {
        leftSeconds: 99999,
        radioList: [],
        multiList: [],
        judgeList: [],
      },
    };
  },
  created() {
    this.routeData = this.$route.query.zhi;
    this.examId = localStorage.getItem("userbook_examId");
    this.getUserBookListFun();
    // this.getSingleQuFun()
  },

  methods: {
    handHandExam() {
      const that = this;
      // 交卷保存答案
      const msg = "确认要提交吗？";
      that
        .$confirm(msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          // 删除当前标签页
          this.$store.commit('menu/REMOVE_TAG', {
            title: this.$route.meta.title, // 从路由元数据中获取标题
            path: this.$route.path,
            name: this.$route.name // 添加路由名称
          })
          this.statisticsDialogVisible = false
          this.$router.push({ name: "wrong-book" });
        })
        .catch(() => {
          that.$message({
            type: "info",
            message: "交卷已取消，您可以继续作答！",
          });
        });
    },

    getSingleQuFun(quId) {
      getSingleQu(quId).then((res) => {
        this.quData = res.data;
      });
    },
    getUserBookListFun() {
      getUserBookList(this.examId).then((res) => {
        this.userBookList = res.data;
        this.quDataLen = res.data.length;
        this.getSingleQuFun(res.data[this.index]["quId"]);
        this.lastIndex = this.userBookList.length;
      });
    },
    numberToLetter(input) {
      const numberToCharMap = {
        0: "A",
        1: "B",
        2: "C",
        3: "D",
        4: "E",
        5: "F",
      };

      // 辅助函数：将单个数字（字符串或数字类型）转换为字母
      const singleNumberToLetter = (num) =>
        numberToCharMap[parseInt(num, 10)] || "";

      // 辅助函数：处理逗号分隔的数字字符串
      const commaSeparatedNumbersToLetters = (str) => {
        const numbers = str.split(",").map((item) => parseInt(item.trim(), 10));
        return numbers.map((number) => numberToCharMap[number] || "").join(",");
      };

      // 判断输入类型并调用相应函数
      if (/^\d+$/.test(input)) {
        // 单个数字（字符串形式也可以匹配）
        return singleNumberToLetter(input);
      } else if (/^\d+(,\d+)*$/.test(input)) {
        // 包含逗号分隔的数字字符串
        return commaSeparatedNumbersToLetters(input);
      } else {
        return ""; // 输入不符合预期，返回空字符串或根据需要处理
      }
    },
    // 获取题目类型
    getQuestionType(type) {
      const typeMap = {
        1: '单选题',
        2: '多选题',
        3: '判断题',
        4: '简答题'
      }
      return typeMap[type] || '未知类型'
    },
    /**
     * 下一题
     */
    handNext() {
      if (!this.flag) {
        this.index = this.index + 1;
        this.handSave(this.index);
      } else {
        if (this.index >= this.lastIndex) {
          this.handHandExam();
        }
        this.handSave(this.index);
      }
    },

    /**
     * 上一题
     */
    handPrevious() {
      this.index = this.index - 1;
      this.handSave(this.index);
    },
    // 保存答案
    handSave(index) {
      if (index - 1 >= this.lastIndex) {
        this.handHandExam();
      } else {
        let answer;
        if (this.quData.quType === 2) {
          // 多选题
          answer = this.multiValue.join(",");
        } else if (this.quData.quType === 1 || this.quData.quType === 3) {
          // 单选题或判断题
          answer = this.radioValue;
        } else if (this.quData.quType === 4) {
          // 简答题
          answer = this.saqTextarea;
        }

        const params = {
          examId: this.examId,
          quId: this.userBookList[index - 1]["quId"],
          answer: answer,
        };

        // this.myAnswers = params.answer;
        if (!this.flag) {
          fullBook(params).then((res) => {
            if (res.code) {
              this.failQuData = res.data;
              if (res.data.correct) {
                this.$message({
                  type: "success",
                  message: res.msg,
                });
              } else {
                this.$message({
                  type: "error",
                  message: res.msg,
                });
              }
            } else {
              this.$message({
                type: "error",
                message: res.msg,
              });
            }
          });
        }

        if (this.flag === true) {
          // 查找详情
          this.fetchQuData(index);
          this.flag = false;
        } else {
          this.flag = true;
        }
      }
      // });
    },
    // 试卷详情
    fetchQuData(index) {
      this.getSingleQuFun(this.userBookList[index]["quId"]);
    },
  },
};
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
</style>
