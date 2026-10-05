import request from '@/utils/request'

export function classCount() {
  return request({
    url: 'stat/student',
    method: 'get'
  })
}

export function classExamCount() {
  return request({
    url: 'stat/exam',
    method: 'get'
  })
}
export function classAllCounts() {
  return request({
    url: 'stat/allCounts',
    method: 'get'
  })
}

export function getDaily() {
  return request({
    url: 'stat/daily',
    method: 'get'
  })
}
