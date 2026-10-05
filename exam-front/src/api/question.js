
import request from '@/utils/request'

export function quAdd(data) {
  return request({
    url: 'questions/single',
    method: 'post',
    data
  })
}
export function quPaging(params) {
  return request({
    url: 'questions/paging',
    method: 'get',
    params
  })
}

export function quUpdate(id, data) {
  return request({
    url: `questions/${id}`,
    method: 'put',
    data: data
  })
}

export function quDel(ids) {
  return request({
    url: 'questions/batch/' + ids,
    method: 'delete'
  })
}

export function quDetail(id) {
  return request({
    url: `questions/single/${id}`,
    method: 'get'
  })
}

export function importQue(id, data) {
  return request({
    url: `questions/import/${id}`,
    method: 'post',
    data
  })
}

// fetchDetail, saveData
/**
 * 题库详情
 * @param data
 */
export function fetchDetail(id) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/detail', { id: id })
}

/**
 * 保存题库
 * @param data
 */
export function saveData(data) {
  // eslint-disable-next-line no-undef
  return post('/exam/api/qu/qu/save', data)
}
