<template>
  <div class="app-container">
    <!-- 数据卡片区域 -->
    <div class="stats-container">
      <div class="stats-row">
        <!-- 班级总数卡片 -->
        <div class="stat-card">
          <div class="icon-container">
            <el-image
              style="width: 50px; height: 50px; margin-top: 10px"
              :src="iconUrl.gradeImgUrl"
            />
          </div>
          <div class="stat-info">
            <div class="stat-title">班级总数</div>
            <div class="stat-value">{{ classCount }}</div>
          </div>
        </div>

        <!-- 试题总数卡片 -->
        <div class="stat-card">
          <div class="icon-container">
            <el-image
              style="width: 50px; height: 50px; margin-top: 10px"
              :src="iconUrl.questionImgUrl"
            />
          </div>
          <div class="stat-info">
            <div class="stat-title">试题总数</div>
            <div class="stat-value">{{ quCount }}</div>
          </div>
        </div>

        <!-- 试卷总数卡片 -->
        <div class="stat-card">
          <div class="icon-container">
            <el-image
              style="width: 50px; height: 50px; margin-top: 10px"
              :src="iconUrl.examImgUrl"
            />
          </div>
          <div class="stat-info">
            <div class="stat-title">试卷总数</div>
            <div class="stat-value">{{ examCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner" />
      <div class="loading-text">数据加载中...</div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 图表区域 -->
    <div v-else class="charts-container">
      <div ref="classChart" class="chart-box" />
      <div ref="examChart" class="chart-box" />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import { classCount, classExamCount, classAllCounts } from '@/api/stat'
import questionImgUrl from '@/assets/img/questions.png'
import examImgUrl from '@/assets/img/paper.png'
import gradePng from '@/assets/img/grade.png'
export default {
  name: 'AdminDashboard',
  data() {
    return {
      iconUrl: {
        // eslint-disable-next-line no-undef
        gradeImgUrl: gradePng,
        questionImgUrl: questionImgUrl,
        examImgUrl: examImgUrl
      },
      // 图表数据
      chartData: [],
      chartDataTitle: [],
      chartData2: [],
      chartDataTitle2: [],

      // 统计数据
      classCount: 0,
      quCount: 0,
      examCount: 0,

      // 状态控制
      loading: true,
      error: false,
      errorMessage: '',

      // 图表实例
      classChartInstance: null,
      examChartInstance: null
    }
  },

  async created() {
    try {
      // 获取所有统计数据
      await this.fetchAllData()
    } catch (error) {
      this.handleError(error)
    }
  },

  mounted() {
    this.$nextTick(() => {
      // 初始化图表
      this.initCharts()

      // 添加窗口大小变化监听
      window.addEventListener('resize', this.handleResize)
    })
  },

  beforeDestroy() {
    // 销毁图表实例，避免内存泄漏
    if (this.classChartInstance) {
      this.classChartInstance.dispose()
    }
    if (this.examChartInstance) {
      this.examChartInstance.dispose()
    }

    // 移除窗口大小变化监听
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    // 获取所有数据
    async fetchAllData() {
      this.loading = true
      try {
        // 获取总数统计
        const res0 = await classAllCounts()
        if (res0.data) {
          this.classCount = res0.data.classCount
          this.quCount = res0.data.questionCount
          this.examCount = res0.data.examCount
        } else {
          this.classCount = 0
          this.quCount = 0
          this.examCount = 0
        }

        // 获取班级人数分布
        const res1 = await classCount()
        if (res1.data) {
          this.processChartData(res1.data)
        } else {
          this.chartData = [{ name: '暂无数据', value: 1 }]
          this.chartDataTitle = ['暂无数据']
          if (this.classChartInstance) {
            this.updateClassChart()
          }
        }

        // 获取班级试卷分布
        const res2 = await classExamCount()
        if (res2.data) {
          this.processChartData2(res2.data)
        } else {
          this.chartData2 = [{ name: '暂无数据', value: 1 }]
          this.chartDataTitle2 = ['暂无数据']
          if (this.examChartInstance) {
            this.updateExamChart()
          }
        }

        this.loading = false
      } catch (error) {
        this.handleError(error)
      }
    },

    // 处理错误
    handleError(error) {
      this.loading = false
      this.error = true
      this.errorMessage = `数据加载失败: ${error.message || '未知错误'}`
      console.error('数据加载失败:', error)
    },

    // 处理窗口大小变化
    handleResize() {
      if (this.classChartInstance) {
        this.classChartInstance.resize()
      }
      if (this.examChartInstance) {
        this.examChartInstance.resize()
      }
    },

    // 初始化图表
    initCharts() {
      this.$nextTick(() => {
        // 确保DOM已经渲染
        this.classChartInstance = echarts.init(this.$refs.classChart)
        this.examChartInstance = echarts.init(this.$refs.examChart)

        // 设置图表配置
        this.updateClassChart()
        this.updateExamChart()
      })
    },

    // 处理班级人数分布数据
    processChartData(data) {
      if (data.length === 0) {
        this.chartData = [{ name: '暂无数据', value: 1 }]
        this.chartDataTitle = ['暂无数据']
      } else {
        this.chartData = data.map((item) => ({
          name: item.gradeName,
          value: item.totalStudent
        }))
        this.chartDataTitle = this.chartData.map((item) => item.name)
      }

      // 如果图表已初始化，则更新图表
      if (this.classChartInstance) {
        this.updateClassChart()
      }
    },

    // 处理班级试卷分布数据
    processChartData2(data) {
      // 新增逻辑：检查数据是否为空
      if (data.length === 0) {
        // 设置默认数据
        this.chartData2 = [{ name: '暂无数据', value: 1 }]
        this.chartDataTitle2 = ['暂无数据']
      } else {
        this.chartData2 = data.map((item) => ({
          name: item.gradeName,
          value: item.total
        }))
        this.chartDataTitle2 = this.chartData2.map((item) => item.name)
      }

      // 如果图表已初始化，则更新图表
      if (this.examChartInstance) {
        this.updateExamChart()
      }
    },

    // 更新班级人数分布图表
    updateClassChart() {
      if (!this.classChartInstance) return

      const option = {
        // 标题
        title: {
          text: '班级人数分布',
          x: 'center' // 标题位置
          // textStyle: { //标题内容的样式
          //   color: '#000',
          //   fontStyle: 'normal',
          //   fontWeight: 100,
          //   fontSize: 16 //主题文字字体大小，默认为18px
          // },
        },
        // stillShowZeroSum: true,
        // 鼠标划过时饼状图上显示的数据
        tooltip: {
          trigger: 'item',
          formatter: '{a}<br/>{b}:{c} ({d}%)'
        },
        // 图例
        legend: {
          // 图例  标注各种颜色代表的模块
          // orient: 'vertical',//图例的显示方式  默认横向显示
          bottom: 10, // 控制图例出现的距离  默认左上角
          left: 'center', // 控制图例的位置
          // itemWidth: 16,//图例颜色块的宽度和高度
          // itemHeight: 12,
          textStyle: {
            // 图例中文字的样式
            color: '#000',
            fontSize: 16
          },
          data: this.chartDataTitle
          // ["一班", "二班", "三班", "四班"], //图例上显示的饼图各模块上的名字
        },
        // 饼图中各模块的颜色
        color: ['#32dadd', '#b6a2de', '#5ab1ef', '#454599'],
        series: {
          name: '班级人数',
          type: 'pie', // echarts图的类型   pie代表饼图
          radius: '60%', // 饼图中饼状部分的大小所占整个父元素的百分比
          center: ['50%', '50%'], // 整个饼图在整个父元素中的位置
          // data:''               //饼图数据
          data: this.chartData,
          itemStyle: {
            normal: {
              label: {
                show: true // 饼图上是否出现标注文字 标注各模块代表什么  默认是true
                // position: 'inner',//控制饼图上标注文字相对于饼图的位置  默认位置在饼图外
              },
              labelLine: {
                show: true // 官网demo里外部标注上的小细线的显示隐藏    默认显示
              }
            }
          }
        }
      }

      this.classChartInstance.setOption(option)
    },

    // 更新班级试卷分布图表
    updateExamChart() {
      if (!this.examChartInstance) return

      const option = {
        title: {
          text: '班级试卷分布',
          x: 'center' // 标题位置
          // textStyle: { //标题内容的样式
          //   color: '#000',
          //   fontStyle: 'normal',
          //   fontWeight: 100,
          //   fontSize: 16 //主题文字字体大小，默认为18px
          // },
        },
        // stillShowZeroSum: true,
        // 鼠标划过时饼状图上显示的数据
        tooltip: {
          trigger: 'item',
          formatter: '{a}<br/>{b}:{c} ({d}%)'
        },
        // 图例
        legend: {
          // 图例  标注各种颜色代表的模块
          // orient: 'vertical',//图例的显示方式  默认横向显示
          bottom: 10, // 控制图例出现的距离  默认左上角
          left: 'center', // 控制图例的位置
          // itemWidth: 16,//图例颜色块的宽度和高度
          // itemHeight: 12,
          textStyle: {
            // 图例中文字的样式
            color: '#000',
            fontSize: 16
          },
          data: this.chartDataTitle2
          // ["", "", "", ""], //图例上显示的饼图各模块上的名字
        },
        // 饼图中各模块的颜色
        color: [
          'rgb(253, 133, 133)',
          'rgb(172, 10, 172)',
          'rgb(70, 35, 194)',
          'rgb(44, 199, 23)'
        ],
        // 饼图数据
        series: {
          name: '试卷数量',
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          data: this.chartData2,
          itemStyle: {
            normal: {
              label: {
                show: true // 饼图上是否出现标注文字 标注各模块代表什么  默认是true
                // position: 'inner',//控制饼图上标注文字相对于饼图的位置  默认位置在饼图外
              },
              labelLine: {
                show: true // 官网demo里外部标注上的小细线的显示隐藏    默认显示
              }
            }
          }
        }
      }

      this.examChartInstance.setOption(option)
    }
  }
}
</script>

<style scoped>
/* 统计卡片容器 */
.stats-container {
  margin: auto;
  border-radius: 16px;
  width: 100%;
  padding: 20px;
  margin-top: 30px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  background-color: #fff;
}

.stats-row {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

/* 统计卡片 */
.stat-card {
  /* width: 30%;
  min-width: 250px;
  height: 80px; */
  display: flex;
  background-color: #fff;
  transition: all 0.3s ease;
}

.icon-container {
  display: flex;
  transform: translateY(-6px);
  align-items: center;
}

.stat-info {
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  justify-content: center;
}

.stat-title {
  font-size: 22px;
  font-weight: 500;
  /* padding: 0 0 5px 10px; */
  color: #333;
}

.stat-value {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-top: 4px;
  /* padding: 0 0 0 10px; */
  color: #409EFF;
}

/* 图表容器 */
.charts-container {
  width: 100%;
  height: 60vh;
  display: flex;
  margin: auto;
  margin-top: 30px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.chart-box {
  width: 48%;
  min-width: 300px;
  border-radius: 16px;
  height: 100%;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  background-color: #fff;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  width: 100%;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}

/* 错误提示 */
.error-message {
  text-align: center;
  color: #F56C6C;
  font-size: 18px;
  margin-top: 30px;
  padding: 20px;
  background-color: #FEF0F0;
  border-radius: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }

  .stat-card {
    /* width: 100%; */
    /* margin-bottom: 15px; */
  }

  .charts-container {
    flex-direction: column;
  }

  .chart-box {
    width: 100%;
    height: 400px;
  }
}
</style>
