/*
 * @Author: 魏进 3413105907@qq.com
 * @Date: 2024-05-16 14:11:11
 * @LastEditors: 魏进 3413105907@qq.com
 * @LastEditTime: 2024-06-06 18:28:44
 * @FilePath: \online-exam-system-frontend\src\api\exercise.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/utils/request'

export function exercisePaging(params) {
  return request({
    url: 'exercises/getRepo',
    method: 'get',
    params
  })
}

export function getQuestion(params, repoId) {
  return request({
    url: 'exercises/' + repoId,
    method: 'get',
    params
  })
}

export function getQuestionDetail(id) {
  return request({
    url: `exercises/question/${id}`,
    method: 'get'
  })
}

export function submitAnswer(data) {
  return request({
    url: `exercises/fillAnswer`,
    method: 'post',
    data
  })
}

export function getAnswerInfo(repoId, quId) {
  return request({
    url: `exercises/answerInfo/${repoId}/${quId}`,
    method: 'get'
  })
}

