<template>
  <div class="rich-text-editor">
    <!-- 隐藏的文件上传input -->
    <el-upload
      class="avatar-uploader"
      :action="uploadUrl"
      :accept="acceptTypes"
      :show-file-list="false"
      :headers="headers"
      :before-upload="beforeUpload"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      style="display: none"
    >
      <input id="quillEditorUploadInput" type="file" />
    </el-upload>

    <!-- 富文本编辑器 -->
    <quill-editor
      ref="quillEditor"
      v-model="content"
      :options="editorOption"
      :disabled="disabled"
      @blur="onEditorBlur"
      @focus="onEditorFocus"
      @ready="onEditorReady"
      @change="onEditorChange"
    />
  </div>
</template>

<script>
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { getToken } from "@/utils/auth";

export default {
  name: "RichTextEditor",
  components: {
    quillEditor,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: "请输入内容",
    },
    height: {
      type: [String, Number],
      default: "300px",
    },
    uploadUrl: {
      type: String,
      default: process.env.VUE_APP_BASE_API + "/upload/image",
    },
    acceptTypes: {
      type: String,
      default: "image/*,video/*",
    },
    toolbarOptions: {
      type: Array,
      default: () => [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        ["image", "video"],
        ["clean"],
      ],
    },
  },
  data() {
    return {
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      editorOption: {
        modules: {
          toolbar: {
            container: this.toolbarOptions,
            handlers: {
              image: this.handleImageClick,
              video: this.handleVideoClick,
            },
          },
        },
        placeholder: this.placeholder,
        theme: "snow",
      },
      loading: false,
    };
  },
  computed: {
    content: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    // 点击图片按钮
    handleImageClick() {
      const input = document.querySelector("#quillEditorUploadInput");
      input.setAttribute("accept", "image/*");
      input.click();
    },

    // 点击视频按钮
    handleVideoClick() {
      const input = document.querySelector("#quillEditorUploadInput");
      input.setAttribute("accept", "video/*");
      input.click();
    },

    // 上传前处理
    beforeUpload(file) {
      this.loading = true;
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.$message.error("上传文件大小不能超过10MB!");
        return false;
      }
      return true;
    },

    // 上传成功
    uploadSuccess(res, file) {
      this.loading = false;
      if (res.code !== 200) {
        this.$message.error(res.msg || "上传失败");
        return;
      }

      const quill = this.$refs.quillEditor.quill;
      const length = quill.getSelection().index;
      const url = res.data;
      const type = url.substring(url.lastIndexOf(".") + 1);

      // 根据文件类型插入内容
      if (type === "mp4" || type === "MP4") {
        quill.insertEmbed(length, "video", url);
      } else {
        quill.insertEmbed(length, "image", url);
      }

      quill.setSelection(length + 1);
      this.$emit("upload-success", res);
    },

    // 上传失败
    uploadError(err) {
      this.loading = false;
      this.$message.error("上传失败");
      this.$emit("upload-error", err);
    },

    // 获取编辑器实例
    getEditor() {
      return this.$refs.quillEditor.quill;
    },

    // 设置内容
    setContent(content) {
      this.content = content;
    },

    // 清空内容
    clear() {
      this.content = "";
    },

    // 失去焦点事件
    onEditorBlur(quill) {
      this.$emit("blur", quill);
    },

    // 获得焦点事件
    onEditorFocus(quill) {
      this.$emit("focus", quill);
    },

    // 准备富文本编辑器
    onEditorReady(quill) {
      if (this.disabled) {
        quill.enable(false);
      }
      this.$emit("ready", quill);
    },

    // 内容改变事件
    onEditorChange({ quill, html, text }) {
      this.$emit("change", { quill, html, text });
    },
  },
};
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.rich-text-editor >>> .ql-editor {
  min-height: 200px;
  height: v-bind(height);
}

.rich-text-editor >>> .ql-toolbar {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.rich-text-editor >>> .ql-container {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  font-size: 14px;
}

/* 上传按钮样式 */
.rich-text-editor >>> .avatar-uploader {
  display: none;
}
</style>
