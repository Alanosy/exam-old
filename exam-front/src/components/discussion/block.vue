<template>
 <div class="box">
  
    <div class="topicDetail_replyItem">
    <div class="topicDetail_info">
      <p>
        <img class="topicDetail_avatar" :src="reply.avatar" />
        <span class="author">{{ reply.realName }}</span>
        <span class="department"></span>
      </p>
      <div class="topic_interactive">
        <!-- el-icon-thumb -->
        <!-- <div class="like" :style="isLike==0:background=">点赞<i class="el-icon-thumb"></i></i><span></span></div> -->
        
      </div>
    </div>
    <div class="replyContent" v-html="reply.content"></div>
    <div class="topicReply_right">
      
      <div class="otherInfo">
        <span class="customedTime" bbsid="866df1b04e0e18910f00ab182cf82963">{{
          reply.createTime
        }}</span>
      </div>
    </div>
    
  </div >
  <div class="like-block">
        <div class="like" 
          :class="{ 'bg-green-500': reply.isLike === 1, 'bg-gray-300': reply.isLike === 0 }" 
          @click="toggleLike(reply.id)"
        >
          <span class="text-white p-2">
            <i class="el-icon-thumb">点赞 {{ reply.count }}</i>
          </span>
        </div>
    </div>

</div>
</template>
<script>
import {doLike} from '@/api/like'
import {getDiscussionId} from '@/utils/auth'

export default {
  name: "block",
  props: {
    discussionId: {
      type: Number,
    },
    onConfirm: {
      type: Function,
      default: () => {},
    },
    reply: {
      type: Object,
      default() {
        return {
          id: 12,
          userId: 164,
          parentId: -1,
          avatar:
            "https://online-exam-system-backend.oss-cn-beijing.aliyuncs.com/da93c2a6-6879-46c3-b38f-a99956f70d22.jpg",
          content: "2223213",
          realName: "学生测试账号",
          count: 0,
          isLike: 0,
          createTime: "2025-04-04 22:13:05",
          childReplies: null,
        };
      },
    },
  },
  data(){
    return{
      currentDiscussionId:null
    }
  },
  created(){
    this.currentDiscussionId = this.$route.query.discussionId
    if(!this.currentDiscussionId){
        this.currentDiscussionId = getDiscussionId()
    }
  },
  methods:{
    async toggleLike(id){
      const data = {
        discussionId:this.currentDiscussionId,
        replyId:id
      }
      
      const res =  await doLike(data)
      if(res.code){
        this.onConfirm()
        this.$message({type:'success',message:res.msg})
      }else{
        this.$message({type:'error',message:res.msg})
      }
      
    }
  }
};
</script>
<style scoped>
.box {
  width: calc(25% - 20px);
  /* width: 250px; */
  height: 300px;
  background-color: #f5f6f8;
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
}
.like-block{
    margin-top: 20px;
    margin-bottom: 10px;
    justify-content: flex-end;
    display: flex;
}

.bg-green-500{
    color: #2ed892;
}
.bg-gray-300{
    color: #4b4b4b;
}
.author {
  display: inline-block;
  vertical-align: middle;
  font-size: 14px;
  margin-right: 6px;
}
.topicDetail_info {
  position: relative;
  height: 28px;
  margin-bottom: 20px;
}
.topic_interactive {
  margin-top: 6px;
  height: 20px;
  line-height: 20px;
}
.topicReply_right {

  font-size: 14px;
  line-height: 20px;
  color: #131b26;
}
.topicDetail_replyItem {
    border-bottom: solid 1px #1b1b1b;
  /* padding: 20px 30px 30px 50px; */
  /* border-bottom: solid 1px #1b1b1b; */
    display: flex;
    height: 90%;
    flex-direction: column;
    justify-content: space-between;
  /* background-color: #f5f6f8; */
  .topicDetail_info {
    height: 36px;
    margin-bottom: 0;
    /* .topicDetail_avatar {
      width: 36px;
      height: 36px;
    } */
    .topicDetail_avatar {
      display: inline-block;
      vertical-align: middle;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      margin-right: 20px;
    }

    .department {
      margin-left: 0;
      margin-right: 10px;
    }
    .author {
      margin-right: 14px;
    }
    .topic_interactive {
      position: absolute;
      right: 0;
      top: 4px;
      margin: 0;
      .like {
        float: left;
        text-align: left;
      }
      .comment {
        float: left;
        text-align: left;
      }
      .more {
        position: static;
        float: left;
        margin-left: -16px;
        margin-right: -8px;
      }
      .priceModal {
        display: none;
        position: absolute;
        padding: 24px 0;
        min-width: 275px;
        left: -114px;
        top: 22px;
        box-sizing: border-box;
        background: #ffffff;
        box-shadow: 0 2px 12px 0 rgba(190, 200, 206, 0.62);
        border-radius: 6px;
        z-index: 10;
        user-select: none;
      }
    }
  }
  .topicReply_right {
    .otherInfo {
      font-size: 12px;
      margin-bottom: 16px;
      /* display: flex;
      align-items: center; */
    }
  }
}

</style>
