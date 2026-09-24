<template>
  <div class="app-container student-dashboard">
    <div class="dash-panel left">
      <div class="panel-head">
        <h3>登录时长</h3>
        <p>近 15 天学习活跃度</p>
      </div>
      <div ref="charts" class="chart-div" />
    </div>
    <div class="dash-panel right">
      <div class="panel-head">
        <h3>最新公告</h3>
        <p>展开可查看详情</p>
      </div>
      <div class="notice-wrap">
        <el-collapse accordion @change="onNoticeExpand">
          <!-- eslint-disable-next-line vue/no-template-shadow -->
          <div v-for="(item, index) in noticePage.records" :key="index">
            <el-collapse-item
              v-if="item != null"
              :title="item.title"
              :name="index"
            >
              <div v-if="item._loading" class="notice-loading">加载中...</div>
              <div v-else v-html="item.content" />
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
    </div>
  </div>
</template>

<script>
import { noticeGetNew, noticeDetail } from '@/api/notice'
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
        color: ['#14b8a6'],
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.86)',
          borderWidth: 0,
          textStyle: { color: '#fff' }
        },
        grid: {
          left: 40,
          right: 20,
          top: 30,
          bottom: 40
        },
        xAxis: {
          data: [],
          axisLine: { lineStyle: { color: '#cbd5e1' }},
          axisLabel: { color: '#64748b', fontSize: 11 }
        },
        yAxis: {
          splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' }},
          axisLine: { show: false },
          axisLabel: { color: '#64748b' }
        },
        series: [
          {
            name: '登录时长(分钟)',
            type: 'bar',
            barWidth: '42%',
            itemStyle: {
              barBorderRadius: [6, 6, 0, 0],
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: '#2dd4bf' },
                  { offset: 1, color: '#0d9488' }
                ]
              }
            },
            data: []
          }
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      myChart: null
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
      this.myChart.dispose()
    }
  },
  methods: {
    getDailyFun() {
      getDaily().then((res) => {
        if (res.code === 1) {
          const currentDate = new Date()
          for (let i = 0; i <= 14; i++) {
            const date = new Date(
              currentDate.getTime() - i * 24 * 60 * 60 * 1000
            )
            this.dateArray.push(date.toISOString().split('T')[0])
          }
          this.dateArray.reverse()

          const dataMap = res.data.reduce((acc, item) => {
            acc[item.loginDate] = item.totalSeconds
            return acc
          }, {})

          this.formattedData = this.dateArray.map((date) => {
            const secondsOnDate = dataMap[date] || 0
            return secondsOnDate / 60
          })

          this.option.xAxis.data = this.dateArray
          this.option.series[0].data = this.formattedData
          this.$nextTick(() => {
            this.initCharts()
          })
        }
      })
    },
    async getNotice(pageNum, pageSize) {
      const params = { pageNum: pageNum, pageSize: pageSize }
      const res = await noticeGetNew(params)
      if (res && res.data) {
        this.noticePage = res.data
      } else {
        this.noticePage = { records: [] }
      }
    },
    async onNoticeExpand(name) {
      if (name === '' || name === 'default' || name == null) {
        return
      }
      const item = this.noticePage.records[name]
      if (!item || item.id == null) {
        return
      }
      if (item.content) {
        return
      }
      this.$set(item, '_loading', true)
      try {
        const res = await noticeDetail(item.id)
        if (res && res.data) {
          this.$set(item, 'content', res.data.content || '')
        }
      } finally {
        this.$set(item, '_loading', false)
      }
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
.student-dashboard {
  min-height: calc(100vh - 100px);
  display: flex;
  gap: 20px;
  align-items: stretch;
  padding-top: 8px;
}

.dash-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px rgba(15, 23, 42, 0.05);
  padding: 20px 20px 12px;
  display: flex;
  flex-direction: column;
}

.panel-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.panel-head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.chart-div {
  flex: 1;
  min-height: 360px;
  width: 100%;
  margin-top: 8px;
}

.notice-wrap {
  margin-top: 12px;
  overflow: auto;
  flex: 1;
}

.noticeContent {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 12px;
  margin-top: 12px;
  color: #94a3b8;
  font-size: 12px;
}

.notice-loading {
  color: #94a3b8;
  font-size: 13px;
}

@media screen and (max-width: 991px) {
  .student-dashboard {
    height: auto;
    min-height: calc(100vh - 50px);
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .chart-div {
    min-height: 240px;
    height: 240px;
  }
}
</style>
