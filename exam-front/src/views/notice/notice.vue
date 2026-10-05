
<template>
  <div class="app-container">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item label="公告标题">
        <el-input v-model="searchTitle" placeholder="公告标题" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchNotice">查询</el-button>
        <el-button type="primary" @click="addNoticeVisible = true">新增</el-button>
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
      <el-table-column prop="title" label="公告标题" align="center" />
      <el-table-column prop="realName" label="创建人" align="center" />
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            style="color: green; font-size: 14px"
            @click="showRow(row)"
          >查看</el-button>
          <el-button
            type="text"
            size="small"
            style="font-size: 14px"
            @click="updateRow(row)"
          >编辑</el-button>
          <el-button
            type="text"
            size="small"
            style="color: red; font-size: 14px"
            @click="delNotice(row.id)"
          >删除</el-button>
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

    <noticeDialog v-model="addNoticeVisible" title="新增公告" :is-edit="true" :on-confirm="addNotice" :edit-type="1" />
    <noticeDialog v-model="editVisible" title="编辑公告" :is-edit="true" :on-confirm="updateNotice" :dialog-data="form" />
    <noticeDialog v-model="showVisible" title="查看公告" :is-edit="false" :dialog-data="form" />
  </div>
</template>

<script>
import { noticePaging, noticeAdd, noticeDel, noticeUpdate } from '@/api/notice'
import noticeDialog from '@/components/notice/noticeDialog/index'
export default {
  components: {
    noticeDialog
  },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      data: {},
      searchTitle: '',
      showVisible: false,
      addNoticeVisible: false,
      editVisible: false,
      form: {
        content: '',
        title: '',
        gradeIds: []
      }
    }
  },
  created() {
    this.getNoticePage()
  },
  methods: {
    // 编辑公告按钮
    updateRow(row) {
      this.editVisible = true
      this.form = row
    },
    // 查看公告按钮
    showRow(row) {
      this.showVisible = true
      this.form = row
    },
    // 分页查询
    async getNoticePage(pageNum, pageSize, title = null) {
      const params = { pageNum: pageNum, pageSize: pageSize, title: title }
      const res = await noticePaging(params)
      this.data = res.data
    },
    // 新增公告
    addNotice(noticeForm) {
      // 建立公告数据
      const data = { title: noticeForm.title, content: noticeForm.content, gradeIds: noticeForm.gradeIds.join(','), isPublic: noticeForm.isPublic ? 1 : 0 }
      noticeAdd(data).then((res) => {
        if (res.code) {
          // 刷新公告数据，关闭新增公告弹窗
          this.getNoticePage(this.pageNum, this.pageSize)
          this.addNoticeVisible = false
          this.$message({
            type: 'success',
            message: '新增成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 更新公告方法
    updateNotice(noticeForm) {
      const data = { title: noticeForm.title, content: noticeForm.content, gradeIds: noticeForm.gradeIds.join(','), isPublic: noticeForm.isPublic ? 1 : 0 }
      noticeUpdate(this.form.id, data).then((res) => {
        if (res.code) {
          this.getNoticePage(this.pageNum, this.pageSize)
          this.editVisible = false
          this.$message({
            type: 'success',
            message: '编辑成功!'
          })
        } else {
          this.$message({
            type: 'info',
            message: res.msg
          })
        }
      })
    },
    // 搜索公告
    searchNotice() {
      this.getNoticePage(this.pageNum, this.pageSize, this.searchTitle)
    },
    // 删除公告
    delNotice(id) {
      this.$confirm('此操作将永久删除该公告, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          noticeDel(id).then((res) => {
            if (res.code) {
              this.getNoticePage(this.pageNum, this.pageSize)
              this.getNoticePage(1)
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            }
          })
        })
        .catch((error) => {
          // 明确捕获并检查reject的原因
          if (error === 'cancel') {
            // 特别处理取消的情况，避免将其视为错误
            this.$message({
              type: 'info',
              message: '已取消操作'
            })
          } else {
            // 如果是其他错误，可以在这里处理
            console.error('发生了一个错误:', error)
          }
        })
    },

    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getNoticePage(this.pageNum, val,this.searchTitle)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getNoticePage(val, this.pageSize,this.searchTitle)
    }
  }
}
</script>

<style>

</style>
