<template>
  <div>
    <!-- kaitou -->
    <div
      style="
        width: 98%;
        background-color: #fef0f0;
        height: 35px;
        margin: auto;
        display: flex;
        margin-top: 10px;
      "
    >
      <div
        style="
          color: rgb(228 59 59);
          align-items: center;
          display: flex;
          margin-left: 10px;
          letter-spacing: 0.1em;
        "
      >
        点击'开始考试'后将自动进入考试,请诚信考试！
      </div>
    </div>
    <!-- 内容 -->
    <div
      style="
        width: 98%;
        height: 400px;
        margin: auto;
        margin-top: 10px;
        background-color: #f0f2f5;
      "
    >
      <div style="padding: 40px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">考试名称:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.title }}</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">考试时长:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.examDuration.toString() + " 分钟" }}</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">试卷总分:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.grossScore }}</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">及格分数:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.passedScore }}</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">发布人:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.username }}</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">单选题数量:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.radioCount }}</span>
        <span style="margin-left: 5px; font-size: 14px">({{ data.radioScore }}分)</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">多选题数量:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.multiCount }}</span>
        <span style="margin-left: 5px; font-size: 14px">({{ data.multiScore }}分)</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">判断题数量:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.judgeCount }}</span>
        <span style="margin-left: 5px; font-size: 14px">({{ data.judgeScore }}分)</span>
      </div>
      <div style="padding: 15px 0 0 50px; letter-spacing: 0.1em">
        <span style="font-size: 14px">简答题数量:</span>
        <span style="margin-left: 5px; font-size: 14px">{{ data.saqCount }}</span>
        <span style="margin-left: 5px; font-size: 14px">({{ data.saqScore }})</span>
      </div>
    </div>
    <!-- 按钮 -->
    <el-row class="ann">
      <el-button type="primary" @click="startExam()">▶ 开始考试</el-button>
      <!-- <el-button type="primary" plain style="margin-left: 20px">返回</el-button> -->
    </el-row>
  </div>
</template>

<script>
import { getExamDetail, examStart } from '@/api/exam'
export default {
  data() {
    return {
      receivedRow: null,
      data: {
        title: ''
      }
    }
  },
  created() {
    this.receivedRow = localStorage.getItem('examInfo_examId')
    this.getExamDetils(localStorage.getItem('examInfo_examId'))
  },
  methods: {
    // 分页查询
    async getExamDetils(examId) {
      const res = await getExamDetail(examId)
      this.data = res.data
    },
    startExam() {
      examStart(this.receivedRow).then((res) => {
        if (res.code) {
          // 删除当前标签页
          this.$store.commit('menu/REMOVE_TAG', {
            title: this.$route.meta.title, // 从路由元数据中获取标题
            path: this.$route.path,
            name: this.$route.name // 添加路由名称
          })
          localStorage.setItem('examId', this.receivedRow)
          this.$router.push({ name: 'start-exam', query: { zhi: this.receivedRow }})
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.ann {
  margin-top: 15px;
  margin-left: 20px;
}
</style>
