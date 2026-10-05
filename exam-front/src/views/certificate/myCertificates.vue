<template>
  <div class="app-container">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="考试名称">
        <el-input v-model="formInline.searchTitle" placeholder="考试名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="searchExam">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- table -->

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
      <el-table-column fixed label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="certificateName" label="证书名称" align="center" />
      <el-table-column prop="certificationNuit" label="证书颁发单位" align="center" />

      <el-table-column prop="examName" label="考试名称" align="center" />
      <el-table-column prop="createTime" label="获奖时间" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="preview(row)"
          >预览证书</el-button>
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

    <el-dialog
      title="证书预览和下载"
      :visible.sync="dialogVisible"
      width="60%"
      :before-close="handleClose"
    >
      <div id="pdfDom">
        <div class="proBox">
          <p class="tit"><center>荣誉证书</center></p>
          <p class="con">
            <span>恭喜</span>
            <span class="con-name">{{ jwtInfo.realName }}</span>同学：<br>
          </p>
          <p class="con-text">
            <span>在{{ currentdata.examName }}考试中荣获{{ currentdata.certificateName }}证书，特发此状，以资鼓励！</span>
          </p>
          <p class="con-height">
            <span><center>{{ level }}</center></span>
          </p>
          <!-- <p class="con-text">荣誉称号，特发此状，以资鼓励。</p> -->
          <div class="con-unit">
            <p class="time">证书编号：{{ currentdata.code }}</p>
            <p class="time">发证单位：{{ currentdata.certificationNuit }}</p>
            <p class="time">发证时间：{{ currentdata.createTime }}</p>
          </div>
          <div v-show="isShow" class="chapter">
            <canvas id="chapterCanvas" width="150" height="150" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-switch
          v-model="downType"
          inactive-color="#67c23a"
          active-text="图片下载"
          inactive-text="pdf下载"
          style="margin-right: 20px"
        />
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getPdf('#pdfDom')">下载</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { certificateMy } from '@/api/certificate'
import { getTokenInfo } from '@/utils/jwtUtils'
export default {

  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      // 从本地缓存中获得当前登录账号和等级
      userName: localStorage.getItem('username'),
      level: localStorage.getItem('level'),
      // 获取当前日期
      start: '',
      dialogVisible: false,
      pageData: null, // 接收html格式代码
      htmlTitle: '荣誉证书',
      isShow: true,
      formInline: {
        searchTitle: ''
      },
      isCanvas: false,
      downType: true, // false为 pdf , true为图片
      currentdata: {},
      currentUser: '',
      jwtInfo: {}
    }
  },
  created() {
    this.getCerPage()

    this.jwtInfo = getTokenInfo()
  },
  methods: {
    searchExam() {
      this.getCerPage(this.pageNum, this.pageSize, this.formInline.searchTitle)
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getCerPage(this.pageNum, val)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getCerPage(val, this.pageSize)
    },
    // 分页查询
    async getCerPage(pageNum, pageSize, examName) {
      const params = { pageNum: pageNum, pageSize: pageSize, examName: examName }
      const res = await certificateMy(params)
      this.data = res.data
    },
    handleClose() {
      this.dialogVisible = false
    },
    preview(row) {
      this.currentdata = row
      var vm = this
      // 获取当前日期
      var data = new Date(new Date().setHours(0, 0, 0, 0))
      vm.start = data.getFullYear() + '-' + (data.getMonth() + 1) + '-' + data.getDate()

      this.dialogVisible = true
      this.$nextTick(() => {
        if (!this.isCanvas) {
          // 只绘画一次
          this.isCanvas = true
          this.getChapter()
        }
      })
    },
    getChapter() {
      this.getChapter = this.getChapter.bind(this)
    }
  }
}
</script>

<style>
.border {
  width: 90%;
  height: 550px;
  margin: auto;
  margin-top: 40px;
  box-shadow: 0px 0px 7px 4px #f0f2f5;
}
::v-deep .el-dialog__body {
  padding: 0px;
  display: flex;
  justify-content: center;
}
#pdfDom {
  /* 要想pdf周边留白，要在这里设置 */
  padding: 20px;
  width: 750px;
}
.proBox {
  /* 奖状的模板 */
  background: url("../../assets/img/zs.jpeg") no-repeat;

  background-size: cover;
  width: 750px;
  height: 525px;
  padding: 90px 94px;
  box-sizing: border-box;
  margin: 0 auto;
  position: relative;
  color: #000;
  font-family: SimSun;
}
.tit {
  color: #cf0c0c;
  font-size: 36px;
  font-weight: 700;
  position: relative;
  top: -6px;
  left: 8px;
  letter-spacing: 20px;
  font-family: STHeiti;
  margin: 20px 0;
}
.proid {
  text-align: right;
  margin: 0;
  font-weight: 500;
}

.con {
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin: 10px 0;
  line-height: 32px;
  text-indent: 2em;
}
.con-text {
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  margin: 10px 0;
  line-height: 32px;
  text-indent: 5em;
}
.con-name {
  font-family: 华文行楷, STXingkai;
  border-bottom: 2px solid #000;
}
.con-height {
  font-family: 华文行楷, STXingkai;
  font-weight: 700;
  font-size: 2em;
}
.con-unit {
  display:flex;
  justify-content: right;
  flex-direction: column;
  padding-left: 100px;
  font-size: 18px;
  font-weight: 700;
  position: absolute;
  right: 130px;
  bottom: 100px;
  /* text-align: center; */
  letter-spacing: 3px;
}
.con-unit p {
  margin: 5px 0;
}
.con-footer {
  font-size: 18px;
  font-weight: 700;
  position: absolute;
  bottom: 45px;
  left: 0;
  right: 0;
  text-align: center;
}
.chapter {
  border-radius: 50%;
  position: absolute;
  bottom: 75px;
  right: 134px;
}
.button {
  margin: 50px 50px;
  position: absolute;
  font-family: 华文行楷, STXingkai;
  font-weight: 700;
  font-size: 2em;
}
</style>
