import Cookies from 'js-cookie'

const TokenKey = 'Authorization'
const UserIdKey = 'class_activity_system_user_id'
const roleKey = 'class_activity_system_role'
const discussionKey = 'class_activity_system_discussion_id'
const gradeKey = 'class_activity_system_grade_id'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}


export function getUserId() {
  return localStorage.getItem(UserIdKey)
}
export function setUserId(userId) {
  return localStorage.setItem(UserIdKey, userId)
}

export function removeUserId() {
  return localStorage.removeItem(UserIdKey)
}

export function getRole() {
  return localStorage.getItem(roleKey)
}

export function setRole(role) {
  return localStorage.setItem(roleKey, role)
}

export function removeRole() {
  return localStorage.removeItem(roleKey)
}

export function getDiscussionId() {
  return localStorage.getItem(discussionKey)
}

export function setDiscussionId(id) {
  return localStorage.setItem(discussionKey, id)
}

export function removeDiscussionId() {
  return localStorage.removeItem(discussionKey)
}

export function getGradeId() {
  return localStorage.getItem(gradeKey)
}

export function setGradeId(id) {
  return localStorage.setItem(gradeKey, id)
}

export function removeGradeId() {
  return localStorage.removeItem(gradeKey)
}