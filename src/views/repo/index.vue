<template>
  <div
    v-loading="pageLoading"
    element-loading-text="正在查询请等待"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(232, 242, 239, 0.72)"
    class="app-container page-loading-host">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="题库名称:">
        <el-input v-model="searchTitle" placeholder="请输入查询内容" />
      </el-form-item>
      <el-form-item label="题库分类:">
        <el-select
          v-model="searchCategory"
          :placeholder="categoryLoading ? '分类加载中...' : '请选择分类'"
          :loading="categoryLoading"
          clearable
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否刷题:">
        <el-select v-model="searchIsExercise" placeholder="请选择" clearable>
          <el-option label="已开启" :value="1" />
          <el-option label="未开启" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchRepo">查询</el-button>
        <el-button type="primary" @click="openAddRepo">新增</el-button>
        <el-button type="primary" @click="categoryDialogVisible = true">分类管理</el-button>
      </el-form-item>
    </el-form>

    <!-- table -->
    <el-table class="flex-list-table"
      :data="data.records"
      border
      fit
      highlight-current-row
      :header-cell-style="{
        background: '#eef6f3',
        color: '#555',
        'font-weight': 'bold',
        'line-height': '32px',
      }"
    >
      <el-table-column align="center" type="selection" min-width="48" />
      <el-table-column label="序号" align="center" min-width="56">
        <template slot-scope="scope">{{ scope.$index + 1 }}</template>
      </el-table-column>
      <el-table-column show-overflow-tooltip min-width="160" prop="title" label="题库名称" align="center" />
      <el-table-column min-width="110" prop="categoryName" label="题库分类" align="center" />
      <el-table-column min-width="80" label="题目数量" align="center">
        <template slot-scope="{ row }">
          <span :style="{ color: row.questionCount === 0 ? '#F56C6C' : '' }">{{ row.questionCount }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="120" prop="realName" label="创建人" align="center" />
      <el-table-column min-width="148" class-name="datetime-col" prop="createTime" label="创建时间" align="center" />

      <el-table-column min-width="90" label="开启刷题" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.isExercise === 1 ? 'success' : 'danger'" :effect="row.isExercise === 0 ? 'dark' : 'light'">
            {{ row.isExercise === 1 ? '已开启' : '未开启' }}
            <i v-if="row.isExercise === 0" style="margin-left: 2px;"></i>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="140" label="开放班级" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.gradeIds && row.gradeIds.length" type="success">
            已绑定 {{ row.gradeIds.length }} 个班
          </el-tag>
          <el-tag v-else type="info">未绑定</el-tag>
        </template>
      </el-table-column>
      <el-table-column min-width="230" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-tooltip content="请清除筛选条件后再排序" placement="top" :disabled="hasNoRepoFilter">
            <span class="repo-sort-button">
              <el-button type="text" size="small" style="font-size: 14px" :disabled="!hasNoRepoFilter" @click="moveRepo(row, 'up')">上移</el-button>
            </span>
          </el-tooltip>
          <el-tooltip content="请清除筛选条件后再排序" placement="top" :disabled="hasNoRepoFilter">
            <span class="repo-sort-button">
              <el-button type="text" size="small" style="font-size: 14px" :disabled="!hasNoRepoFilter" @click="moveRepo(row, 'down')">下移</el-button>
            </span>
          </el-tooltip>
          <el-button type="text" size="small" style="font-size: 14px" @click="updateRow(row)">编辑</el-button>
          <el-button type="text" size="small" style="color: red; font-size: 14px" @click="delRepo(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <div class="pagination-container"> -->
      <el-pagination
        :current-page="data.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="data.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="data.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    <!-- </div> -->

    <!-- 新增题库 -->
    <el-dialog title="新增题库" :visible.sync="addRepoDialogVisible" width="600px">
      <el-form :model="addRepoForm" label-width="100px">
        <el-form-item label="题库名称">
          <el-input v-model="addRepoForm.title" placeholder="请输入题库名称"></el-input>
        </el-form-item>
        <el-form-item label="题库分类">
          <el-select v-model="addRepoForm.categoryId" placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否开启刷题">
          <el-switch v-model="addRepoForm.isExercise"></el-switch>
        </el-form-item>
        <el-form-item label="开放班级">
          <ClassSelect v-model="addRepoForm.gradeIds" is-multiple />
          <div class="grade-tip">不选班级则仅用于组卷，学生刷题不可见</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRepoDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddRepo">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑题库 -->
    <el-dialog title="编辑题库" :visible.sync="dialogFormVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="题库名称">
          <el-input v-model="form.title" placeholder="请输入题库名称"></el-input>
        </el-form-item>
        <el-form-item label="题库分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否开启刷题">
          <el-switch v-model="form.isExercise" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item label="开放班级">
          <ClassSelect v-model="form.gradeIds" is-multiple />
          <div class="grade-tip">不选班级则仅用于组卷，学生刷题不可见</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditRepo">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog title="题库分类管理" :visible.sync="categoryDialogVisible" width="600px">
      <div class="category-header">
        <el-button type="primary" size="small" :loading="categoryLoading" @click="addCategory">添加分类</el-button>
      </div>
      <el-table
        class="flex-list-table"
        v-loading="categoryLoading"
        element-loading-text="正在加载分类..."
        :data="categoryList"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="parentName" label="父级分类" />
        <el-table-column label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editCategory(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: red;" @click="deleteCategory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCategoryDialogVisible" width="400px" append-to-body>
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父级分类" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddCategory">确定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCategoryDialogVisible" width="400px" append-to-body>
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="categoryForm.parentId" placeholder="请选择父级分类" clearable>
            <el-option
              v-for="item in categoryOptions.filter(opt => opt.id !== categoryForm.id)"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCategoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditCategory">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { repoPaging, repoDel, repoUpdate, repoAdd, repoSort } from '@/api/repo'
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from '@/api/category'
import ClassSelect from '@/components/ClassSelect'

import pageLoading from '@/mixin/pageLoading'
export default {
  mixins: [pageLoading],
  components: {
    ClassSelect
  },
  data() {
    return {
      pageNum: 1,
      pageSize: 10,
      isExercise: true,
      data: {
        records: [],
        total: 0,
        size: 10,
        current: 1
      },
      addTitle: '',
      delVisible: false,
      searchTitle: '',
      searchCategory: '',
      searchIsExercise: null,
      Obj: {},
      formInline: {
        searchTitle: ''
      },
      cancle() { },

      diaTitle: '新增',
      form: {
        title: '',
        isExercise: 0,
        categoryId: '',
        gradeIds: []
      },
      addRepoForm: {
        title: '',
        isExercise: false,
        categoryId: '',
        gradeIds: []
      },
      formLabelWidth: '120px',
      dialogVisible: false,
      addRepoDialogVisible: false,
      dialogTableVisible: false,
      dialogFormVisible: false,
      categoryDialogVisible: false,
      addCategoryDialogVisible: false,
      editCategoryDialogVisible: false,
      categoryForm: {
        id: '',
        name: '',
        parentId: null
      },
      categoryOptions: [],
      categoryList: [],
      categoryLoading: false
    }
  },
  created() {
    this.getRepoPage()
    this.fetchCategories()
  },
  computed: {
    hasNoRepoFilter() {
      return !this.searchTitle && !this.searchCategory && this.searchIsExercise === null
    }
  },
  methods: {
    // 分页查询
    async getRepoPage(pageNum = this.pageNum, pageSize = this.pageSize, title = null, categoryId = null, isExercise = null) {

      await this.withPageLoading(async () => {
        try {
          const params = {
            pageNum: pageNum,
            pageSize: pageSize,
            title: title,
            categoryId: categoryId,
            isExercise: isExercise
          }
          const res = await repoPaging(params)
          if (res.code) {
            this.data = res.data
          } else {
            this.$message.error(res.msg || '获取题库数据失败')
          }
        } catch (error) {
          console.error('获取题库数据失败:', error)
          this.$message.error('获取题库数据失败')
        }

      })

      },
    // 获取分类列表
    async fetchCategories() {
      this.categoryLoading = true
      try {
        const res = await getCategoryTree()
        if (res.code) {
          this.categoryOptions = this.flattenCategoryTree(res.data)
          // 处理分类列表，添加父级分类名称
          this.categoryList = this.processCategoryList(res.data)
        } else {
          this.$message.error(res.msg || '获取分类数据失败')
        }
      } catch (error) {
        console.error('获取分类失败:', error)
        this.$message.error('获取分类数据失败')
      } finally {
        this.categoryLoading = false
      }
    },
    // 将分类树扁平化为列表
    flattenCategoryTree(tree, result = []) {
      if (!tree || !tree.length) return result

      tree.forEach(node => {
        result.push({
          id: node.id,
          name: node.name
        })
        if (node.children && node.children.length > 0) {
          this.flattenCategoryTree(node.children, result)
        }
      })
      return result
    },
    // 处理分类列表，添加父级分类名称
    processCategoryList(tree, parentName = null, result = []) {
      if (!tree || !tree.length) return result

      tree.forEach(node => {
        result.push({
          id: node.id,
          name: node.name,
          parentId: node.parentId,
          parentName: parentName
        })
        if (node.children && node.children.length > 0) {
          this.processCategoryList(node.children, node.name, result)
        }
      })
      return result
    },
    searchRepo() {
      this.getRepoPage(this.pageNum, this.pageSize, this.searchTitle, this.searchCategory, this.searchIsExercise)
    },
    openAddRepo() {
      this.addRepoForm = {
        title: '',
        isExercise: false,
        categoryId: '',
        gradeIds: []
      }
      this.addRepoDialogVisible = true
    },
    formatGradeIds(gradeIds) {
      return (gradeIds || []).join(',')
    },
    async moveRepo(row, direction) {
      if (!this.hasNoRepoFilter) {
        this.$message.warning('请清除筛选条件后再调整顺序')
        return
      }
      try {
        const res = await repoSort(row.id, direction)
        if (res.code) {
          this.$message.success(res.msg || '排序已更新')
          this.getRepoPage(this.pageNum, this.pageSize, this.searchTitle, this.searchCategory, this.searchIsExercise)
        }
      } catch (error) {
        console.error('调整题库顺序失败:', error)
      }
    },
    updateRow(row) {
      this.dialogFormVisible = true
      this.form = {
        ...row,
        gradeIds: row.gradeIds ? [...row.gradeIds] : []
      }
    },
    submitAddRepo() {
      if (!this.addRepoForm.title) {
        this.$message.warning('请输入题库名称')
        return
      }
      const isExercise = this.addRepoForm.isExercise ? 1 : 0
      if (isExercise === 1 && (!this.addRepoForm.gradeIds || this.addRepoForm.gradeIds.length === 0)) {
        this.$message.warning('已开启刷题但未选择班级，学生将无法看到该题库')
      }

      const data = {
        'title': this.addRepoForm.title,
        'isExercise': isExercise,
        'categoryId': this.addRepoForm.categoryId,
        'gradeIds': this.formatGradeIds(this.addRepoForm.gradeIds)
      }

      repoAdd(data)
        .then((res) => {
          if (res.code) {
            this.addRepoDialogVisible = false
            this.getRepoPage()
            this.$message({
              type: 'success',
              message: '添加成功'
            })
            // 重置表单
            this.addRepoForm = {
              title: '',
              isExercise: false,
              categoryId: '',
              gradeIds: []
            }
          } else {
            this.$message({
              type: 'info',
              message: res.msg || '添加失败'
            })
          }
        })
        .catch((error) => {
          console.error('添加题库失败:', error)
          this.$message.error('添加题库失败')
        })
    },
    // 编辑题库
    submitEditRepo() {
      if (!this.form.title) {
        this.$message.warning('请输入题库名称')
        return
      }

      if (this.form.isExercise === 1 && (!this.form.gradeIds || this.form.gradeIds.length === 0)) {
        this.$message.warning('已开启刷题但未选择班级，学生将无法看到该题库')
      }

      const data = {
        'title': this.form.title,
        'isExercise': this.form.isExercise,
        'categoryId': this.form.categoryId,
        'gradeIds': this.formatGradeIds(this.form.gradeIds)
      }

      repoUpdate(this.form.id, data)
        .then((res) => {
          if (res.code) {
            this.getRepoPage()
            this.dialogFormVisible = false
            this.$message({
              type: 'success',
              message: '编辑成功!'
            })
          } else {
            this.$message({
              type: 'info',
              message: res.msg || '编辑失败'
            })
          }
        })
        .catch((error) => {
          console.error('编辑题库失败:', error)
          this.$message.error('编辑题库失败')
        })
    },
    // 删除题库
    delRepo(row) {
      this.$confirm('此操作将永久删除该题库, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      })
        .then(() => {
          repoDel(row.id).then((res) => {
            if (res.code) {
              this.getRepoPage()
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
            } else {
              this.$message({
                type: 'info',
                message: res.msg || '删除失败'
              })
            }
          }).catch((error) => {
            console.error('删除题库失败:', error)
            this.$message.error('删除题库失败')
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 分类管理相关方法
    addCategory() {
      this.categoryForm = {
        name: '',
        parentId: null
      }
      this.addCategoryDialogVisible = true
    },
    editCategory(row) {
      this.categoryForm = {
        id: row.id,
        name: row.name,
        parentId: row.parentId
      }
      this.editCategoryDialogVisible = true
    },
    submitAddCategory() {
      if (!this.categoryForm.name) {
        this.$message.warning('请输入分类名称')
        return
      }

      const data = {
        name: this.categoryForm.name,
        parentId: this.categoryForm.parentId || 0
      }

      addCategory(data)
        .then((res) => {
          if (res.code) {
            this.$message.success('添加成功')
            this.addCategoryDialogVisible = false
            this.fetchCategories()
          } else {
            this.$message.error(res.msg || '添加分类失败')
          }
        })
        .catch((error) => {
          console.error('添加分类失败:', error)
          this.$message.error('添加分类失败')
        })
    },
    submitEditCategory() {
      if (!this.categoryForm.name) {
        this.$message.warning('请输入分类名称')
        return
      }

      const data = {
        name: this.categoryForm.name,
        parentId: this.categoryForm.parentId || 0
      }

      updateCategory(this.categoryForm.id, data)
        .then((res) => {
          if (res.code) {
            this.$message.success('修改成功')
            this.editCategoryDialogVisible = false
            this.fetchCategories()
          } else {
            this.$message.error(res.msg || '修改分类失败')
          }
        })
        .catch((error) => {
          console.error('修改分类失败:', error)
          this.$message.error('修改分类失败')
        })
    },
    deleteCategory(id) {
      this.$confirm('确认删除该分类?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCategory(id)
          .then((res) => {
            if (res.code) {
              this.$message.success('删除成功')
              this.fetchCategories()
            } else {
              this.$message.error(res.msg || '删除分类失败')
            }
          })
          .catch((error) => {
            console.error('删除分类失败:', error)
            this.$message.error('删除分类失败')
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleClose(done) {
      done()
    },
    handleSizeChange(val) {
      // 设置每页多少条逻辑
      this.pageSize = val
      this.getRepoPage(this.pageNum, val, this.searchTitle, this.searchCategory, this.searchIsExercise)
    },
    handleCurrentChange(val) {
      // 设置当前页逻辑
      this.pageNum = val
      this.getRepoPage(val, this.pageSize, this.searchTitle, this.searchCategory, this.searchIsExercise)
    }
  }
}
</script>

<style scoped>
.category-header {
  margin-bottom: 15px;
}
.grade-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>
