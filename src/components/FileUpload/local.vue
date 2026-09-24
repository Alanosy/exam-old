<template>
  <div class="content">
    <el-upload
      v-model="fileUrl"
      :action="action"
      :accept="accept"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-exceed="handleExceed"

      :drag="listType !== 'picture' && listType !== 'text'"
      :limit="limit"
      :headers="header"
      :file-list="fileList"
      :list-type="listType"
    >

      <el-button v-if="listType==='picture' || listType==='text'" size="small" type="primary">点击上传</el-button>

      <i v-if="listType !== 'picture' && listType !== 'text'" class="el-icon-upload" />
      <div v-if="listType !== 'picture' && listType !== 'text'" class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div v-if="tips" slot="tip" class="el-upload__tip">{{ tips }}</div>
    </el-upload>

  </div>

</template>

<script>

import { getToken } from '@/utils/auth'
import { fileNameFromUrl, mediaSrc, parseAudioList, stringifyAudioList, withOriginalName } from '@/utils/audio'

export default {
  name: 'FileUploadLocal',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String,
    // eslint-disable-next-line vue/require-default-prop
    accept: String,
    // eslint-disable-next-line vue/require-default-prop
    tips: String,
    // eslint-disable-next-line vue/require-default-prop
    listType: String,
    action: {
      type: String,
      default: 'api/questions/uploadImage'
    },
    limit: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      fileList: [],
      fileUrl: '',
      header: {}
    }
  },
  computed: {
    multiple() {
      return this.limit > 1
    }
  },

  watch: {
    // 检测查询变化
    value: {
      handler() {
        this.fillValue()
      }
    }
  },

  created() {
    this.fillValue()
    this.header = { Authorization: getToken() }
  },

  methods: {

    fillValue() {
      this.fileUrl = this.value
      const urls = this.multiple ? parseAudioList(this.value) : (this.value ? [this.value] : [])
      this.fileList = urls.map(url => ({
        name: fileNameFromUrl(url),
        url: mediaSrc(url),
        storedUrl: url
      }))
    },

    // 文件超出个数限制时的钩子
    handleExceed() {
      this.$message.warning(`最多只能上传 ${this.limit} 个文件`)
    },
    // 删除文件之前的钩子
    beforeRemove() {
      return this.$confirm(`确定移除文件吗？`)
    },

    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      if (!this.multiple) {
        this.$emit('input', '')
        this.fileList = []
        return
      }
      const urls = (fileList || []).map(item => item.storedUrl || withOriginalName(item.url, item.name)).filter(Boolean)
      this.$emit('input', stringifyAudioList(urls))
    },

    // 文件上传成功时的钩子
    handleSuccess(response, file) {
      if (response.code === 1) {
        this.$message({
          type: 'success',
          message: response.msg
        })
        const storedUrl = withOriginalName(response.data, file && file.name)
        if (!this.multiple) {
          this.$emit('input', storedUrl)
          this.fileList = []
          return
        }
        const urls = parseAudioList(this.value)
        const exists = urls.some(item => mediaSrc(item) === mediaSrc(storedUrl))
        if (storedUrl && !exists) {
          urls.push(storedUrl)
        }
        this.$emit('input', stringifyAudioList(urls))
        this.fileList = []
        return
      }
    }

  }
}
</script>
