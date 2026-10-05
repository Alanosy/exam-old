<template>
  <div class="app-container">
    <div class="left">
      <el-card class="box-card">
        <span>登录时长</span>
        <div ref="charts" class="chart-div" />
      </el-card>
    </div>
    <div class="right">
      <el-card class="box-card">
        <span>最新公告</span>
        <div style="overflow: auto">
          <el-collapse accordion>
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <div v-for="(item, index) in noticePage.records" :key="index">
              <el-collapse-item
                v-if="item != null"
                :title="item.title"
                :name="index"
              >
                <div v-html="item.content" />
                <div class="noticeContent">
                  <div>{{ item.realName }}</div>
                  <div>{{ item.createTime }}</div>
                </div>
              </el-collapse-item>
            </div>
            <el-collapse-item
              v-if="noticePage.records.length === 0"
              title="暂无公告"
              name="default"
            >
              <div>目前没有最新公告，请稍后再查看。</div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { noticeGetNew } from '@/api/notice'
import { getDaily } from '@/api/stat'
import echarts from 'echarts'

export default {
  data() {
    return {
      load: '',
      activeNames: '',
      pageNum: 1,
      pageSize: 10,
      noticePage: { records: [] },
      dateArray: [],
      formattedData: [],
      option: {
        // title: { text: '登录时长' },
        tooltip: {},
        xAxis: {
          data: [] // 初始化为空，稍后用dateArray填充
        },
        yAxis: {},
        series: [
          {
            name: '登录时长(分钟)', // 更新系列名称以匹配单位变更
            type: 'bar',
            data: [] // 初始化为空，稍后用转换后的分钟数据填充
          }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      myChart: null // 用于存储 ECharts 实例
    }
  },
  created() {
    this.getDailyFun()
    this.getNotice(this.pageNum, this.pageSize)
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.myChart) {
      this.myChart.dispose() // 销毁图表实例，避免内存泄漏
    }
  },
  methods: {
    // 获取登录时长
    getDailyFun() {
      getDaily().then((res) => {
        if (res.code === 1) {
          const currentDate = new Date()
          // 生成从今天往回15天的日期数组
          for (let i = 0; i <= 14; i++) {
            const date = new Date(
              currentDate.getTime() - i * 24 * 60 * 60 * 1000
            )
            this.dateArray.push(date.toISOString().split('T')[0])
          }
          // 确保dateArray是倒序的
          this.dateArray.reverse()

          // 整理原始数据，确保每个日期都有记录，没有的补0
          const dataMap = res.data.reduce((acc, item) => {
            acc[item.loginDate] = item.totalSeconds
            return acc
          }, {})

          this.formattedData = this.dateArray.map((date) => {
            const secondsOnDate = dataMap[date] || 0
            return secondsOnDate / 60 // 转换秒为分钟
          })

          // 更新图表配置
          this.option.xAxis.data = this.dateArray
          this.option.series[0].data = this.formattedData
          this.$nextTick(() => {
            this.initCharts() // 确保DOM已更新后再初始化图表
          })
        }
      })
    },
    // 分页查询
    async getNotice(pageNum, pageSize) {
      const params = { pageNum: pageNum, pageSize: pageSize }
      const res = await noticeGetNew(params)
      if (res && res.data) {
        this.noticePage = res.data
      } else {
        // 如果请求失败或没有数据，使用默认值
        this.noticePage = { records: [] }
      }
      // this.transformData(res);
    },
    initCharts() {
      this.myChart = echarts.init(this.$refs.charts)
      this.myChart.setOption(this.option)
    },
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    handleNodeClick(data) {
      //  (data);
    }
  }
}
</script>
<style scoped>
/* 最外层容器 */
.app-container {
  height: calc(100vh - 111px);
  display: flex;
  transform: translateY(-20px);
  justify-content: space-evenly;
  align-items: center;
}
.right,
.left {
  width: 45%;
  height: 68%;
}
.box-card {
  width: 100%;
  height: 100%;
  /* 登录时长图表 */
 .chart-div {
    height: 50vh;
    width: 100%;
  }
}
.noticeContent {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 20px;
}
</style>
