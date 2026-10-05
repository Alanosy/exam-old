
import request from '@/utils/request'

export function discussionAdd(data) {
  return request({
    url: 'discussion/add',
    method: 'post',
    data
  })
}

export function discussionDel(id) {
  return request({
    url: `discussion/delete/${id}`,
    method: 'delete'
  })
}

export function discussionDetail(id) {
  return request({
    url: `discussion/query/detail/${id}`,
    method: 'get'
  })
}

export function discussionpageOwner(params) {
  return request({
    url: `/discussion/query/page/owner`,
    method: 'get',
    params
  })
}

export function discussionpageStudent(params) {
  return request({
    url: `/discussion/query/page/student`,
    method: 'get',
    params
  })
}
export function getDiscussionRely(id,orderBy) {
  return request({
    url: `reply/query/${orderBy}/${id}`,
    method: 'get'
  })
}
// /like/doLike
export function doLike(data) {
  return request({
    url: `/like/doLike`,
    method: 'post',
    data
  })
}