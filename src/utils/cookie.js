import Cookies from 'js-cookie'
import { TOKEN_KEY } from '@/utils/constants/system'

/**
 * 单位：天
 */
const TokenExpiresTime = 1

/**
 * token cookie 属性：https 下只走加密连接，禁止跨站携带；写入与删除必须使用相同属性
 */
function tokenAttributes() {
  return {
    secure: location.protocol === 'https:',
    sameSite: 'Strict'
  }
}

export function setToken(token) {
  return Cookies.set(TOKEN_KEY, token, {
    expires: TokenExpiresTime,
    ...tokenAttributes()
  })
}

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  return Cookies.remove(TOKEN_KEY, tokenAttributes())
}
