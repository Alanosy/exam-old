import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken, setToken } from '@/utils/auth'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000, // request timeout
  crossDomain: true
})

let isRedirectingToLogin = false

function isLoginPage() {
  return router.currentRoute && router.currentRoute.path === '/login'
}

function isAuthExpiredMessage(msg) {
  if (!msg) {
    return false
  }
  return msg.includes('登录已过期') || msg.includes('请先登录') || msg.includes('请重新登录') || msg.includes('token无效')
}

function redirectToLogin(message) {
  if (isRedirectingToLogin || isLoginPage()) {
    return
  }
  isRedirectingToLogin = true
  store.dispatch('user/resetToken').finally(() => {
    router.replace({
      path: '/login',
      query: { redirect: router.currentRoute.fullPath }
    }).finally(() => {
      isRedirectingToLogin = false
    })
  })
  Message({
    message: message || '登录已过期，请重新登录',
    type: 'error',
    duration: 5 * 1000
  })
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res.code !== 1) {
      const msg = res.msg || '错误'
      if (isAuthExpiredMessage(msg)) {
        redirectToLogin(msg)
      } else {
        Message({
          message: msg,
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(msg))
    }

    const newToken = response.headers['authorization']
    if (newToken) {
      setToken(newToken)
      store.commit('user/SET_TOKEN', newToken)
    }
    return res
  },
  error => {
    console.log('err' + error)
    if (error.response) {
      const status = error.response.status
      const msg = (error.response.data && error.response.data.msg) || ''
      if (status === 401 || isAuthExpiredMessage(msg)) {
        redirectToLogin(msg || '登录已过期，请重新登录')
      } else if (status === 403) {
        Message({
          message: msg || '没有权限访问该资源',
          type: 'error',
          duration: 5 * 1000
        })
      } else if (status === 404) {
        Message({
          message: '请求的资源不存在',
          type: 'error',
          duration: 5 * 1000
        })
      } else {
        Message({
          message: msg || '发生未知错误',
          type: 'error',
          duration: 5 * 1000
        })
      }
    } else {
      Message({
        message: '网络错误，请稍后重试',
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
