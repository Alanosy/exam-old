import request from '@/utils/request'

export function certificatePaging(params) {
  return request({
    url: 'certificate/paging',
    method: 'get',
    params
  })
}
export function certificateDel(id) {
  return request({
    url: 'certificate/delete/' + id,
    method: 'delete'

  })
}
export function certificateAdd(data) {
  return request({
    url: 'certificate',
    method: 'post',
    data
  })
}

export function certificateUpdate(id, data) {
  return request({
    url: 'certificate/' + id,
    method: 'put',
    data
  })
}

export function certificateMy(params) {
  return request({
    url: 'certificate/paging/my',
    method: 'get',
    params

  })
}
