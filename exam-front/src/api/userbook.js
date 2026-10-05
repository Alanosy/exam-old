
import request from '@/utils/request'

export function getUserBookList(examId) {
  return request({
    url: 'userbooks/question/list/' + examId,
    method: 'get'
  })
}

export function userbookPaging(params) {
  return request({
    url: 'userbooks/paging',
    method: 'get',
    params
  })
}

export function getSingleQu(quId) {
  return request({
    url: 'userbooks/question/single/' + quId,
    method: 'get'
  })
}

export function fullBook(data) {
  return request({
    url: 'userbooks/full-book',
    method: 'post',
    data
  })
}

