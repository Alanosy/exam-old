import router from '@/router'

const state = {
  tags: JSON.parse(sessionStorage.getItem('TAGS')) || []
}

const losePath = ['/404']
const mutations = {
  // 添加标签
  ADD_TAG: (state, tag) => {
    const pathList = state.tags.map(item => item.path)
    if (!losePath.includes(tag.path)) {
      if (pathList.includes(tag.path)) {
        state.tags.forEach(item => {
          if (item.path === tag.path) {
            item.checked = true
          } else {
            item.checked = false
          }
        })
      } else {
        state?.tags?.forEach(item => {
          item.checked = false
        })
        tag = {
          ...tag,
          checked: true
        }
        state.tags.push(tag)
      }
      sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
    }
  },
  // 删除标签
  REMOVE_TAG(state, tag) {
    (state.tags)
    if (state.tags && state.tags.length === 1) {
      return
    }
    state.tags.map((item, index) => {
      if (item.title === tag.title) {
        state.tags.splice(index, 1)
        if (router.history.current.fullPath === tag.path) {
          router.push(state.tags[state.tags.length - 1].path)
        }
      }
    })
    sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
  },
  CLOSE_SIDEBAR: (state) => {
    state.tags = []
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
