function restoreTags() {
  let tags = []
  try {
    tags = JSON.parse(sessionStorage.getItem('TAGS')) || []
  } catch (error) {
    tags = []
  }
  const contextPaths = ['/exam-record-detail', '/user-score']
  return tags.filter(item => {
    const path = item && (item.fullPath || item.path)
    return !!path && (!contextPaths.includes(item.path) || !!item.fullPath)
  })
}

const state = {
  tags: restoreTags()
}

const losePath = ['/404']

function isHomeTag(tag) {
  if (!tag) return false
  return tag.title === '主页' || tag.path === '/index' || tag.path === '/dashboard'
}
const mutations = {
  // 添加标签
  ADD_TAG: (state, tag) => {
    const tagKey = tag.fullPath || tag.path
    const pathList = state.tags.map(item => item.fullPath || item.path)
    if (!losePath.includes(tag.path)) {
      if (pathList.includes(tagKey)) {
        state.tags.forEach(item => {
          if ((item.fullPath || item.path) === tagKey) {
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
    if (state.tags && state.tags.length === 1) {
      return
    }
    // 首页不可关闭
    if (isHomeTag(tag)) {
      return
    }
    state.tags = state.tags.filter(
      item => (item.fullPath || item.path) !== (tag.fullPath || tag.path)
    )
    sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
  },
  // 关闭全部页签，仅保留首页
  CLOSE_ALL_TAGS(state) {
    const home = state.tags.find(isHomeTag)
    if (home) {
      state.tags = [{ ...home, checked: true }]
    } else {
      state.tags = [{
        path: '/index',
        title: '主页',
        checked: true
      }]
    }
    sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
  },
  CLOSE_SIDEBAR: (state) => {
    state.tags = []
  },
  // 更新当前路径页签标题（新增/编辑同路由区分）
  UPDATE_TAG_TITLE(state, { path, title }) {
    if (!path || !title) return
    state.tags.forEach(item => {
      if (item.path === path) {
        item.title = title
      }
    })
    sessionStorage.setItem('TAGS', JSON.stringify(state.tags))
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
