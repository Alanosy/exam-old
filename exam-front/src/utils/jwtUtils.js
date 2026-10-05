import { getToken } from '@/utils/auth'
import { jwtDecode } from 'jwt-decode'
export function parseJwt(token) {
  // 分割JWT的三个部分
  var parts = token.split('.')
  // 解码JWT的payload部分
  var payload = decodeBase64Url(parts[1])
  // 将解码后的payload转换为对象
  return JSON.parse(payload)
}
function decodeBase64Url(input) {
  var base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  switch (base64.length % 4) {
    case 0:
      break
    case 2:
      base64 += '=='
      break
    case 3:
      base64 += '='
      break
    default:
      throw new Error('Invalid base64 string')
  }
  return decodeURIComponent(atob(base64))
}

// export function getTokenInfo() {
//     const token = getToken();
//     const user = parseJwt(token);
//     return JSON.parse(user.userInfo)
//   }

export function getTokenInfo() {
  const token = getToken()
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo) // 假设userInfo是直接在payload中的
}

export function getRole() {
  const token = getToken()
  const decodedToken = jwtDecode(token)
  return JSON.parse(decodedToken.userInfo)['roleId'] // 假设userInfo是直接在payload中的
}

