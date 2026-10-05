
import request from '@/utils/request'

export function doLike(data) {
  return request({
    url: 'like/doLike',
    method: 'post',
    data
  })
}

