<template>
  <el-select
    v-model="selectedClassIds"
    :multiple="isMultiple"
    :remote-method="fetchClasses"
    filterable
    remote
    reserve-keyword
    clearable
    :disabled="isEdit"
    automatic-dropdown
    placeholder="选择或搜索班级"
    class="class-selector"
    @change="handleClassChange"
  >
    <el-option
      v-for="cls in classList"
      :key="cls.id"
      :label="cls.gradeName"
      :value="cls.id"
    />
  </el-select>
</template>

<script>
import { fetchClasses } from '@/api/class_' // 假设这是获取班级列表的API

export default {
  name: 'ClassSelect',
  props: {
    isMultiple: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    // eslint-disable-next-line vue/require-default-prop
    value: [String, Array],
    // eslint-disable-next-line vue/require-default-prop
    excludes: Array // 如果有需要排除的班级ID，可以传入此参数
  },
  data() {
    return {
      classList: [], // 存储班级列表
      selectedClassIds: [] // 当前选中的班级ID
    }
  },
  watch: {
    isEdit(val) {
      this.isEdit = val
    },
    value: {
      handler(newValue) {
        this.selectedClassIds = newValue
      },
      immediate: true // 确保在组件创建时立即设置初始值
    }
  },
  created() {
    this.fetchClasses()
  },
  methods: {
    fetchClasses(query = '') {
      // 使用query参数进行过滤，如果需要可以根据props.excludes进一步过滤
      fetchClasses({ pageNum: 1, pageSize: 1000, name: query }).then((response) => {
        this.classList = response.data || [] // 假设API响应包含一个records字段
      })
    },
    // handleClassChange(selectedIds) {
    //   // 根据需要处理选中班级的逻辑，比如查找选中班级的详细信息
    //   const selectedClasses = this.classList.filter(cls => selectedIds.includes(cls.id))
    //   this.$emit('change', selectedClasses) // 发送选中的班级对象数组到父组件
    //   this.$emit('input', selectedIds) // 更新v-model绑定的值
    // }
    handleClassChange(selectedIds) {
      // 确保selectedIds始终是一个数组，即使是单选情况下传入的是单个值
      const idsArray = Array.isArray(selectedIds) ? selectedIds : [selectedIds]

      // 根据需要处理选中班级的逻辑，比如查找选中班级的详细信息
      const selectedClasses = this.classList.filter((cls) => idsArray.includes(cls.id))

      // 发送选中的班级对象数组到父组件，即使是单选，也以数组形式发送，数组中只有一个元素
      this.$emit('change', selectedClasses)

      // 更新v-model绑定的值，如果是单选，父组件应该期望接收到的是单个值，但这里仍按照多选逻辑发送数组
      // 父组件可以通过判断数组长度来区分是单选还是多选

      this.$emit('input', selectedIds)
    }
  }
  //   handleClassChange(selectedIds) {
  //   // 将选中的班级ID数组转换为逗号分隔的字符串
  //   const selectedIdsStr = selectedIds.join(',');

  //   // 根据需要处理选中班级的逻辑，比如查找选中班级的详细信息
  //   const selectedClasses = this.classList.filter(cls => selectedIds.includes(cls.id));

  //   // 发送选中的班级ID字符串到父组件，如果你的父组件需要这种格式
  //   this.$emit('change-as-string', selectedIdsStr);

  //   // 同时也发送选中的班级对象数组到父组件，保持原有逻辑
  //   this.$emit('change', selectedClasses);

  //   // 更新v-model绑定的值
  //   this.$emit('input', selectedIds);
  // }
}
</script>
