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

export function correct(data) {
  return request({
    url: 'answers/correct',
    method: 'put',
    data
  })
}

// export function scorePaging(data) {
//     return request({
//       url: 'answers/correct',
//       method: 'put',
//       data
//     })
//   }
