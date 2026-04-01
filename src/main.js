import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/index.scss'
import App from '@/App.vue'
import router, { createNewRouter } from '@/router/index.js'
import store from '@/store/index.js'
import { getToken } from '@/utils/cookie.js'
import { loginApi } from '@/api/login.js'
import { useUserStore } from '@/store/modules/user.js'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'virtual:svg-icons-register'
import Icon from '@/components/Icon/index.vue'
import { hasPermission } from '@/utils/permission.js'
import { PATH } from '@/utils/constants/system'

setupInit()

async function setupInit() {
  const userStore = useUserStore(store)
  if (!getToken()) {
    init()
    return
  }

  try {
    const res = await loginApi.getUserInfo()
    createNewRouter(res?.routerList)
    init()
    userStore.login(res)
  } catch (error) {
    console.error(error)
    userStore.logout()
    init()
    if (router.currentRoute.value.path !== PATH.URL_LOGIN) {
      router.replace(PATH.URL_LOGIN)
    }
    ElMessage.error('Session restore failed, please log in again.')
  }
}

function init() {
  const app = createApp(App)
  app.use(router)
  app.use(store)
  app.use(ElementPlus)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
  app.component('Icon', Icon)

  app.directive('permission', (el, binding) => {
    if (!hasPermission(binding.value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  })

  app._context.components.ElDialog.props.closeOnClickModal.default = false
  app.mount('#app')
}
