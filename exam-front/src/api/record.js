import request from '@/utils/request'

export function recordExamDetail(params) {
  return request({
    url: 'records/exam/detail',
    method: 'get',
    params
  })
}

export function recordExamPaging(params) {
  return request({
    url: 'records/exam/paging',
    method: 'get',
    params
  })
}

export function recordExercisePaging(params) {
  return request({
    url: 'records/exercise/paging',
    method: 'get',
    params
  })
}

export function recordExerciseDetail(params) {
  return request({
    url: 'records/exercise/detail',
    method: 'get',
    params
  })
}
