import request from '@/utils/request'

export function getLogPage(params) {
  return request({
    url: '/log',
    method: 'get',
    params
  })
}
