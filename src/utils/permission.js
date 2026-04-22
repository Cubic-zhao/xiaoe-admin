import { useUserStore } from '@/store/modules/user.js'

const SUPER_PERMISSION = '*:*:*'

export function hasPermission(keyValue) {
  const permissions = useUserStore().getPermissionList || []
  if (permissions.includes(SUPER_PERMISSION)) {
    return true
  }
  return permissions.includes(keyValue)
}
