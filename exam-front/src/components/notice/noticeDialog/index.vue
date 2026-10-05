<template>
  <el-dialog :title="title" :visible.sync="visible" width="60%">
    <el-form :model="noticeForm" label-width="80px">
      <el-form-item label="公告标题">
        <el-input v-model="noticeForm.title" autocomplete="off" :disabled="!isEdit" />
      </el-form-item>
      <el-form-item label="是否公开">
        <el-switch
          v-model="noticeForm.isPublic"
          :disabled="!isEdit || roleEdit"
          active-color="#13ce66"
          inactive-color="#ff4949"
        />
      </el-form-item>
      <el-form-item v-if="!noticeForm.isPublic" label="公告班级">
        <ClassSelect
          v-model="noticeForm.gradeIds"
          :is-edit="!isEdit"
          is-multiple
        />
      </el-form-item>
      <el-form-item label="公告内容">
        <div>
          <quill-editor

            ref="myQuillEditor"
            v-model="noticeForm.content"
            :options="editorOption"
            class="my-quill-editor"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @ready="onEditorReady($event)"
          />
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import ClassSelect from '@/components/ClassSelect'
import { getRole } from '@/utils/jwtUtils'
export default {
  components: {
    ClassSelect,
    quillEditor
  },
  props: {
    title: {
      type: String,
      default: '提示'
    },
    editType: {
      type: Number,
      default: 0
    },
    value: {
      type: Boolean,
      default: false
    },
    dialogData: {
      type: Object,
      default() {
        return {
          title: '',
          isPublic: false,
          gradeIds: [],
          content: ''
        }
      }
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    onConfirm: {
      type: Function,
      default: () => {}
    }

  },
  data() {
    return {
      roleEdit: false,
      noticeForm: {
        title: '',
        isPublic: false,
        gradeIds: [],
        content: ''
      },
      visible: this.value,
      // 富文本编辑器配置
      editorOption: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
            ['blockquote', 'code-block'], // 引用  代码块
            // [{ header: 1 }, { header: 2 }], // 1、2 级标题
            [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
            // [{ script: 'sub' }, { script: 'super' }], // 上标/下标
            [{ indent: '-1' }, { indent: '+1' }], // 缩进
            // [{ direction: 'rtl' }], // 文本方向
            // [{ size: ['12', '14', '16', '18', '20', '22', '24', '28', '32', '36'] }], // 字体大小
            // [{ header: [1, 2, 3, 4, 5, 6] }], // 标题
            [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
            // [{ font: ['songti'] }], // 字体种类
            // [{ align: [] }], // 对齐方式
            ['clean'] // 清除文本格式
            // ['image', 'video'] // 链接、图片、视频
          ]
        },
        placeholder: '请输入正文'
      }
    }
  },
  watch: {
    value(val) {
      this.visible = val
    },
    isEdit(val) {
      this.isEdit = val
    },
    dialogData(val) {
      this.noticeForm = val

      if (val.isPublic) {
        this.noticeForm.isPublic = true
      }
    },
    visible(val) {
      this.$emit('input', val)
    }
  },
  created() {
    const role = getRole()
    if (role === 3 && this.editType === 1) {
      this.noticeForm.isPublic = true
      this.roleEdit = true
    }
  },
  methods: {
    handleCancel() {
      this.visible = false
      if (this.editType === 1) {
        // 如果是添加，清空表单
        this.refresh()
      }
    },
    refresh() {
      this.noticeForm = {
        title: '',
        isPublic: false,
        gradeIds: [],
        content: ''
      }
    },
    handleConfirm() {
      // 调用父组件传入的确认回调方法，并传递 repoForm 数据
      this.onConfirm(this.noticeForm);
      // 关闭对话框
      ('noticeForm', this.noticeForm)
      this.visible = false
      if (this.editType === 1) {
        // 如果是添加，清空表单
        this.refresh()
      }
    },
    // 失去焦点事件
    onEditorBlur(quill) {
    },
    // 获得焦点事件
    onEditorFocus(quill) {
      // quill.enable(false);
      ('editor focus!', quill)
    },
    // 准备富文本编辑器
    onEditorReady(quill) {
      if (!this.isEdit) {
        quill.enable(false)
      }

      ('editor ready!', quill)
    },
    // 内容改变事件
    onEditorChange({ quill, html, text }) {
      ('editor change!', quill, html, text)
      this.content = html
    }
  }
}
</script>
<style>
.my-quill-editor {
  height: 80%; /* 这里设置为父容器高度的80%，根据实际情况调整 */
}
.ql-editor {
  height: 300px;
}
</style>
