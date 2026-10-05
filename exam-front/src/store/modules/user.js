import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken,setUserId,removeUserId,setRole,removeRole,setGradeId } from '@/utils/auth'

import { resetRouter } from '@/router'
import { parseJwt } from '@/utils/jwtUtils'
import { connectWebSocket, disconnectWebSocket } from '@/utils/websocket'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()
// const decode = () => {
//   const token = getToken()
//   const user = parseJwt(token)
// }

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { data } = response
        if (response.code === 1) {
          const info = parseJwt(data)
          const user = JSON.parse(info.userInfo)
          const roleId = JSON.parse(info.userInfo).roleId
          setUserId(user.id)
          if (roleId === 1) {
            window.localStorage.setItem('roles', 'student')
            setRole('student')
            setGradeId(user.gradeId)
          } else if (roleId === 2) {
            window.localStorage.setItem('roles', 'teacher')
            setRole('teacher')
          } else if (roleId === 3) {
            window.localStorage.setItem('roles', 'admin')
            setRole('admin')

          }
          // 建立websocket连接
          connectWebSocket()
          commit('SET_TOKEN', data)
          setToken(data)
          resolve()
        } else {
          reject(response)
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // reset token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // 移除token
      commit('RESET_STATE') // 重置状态
      localStorage.removeItem('roles') // 移除角色信息
      resolve()
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove token first
        resetRouter()

        commit('RESET_STATE')
        sessionStorage.clear()
        localStorage.clear()
        disconnectWebSocket()
        resolve()
        removeUserId()
        removeRole()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

