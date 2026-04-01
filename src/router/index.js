import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/cookie'
import { PATH } from '@/utils/constants/system'

const DYNAMIC_LAYOUT_ROUTE = 'dynamic-layout'
const MissingRouteView = () => import('@/views/404.vue')

const constantRoutes = [
  {
    path: '/',
    redirect: PATH.URL_DASHBOARD
  },
  {
    path: PATH.URL_LOGIN,
    component: () => import('@/views/login/index.vue')
  },
  {
    path: PATH.URL_404,
    component: () => import('@/views/404.vue'),
    meta: { title: '404' }
  },
  {
    path: PATH.URL_403,
    component: () => import('@/views/403.vue'),
    meta: { title: '403' }
  }
]

const createRouters = (routerList) =>
  createRouter({
    history: createWebHashHistory(),
    routes: routerList,
    strict: true
  })

const router = createRouters(constantRoutes)

router.beforeEach(async (to, from, next) => {
  const token = getToken()
  if (!token) {
    if (to.path === PATH.URL_LOGIN) {
      next()
      return
    }
    next({ path: PATH.URL_LOGIN })
    return
  }
  if (to.matched.length === 0) {
    next({ path: PATH.URL_404 })
    return
  }
  next()
})

export default router

const normalizeMenuPath = (path) => {
  if (!path) {
    return ''
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  return normalized.replace(/\/+/g, '/')
}

const normalizeComponentPath = (component) => {
  if (!component) {
    return ''
  }
  const normalized = component.startsWith('/') ? component : `/${component}`
  return normalized.endsWith('.vue') ? normalized : `${normalized}.vue`
}

const resolveMenuComponent = (menu, modules) => {
  const componentPath = normalizeComponentPath(menu.component)
  if (!componentPath) {
    console.warn('[router] menu component is missing, fallback to 404 view', menu)
    return MissingRouteView
  }
  const component = modules[`../views${componentPath}`]
  if (!component) {
    console.warn('[router] menu component file was not found, fallback to 404 view', menu)
    return MissingRouteView
  }
  return component
}

export function createNewRouter(data) {
  const source = Array.isArray(data) ? data : useUserStore().routerList || []
  const modules = import.meta.glob('../views/**/*.vue')
  const routePathSet = new Set()
  const routerList = []

  for (const menu of source) {
    const path = normalizeMenuPath(menu?.path)
    if (!path || routePathSet.has(path)) {
      continue
    }

    routePathSet.add(path)
    routerList.push({
      path,
      name: String(menu.id),
      meta: {
        id: String(menu.id),
        componentName: String(menu.id),
        title: menu.menuName,
        icon: menu.menuIcon
      },
      component: resolveMenuComponent(menu, modules)
    })
  }

  if (router.hasRoute(DYNAMIC_LAYOUT_ROUTE)) {
    router.removeRoute(DYNAMIC_LAYOUT_ROUTE)
  }

  router.addRoute({
    path: '/',
    name: DYNAMIC_LAYOUT_ROUTE,
    meta: {},
    component: Layout,
    children: routerList
  })
}
