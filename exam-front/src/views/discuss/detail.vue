<template>
  <div class="subPageMain" style="background: none">
    <div class="noticeDetail_detail">
      <div class="noticeDetail_head">
      <div>{{ data.title==""||data.title==null?"暂无标题":data.title }}</div>
      <div v-if="currentRole === 'teacher'"><el-button type="primary" @click="projectionScreen" >投屏模式</el-button></div>
      </div>
      <div class="noticeDetail_main">
        <div v-if="data.content!=null&&data.content!=''" v-html="data.content" />
        <div v-else>此处暂无内容</div>
      </div>
    </div>
    <div class="radio-class">
    <div style="margin-bottom: 10px;">全部回答</div>
    <div>
      <el-radio-group v-model="radio" @change="handleRadioChange">
        <el-radio label="1">按提交时间升序显示</el-radio>
        <el-radio label="2">按提交时间降序显示</el-radio>
        <el-radio label="3">按点赞数量升序显示</el-radio>
        <el-radio label="4">按点赞数量降序显示</el-radio>
      </el-radio-group>
    </div>
    </div>
    <div v-for="item in relyData">
    <Discussion :discussionData="item" :delFun="showIsDel" :discussionId="data.id" :onConfirm="getDiscussionDetailsFun" style="margin: 10px 0;"></Discussion>
    </div>

    <div class="edit_main" >
      <div class="replyEdit" style="margin-bottom: 50px;">
        <quill-editor
          ref="myQuillEditor"
          v-model="form.content"
          :options="editorOption"
          class="my-quill-editor"
          @blur="onEditorBlur($event)"
          @focus="onEditorFocus($event)"
          @ready="onEditorReady($event)"
          style="height: 120px;"
        />
      </div>
      <div class="replyEditBtnGroup">
        <div class="replyBtn" style="margin: 10px 0;">
          <el-button type="primary" @click="submitFun">发 送</el-button>
        </div>
      </div>
    </div>


    <!-- <div class="editContainer">
      <div class="edit_headTitle">
        <div class="edit_headTitle_container">
          <div>回复</div>
          <div v-if="row.state == 0">
            <el-form :inline="true" class="demo-form-inline">
              <el-form-item label="打分">
                <el-input v-model="score" placeholder="分数" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="markFun">提交分数</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div> -->



    <!-- </div> -->
  </div>
