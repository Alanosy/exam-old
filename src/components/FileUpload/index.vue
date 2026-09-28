<template>
  <div>
    <file-upload-local v-model="fileUrl" :accept="accept" :tips="tips" :list-type="listType" :action="action" :limit="limit" />
  </div>
</template>

<script>

import FileUploadLocal from './local'

export default {
  name: 'FileUpload',
  components: { FileUploadLocal },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    value: String,
    accept: {
      type: String,
      default: '*'
    },
    // eslint-disable-next-line vue/require-default-prop
    tips: String,
    listType: {
      type: String,
      default: 'picture'
    },
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
      fileUrl: ''
    }
  },

  watch: {
    // 检测查询变化
    value: {
      handler() {
        this.fillValue()
      }
    },

    // 检测查询变化
    fileUrl: {
      handler() {
        this.$emit('input', this.fileUrl)
      }
    }
  },
  mounted() {

  },

  created() {
    this.fillValue()
  },

  methods: {

    fillValue() {
      this.fileUrl = this.value
    }

  }
}
</script>
