
import request from '@/utils/request'

export function noticeAdd(data) {
  return request({
    url: 'notices',
    method: 'post',
    data
  })
}

export function noticePaging(params) {
  return request({
    url: 'notices/paging',
    method: 'get',
    params
  })
}

export function noticeDel(id) {
  return request({
    url: 'notices/' + id,
    method: 'delete'
  })
}

export function noticeUpdate(id, data) {
  return request({
    url: 'notices/' + id,
    method: 'put',
    data
  })
}

export function noticeGetNew(params) {
  return request({
    url: 'notices/new',
    method: 'get',
    params
  })
}
