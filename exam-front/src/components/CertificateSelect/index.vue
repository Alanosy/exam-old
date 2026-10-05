<template>
  <el-select
    v-model="selectedCertificateIds"
    :multiple="isMultiple"
    :remote-method="fetchCertificates"
    filterable
    remote
    reserve-keyword
    clearable
    automatic-dropdown
    placeholder="选择或搜索证书"
    class="certificate-selector"
    @change="handleCertificateChange"
  >
    <el-option
      v-for="cert in certificateList"
      :key="cert.id"
      :label="cert.certificateName"
      :value="cert.id"
    />
  </el-select>
</template>

<script>
import { certificatePaging } from '@/api/certificate' // 假定的API调用

export default {
  name: 'CertificateSelect',
  props: {
    isMultiple: {
      type: Boolean,
      default: false
    },
    // eslint-disable-next-line vue/require-default-prop
    value: [String, Array], // 支持单选或多选
    // eslint-disable-next-line vue/require-default-prop
    excludes: Array // 可选的排除项
  },
  data() {
    return {
      certificateList: [], // 证书列表
      selectedCertificateIds: [] // 选中的证书ID
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.selectedCertificateIds = newValue
      },
      immediate: true
    }
  },
  created() {
    this.fetchCertificates()
  },
  methods: {
    fetchCertificates() {
      certificatePaging({ pageNum: 1, pageSize: 1000 }).then((response) => {
        this.certificateList = response.data.records || []
      })
    },
    handleCertificateChange(selectedIds) {
      const selectedCertificates = this.certificateList.filter((cert) =>
        selectedIds.includes(cert.id)
      )
      this.$emit('change', selectedCertificates) // 发送选中的证书对象数组到父组件
      this.$emit('input', selectedIds) // 更新v-model绑定的值
    }
  }
}
</script>
