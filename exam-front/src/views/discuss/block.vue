<template>
    <div class="subPageMain" style="background: none">
        <div class="block-container">
            <Block v-for="item in relyData" :key="item.id" 
            :reply="item" :repdlyId="item.id" :onConfirm="handleLike"></Block>
        </div>
    </div>
</template>

<script>
import Block from "@/components/discussion/block";
import { getDiscussionRely } from "@/api/discussion";
import {getDiscussionId} from '@/utils/auth'
import { EventBus } from '@/utils/websocket'
export default {
    components: {
        Block
    },
    data(){
        return{
            currentDiscussionId:null,
            relyData:[]
        }
    },
    created(){
        this.currentDiscussionId = this.$route.query.discussionId
        if(!this.currentDiscussionId){
            this.currentDiscussionId = getDiscussionId()
        }
           //获取回复
        this.getDiscussionRelyFun(this.currentDiscussionId,1)
         // 监听websocke收到消息发送来的事件
        EventBus.$on('websocket-message', this.handleMessage)
    },
    destroyed() {
    // 组件卸载时取消监听
    EventBus.$off('websocket-message', this.handleMessage)
    
  },
    methods:{
        // 收到websocket消息的方法
        handleMessage(res) {
            if(res.type === 'DISCUSSION' && res.data.discussionId === this.currentDiscussionId){
                this.getDiscussionRelyFun(this.currentDiscussionId,2)
            }
        },
        getDiscussionRelyFun(id,order=1){
            getDiscussionRely(id,order).then((res)=>{
                this.relyData = res.data
            });
        },
        handleLike(){
           this.getDiscussionRelyFun(this.currentDiscussionId,4)
        }
    }
};
</script>

<style lang="scss" scoped>
.subPageMain {
    position: relative;
    padding-top: 25px;
    width: 90%;
    min-height: 600px;
    margin: 30px auto;
}

.block-container {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}

</style>    