</template>
<script>
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import Discussion from "@/components/discussion";
import { getDiscussionRely,discussionDetail } from "@/api/discussion";
import {getUserId,getDiscussionId,setDiscussionId} from '@/utils/auth'
import { getTokenInfo, getRole } from '@/utils/jwtUtils'
import { EventBus } from '@/utils/websocket'
import { replyAdd,replyDel } from '@/api/reply'
export default {
  components: {
    Discussion,
    quillEditor,
  },
  data() {
    return {
      currentRole:null,
      currentDiscussionId:null,
      radio: '1',
      relyData:{},
      // row: {},
      data: {},
      score: null,
      form: {
        discussionId:null,
        content: "",
      },
      visible: this.value,
      // 富文本编辑器配置
      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"], // 引用  代码块
            // [{ header: 1 }, { header: 2 }], // 1、2 级标题
            [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表
            // [{ script: 'sub' }, { script: 'super' }], // 上标/下标
            [{ indent: "-1" }, { indent: "+1" }], // 缩进
            // [{ direction: 'rtl' }], // 文本方向
            // [{ size: ['12', '14', '16', '18', '20', '22', '24', '28', '32', '36'] }], // 字体大小
            // [{ header: [1, 2, 3, 4, 5, 6] }], // 标题
            [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
            // [{ font: ['songti'] }], // 字体种类
            // [{ align: [] }], // 对齐方式
            ["clean"], // 清除文本格式
            // ['image', 'video'] // 链接、图片、视频
          ],
        },
        placeholder: "请输入正文",
      },
    };
  },
  created() {
    // this.row = this.$route.query.row;
    this.currentDiscussionId = this.$route.query.discussionId
    // 获取角色判断是否是教师和管理员
    const role = getRole()
    if (role === 3 || role === 2) {
      this.currentRole = "teacher"
    }
    console.log(this.currentRole)
    if(this.currentDiscussionId){
      //获取到讨论id，将它放进浏览器本地存储中
      setDiscussionId(this.currentDiscussionId)
    }else{
      //路由中拿不到，就从浏览器本地存储中拿去上次的讨论id
      this.currentDiscussionId = getDiscussionId()
    }
    this.getDiscussionDetailsFun();

    // 监听websocke收到消息发送来的事件
    EventBus.$on('websocket-message', this.handleMessage)
  },
  destroyed() {
    // 组件卸载时取消监听
    EventBus.$off('websocket-message', this.handleMessage)

  },
  methods: {
    handleRadioChange(value) {
      this.getDiscussionRelyFun(this.currentDiscussionId,value)
    },
    // 收到websocket消息的方法
    handleMessage(res) {
      if(res.type === 'DISCUSSION' && res.data.discussionId === this.currentDiscussionId){
        this.getDiscussionRelyFun(this.currentDiscussionId,2)
      }
    },
    // 投屏模式
    projectionScreen(){
      this.$router.push({name: 'discussion-block',query: { discussionId: this.currentDiscussionId }})
    },
    //删除回复
    delReply(id){
      replyDel(id).then(res=>{
        if(res.code){
          this.$message({type:'success',message:res.msg})
          // this.onConfirm()
            //发送websocket请求
            this.$sendMessage({type:'DISCUSSION',data:{discussionId:this.currentDiscussionId}})
        }else{
          this.$message({type:'error',message:res.msg})
        }
      })
    },
    //展示是否删除
    showIsDel(replyId){
        this.$confirm('此操作将永久删除该回复, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
         this.delReply(replyId)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    // 回复
    submitFun(){
      this.form.discussionId = this.currentDiscussionId
      replyAdd(this.form).then(res=>{
        if(res){
          this.$message({type:"success",message:res.msg})
          //发发送websocket请求
          this.$sendMessage({type:'DISCUSSION',data:{discussionId:this.currentDiscussionId}})
          this.form.content = ''
        }else{
          this.$message({type:"error",message:res.msg})
        }
      })

    },
    getDiscussionDetailsFun() {
      discussionDetail(this.currentDiscussionId).then((res) => {
        this.form.content = res.data.answer;
        this.data = res.data;
        console.log(res.data);
        this.getDiscussionRelyFun(this.currentDiscussionId,1)
      });
    },
    getDiscussionRelyFun(id,order=1){
      getDiscussionRely(id,order).then((res)=>{
        this.relyData = res.data

      });
    },
    // 失去焦点事件
    onEditorBlur(quill) {},
    // 获得焦点事件
    onEditorFocus(quill) {
      console.log("editor focus!", quill);
    },
    // 准备富文本编辑器
    onEditorReady(quill) {
      // 移除禁用编辑器的逻辑，或者根据实际情况调整 this.isEdit 的值
      console.log("editor ready!", quill);
    },
    // 内容改变事件
    onEditorChange({ quill, html, text }) {
      console.log("editor change!", quill, html, text);
      this.form.content = html;
    },
  },
};
</script>
<style lang="scss" scoped>
.radio-class{
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  margin-bottom: 16px;
}
.subPageMain {
  position: relative;
  padding-top: 25px;
  width: 1200px;
  min-height: 600px;
  margin: 30px auto;
  .noticeDetail_detail {
    background-color: #f5f6f8;
    margin: 16px auto;
    border-radius: 8px;
    .noticeDetail_head {
      display: flex;
      justify-content: space-between;
      padding: 25px 30px;
    }
    .noticeDetail_main {
      padding: 16px 30px 30px;
    }
  }
  .editContainer {
    position: relative;
    width: 1200px;
    min-height: 345px;
    min-height: auto;
    background-color: #f5f6f8;
    background: #ffffff;
    margin: 16px auto 0;
    padding-bottom: 40px;
    border-radius: 8px;
    box-sizing: border-box;
    .edit_headTitle {
      position: relative;
      padding: 30px 34px 0;
      margin-bottom: 0;

      box-sizing: border-box;
    }
    .edit_main {
      padding: 10px;
      .replyEdit {
        height: 170px;
        .my-quill-editor {
          height: 80%; /* 这里设置为父容器高度的80%，根据实际情况调整 */
        }
        .ql-editor {
          height: 120px;
          /* padding: 20px; */
        }
      }
      .replyEditBtnGroup {

        /* margin-top: 16px; */
        height: 36px;
        .replyBtn {
          float: right;
          margin-top: 20px;
        }
      }
    }
  }
}

</style>
