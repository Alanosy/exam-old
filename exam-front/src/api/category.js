import request from '@/utils/request'

// 获取一级分类
export function getFirstLevelCategories() {
  return request({
    url: '/category/first-level',
    method: 'get'
  })
}

// 获取子分类
export function getChildCategories(parentId) {
  return request({
    url: `/category/children/${parentId}`,
    method: 'get'
  })
}

// 获取分类树
export function getCategoryTree() {
  return request({
    url: '/category/tree',
    method: 'get'
  })
}

// 添加分类
export function addCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

// 修改分类
export function updateCategory(id, data) {
  return request({
    url: `/category/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  })
}