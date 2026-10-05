<template>
  <div class="app-container">
    <el-form :inline="true" :mode="searchForm" class="demo-form-inline">
      <el-form-item label="讨论名称">
        <el-input v-model="searchForm.searchTitle" placeholder="讨论名称" />
      </el-form-item>
      <el-form-item label="班级" v-if="currentRole === 'teacher'">
        <ClassSelect v-model="searchForm.gradeId" :is-multiple="false" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchDiscussion">查询</el-button>
        <el-button type="primary" @click="visible = true" v-if="currentRole === 'teacher'||currentRole === 'admin'"
          >新建话题</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      :data="data.records"
      border
      fit
      highlight-current-row
      :header-cell-style="{
        background: '#f2f3f4',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
    >
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column fixed label="序号" align="center" width="80">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column prop="sender" label="创建人" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="color: green; font-size: 14px"
            @click="showRow(row)"
            >查看</el-button
          >
          <el-button
          type="text"
          size="small"
          style="color: red; font-size: 14px"
          @click="handleDel(row.id)"
          >删除</el-button
        >
          </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="data.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="data.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="data.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

     <!-- 发布讨论对话框 -->
     <el-dialog title="发布讨论" :visible.sync="visible" width="30%">
      <el-row :gutter="20">
        <el-col>
          <el-form v-model="discussionForm" label-position="top">
            <el-form-item label="讨论标题:">
              <el-input
                v-model="discussionForm.title"
                 placeholder="请输入标题"
                autocomplete="off"
                style="width: 80%"
              />
            </el-form-item>
            <el-form-item label="讨论内容:">
              <el-input
              type="textarea"
              :rows="6"
              placeholder="请输入内容"
              clearable
              resize="none"
              v-model="discussionForm.content">
            </el-input>
            </el-form-item>
            <el-form-item label="班级:">
              <ClassSelect v-model="discussionForm.gradeId"  :is-multiple="false" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
  
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import { discussionpageOwner,discussionpageStudent,discussionAdd,discussionDel } from "@/api/discussion";
import ClassSelect from "@/components/ClassSelect";
// import {getRole} from '@/utils/auth'
export default {
  components: {
    ClassSelect,
  },
  data() {
    return {
      visible:false,
      currentRole:null,
      pageNum: 1,
      pageSize: 10,
      data: {},
      searchForm: {
        searchTitle: "",
        gradeId: null,
      },
      discussionForm:{
        title:null,
        content:null,
        gradeId:null
      },
    };
  },
  created() {

    this.currentRole =  localStorage.getItem('roles')
    this.getDiscussionPage();
  },
  methods: {
    //弹出提示框
    handleDel(id){
        this.$confirm('此操作将永久删除该讨论, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
         this.delDiscussion(id)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
    },
    //删除讨论
    delDiscussion(id){
      discussionDel(id).then(res=>{
        if(res.code){
          this.$message({
              type: 'success',
              message: res.msg
            })
            this.getDiscussionPage(this.pageNum, this.pageSize,this.title,this.gradeId)
        }else{
          this.$message({
              type: 'info',
              message: res.msg
            })
        }
      })
    },
    //提交表单
    handleConfirm(){
      discussionAdd(this.discussionForm).then(res=>{
        if(res.code){
          this.discussionForm.title = null
          this.discussionForm.content = null
          this.discussionForm.gradeId = null
          this.visible = false
          this.getDiscussionPage()
          this.$message({
              type: 'success',
              message: res.msg
            })
        }else {
            this.$message({
              type: 'info',
              message: res.msg
            })
          }
      })
    },
    showRow(row) {
      // this.$router.push({name: 'discussion-detail',query: { row: row }})
      this.$router.push({name: 'discussion-detail',query:{discussionId: row.id}})
    },
    searchDiscussion() {
      this.getDiscussionPage(
        this.pageNum,
        this.pageSize,
        this.searchForm.searchTitle,
        this.searchForm.gradeId
      );
    },
    // 分页查询
    async getDiscussionPage(pageNum, pageSize, title = null, gradeId = null) {
      const params = {
        currentPage: pageNum,
        size: pageSize,
        title: title,
        gradeId: gradeId,
      };
      //教师分页获取讨论
      if(this.currentRole === 'teacher'){
        const res = await discussionpageOwner(params)
        this.data = res.data
      }else if(this.currentRole === 'student'){
        //学生分页获取讨论
        delete params.gradeId
        const res = await discussionpageStudent(params)
        this.data = res.data
      }
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val;
      this.getDiscussionPage(this.pageNum, val,this.searchForm.searchTitle,
      this.searchForm.gradeId);
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val;
      this.getDiscussionPage(val, this.pageSize,this.searchForm.searchTitle,
      this.searchForm.gradeId);
    },
  },
};
</script>

<style></style>
