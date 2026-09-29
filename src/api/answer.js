import request from '@/utils/request'

export function answerExamPging(params) {
  return request({
    url: 'answers/exam/page',
    method: 'get',
    params
  })
}

export function answerUserPging(params) {
  return request({
    url: 'answers/exam/stu',
    method: 'get',
    params
  })
}

export function answerDetail(params) {
  return request({
    url: 'answers/detail',
    method: 'get',
    params
  })
}

export function myAnswerDetail(params) {
  return request({
    url: 'answers/my/detail',
    method: 'get',
    params
  })
}

export function answerPaperSummary(params) {
  return request({
    url: 'answers/exam/stu/summary',
    method: 'get',
    params
  })
}

export function myAnswerPaperSummary(params) {
  return request({
    url: 'answers/my/exam/summary',
    method: 'get',
    params
  })
}

export function correct(data) {
  return request({
    url: 'answers/correct',
    method: 'put',
    data
  })
}
