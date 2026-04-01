import { cloneDeep, isEmpty } from 'lodash'
import { defineStore } from 'pinia'
import { removeToken } from '@/utils/cookie'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    mobile: '',
    realName: '',
    routerList: [],
    menuList: [],
    permissionList: [],
    breadcrumbMap: new Map()
  }),
  getters: {
    getMobile(state) {
      return state.mobile
    },
    getRealName(state) {
      return state.realName
    },
    getRouterList(state) {
      return state.routerList
    },
    getMenuList(state) {
      return state.menuList
    },
    getPermissionList(state) {
      return state.permissionList
    },
    getBreadcrumbMap(state) {
      return state.breadcrumbMap
    }
  },
  actions: {
    login(data = {}) {
      this.mobile = data.mobile || ''
      this.realName = data.realName || ''
      this.routerList = Array.isArray(data.routerList) ? data.routerList : []
      this.menuList = Array.isArray(data.menuList) ? data.menuList : []
      this.permissionList = Array.isArray(data.permissionList) ? data.permissionList : []
      this.breadcrumbMap = buildBreadcrumbMap(this.menuList)
    },

    logout() {
      this.mobile = ''
      this.realName = ''
      this.routerList = []
      this.menuList = []
      this.permissionList = []
      this.breadcrumbMap = new Map()
      removeToken()
    }
  }
})

function buildBreadcrumbMap(menuList = []) {
  const breadcrumbMaps = new Map()
  recursiveMap(Array.isArray(menuList) ? menuList : [], [], breadcrumbMaps)
  return breadcrumbMaps
}

function recursiveMap(menuList, parentList, breadcrumbMaps) {
  for (const menu of menuList) {
    if (!menu) {
      continue
    }
    const nextParents = menu.parentId === 0 ? [] : cloneDeep(parentList)
    const menuIdStr = String(menu.id)
    nextParents.push({ id: menuIdStr, title: menu.menuName })
    breadcrumbMaps.set(menuIdStr, nextParents)
    if (!isEmpty(menu.children)) {
      recursiveMap(menu.children, nextParents, breadcrumbMaps)
    }
  }
}
