<template>
  <el-dialog
    top="2vh"
    title="考前汇总"
    :visible.sync="dialogVisible"
    width="80%"
    :before-close="handleClose"
  >
    <el-container style="height: 70vh; border: 1px solid #eee">
      <el-container>
        <el-main class="right">
          <el-col>
            <el-card class="qu_list">
              <div>
                <!-- 客观题部分 -->
                <template v-for="(item, index) in recordData">
                  <div
                    v-if="item.quType === 1 || item.quType === 2 || item.quType === 3"
                    :key="'obj-' + index"
                    :class="'index' + index"
                  >
                    <el-row :gutter="24">
                      <el-col :span="20" style="text-align: left">
                        <!-- 题干区域 -->
                        <div>
                          <div class="qu_content">
                            <span class="qu_num">{{ index + 1 }}. </span>{{ item.title }}
                          </div>
                          <div v-if="item.image != null && item.image != ''">
                            <el-image :src="item.image" style="max-width: 200px;" />
                          </div>
                        </div>

                        <!-- 选项区域 -->
                        <el-radio-group class="qu_choose_group">
                          <el-radio
                            v-for="(option, optionIndex) in item.option"
                            :key="'option-' + optionIndex"
                            :label="option.content"
                            border
                            class="qu_choose"
                            :class="{
                              'current': item.myOption != null && isCheck(item.myOption, option.sort),
                              'imgC': option.image != null && option.image != '',
                            }"
                          >
                            {{ numberToLetter(optionIndex) }}、{{ option.content }}
                            <div v-if="option.image != null && option.image != ''">
                              <el-image :src="option.image" style="max-width: 200px" class="qu_choose_tag_img" />
                            </div>
                          </el-radio>
                        </el-radio-group>

                        <!-- 我的答案区域 -->
                        <div class="qu_analysis">
                          <el-card>
                            <div>
                              <span>我的答案：</span>
                              <span
                                :style="{
                                  color: getAnswerColor(item.isRight)
                                }"
                              >
                                {{ numberToLetter(item.myOption) }}
                              </span>
                            </div>
                          </el-card>
                        </div>
                      </el-col>
                    </el-row>
                    <el-divider />
                  </div>
                </template>

                <!-- 主观题部分 -->
                <template v-for="(item, index) in recordData">
                  <div
                    v-if="item.quType === 4"
                    :key="'subj-' + index"
                    :class="'index' + index"
                  >
                    <el-row :gutter="24">
                      <el-col :span="20" style="text-align: left">
                        <!-- 题干部分 -->
                        <div>
                          <div class="qu_content">
                            <span class="qu_num">{{ index + 1 }}. </span>{{ item.title }}
                          </div>
                        </div>

                        <!-- 简答题内容区域 -->
                        <el-radio-group class="qu_choose_group">
                          <el-input
                            v-model="item.myOption"
                            style="margin-top: 10px"
                            type="textarea"
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            placeholder="请输入内容"
                            readonly
                          />
                        </el-radio-group>
                      </el-col>
                    </el-row>
                    <el-divider />
                  </div>
                </template>
              </div>
              <el-divider />
            </el-card>
          </el-col>
        </el-main>
      </el-container>
    </el-container>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取 消</el-button>
      <el-button type="primary" @click="onConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ExamSummaryDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    recordData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    // 检查选项是否被选中
    isCheck(myOption, sort) {
      if (!myOption) return false
      const arr = myOption.split(',').map(Number)
      return arr.includes(sort)
    },

    // 处理对话框关闭
    handleClose(done) {
      this.$emit('close')
      done()
    },

    // 取消按钮
    onCancel() {
      this.dialogVisible = false
    },

    // 确认按钮
    onConfirm() {
      this.$emit('confirm')
      this.dialogVisible = false
    },

    // 获取答案颜色
    getAnswerColor(isRight) {
      if (isRight === 1) return 'green'
      if (isRight === 0) return 'red'
      return 'gray'
    },

    // 将数字转换为字母
    numberToLetter(input) {
      if (input === null || input === undefined) return ''

      const numberToCharMap = {
        0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F'
      }

      // 处理单个数字
      if (typeof input === 'number' || /^\d+$/.test(input)) {
        return numberToCharMap[parseInt(input, 10)] || ''
      }

      // 处理逗号分隔的数字
      if (/^\d+(,\d+)*$/.test(input)) {
        return input.split(',')
          .map(num => numberToCharMap[parseInt(num.trim(), 10)] || '')
          .join(',')
      }

      return ''
    }
  }
}
</script>

<style scoped>
.right {
  width: 100%;
  height: 100%;
}

.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 95%;
  margin: 24px 0;
}

/* 试题内容样式 */
.qu_list {
  height: 100%;
  width: 100%;
  overflow: auto;
  page-break-after: always;
}

.qu_content {
  padding-left: 10px;
}

/* 题号样式 */
.qu_num {
  font-weight: bold;
  margin-right: 5px;
}

/* 选项组 */
.qu_choose_group {
  width: 100%;
}

/* 单个选项 */
.qu_choose {
  display: block;
  margin: 10px;
}

.current {
  background: #f5f5f5;
}

.imgC {
  height: 150px;
}

.qu_choose_tag_img {
  height: auto;
  display: block;
  margin: 10px;
}

/* 试题解析 */
.qu_analysis {
  padding: 10px;
}

.qu_analysis_content {
  padding-top: 10px;
}
</style>
