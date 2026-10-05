
import request from '@/utils/request'

export function scorePaging(params) {
  return request({
    url: 'score/paging',
    method: 'get',
    params
  })
}

export function getExamScore(params) {
  return request({
    url: 'score/getExamScore',
    method: 'get',
    params
  })
}

export function exportScores(examId, gradeId) {
  return request({
    url: `score/export/${examId}/${gradeId}`,
    method: 'get',
    responseType: 'blob'
  })
}

