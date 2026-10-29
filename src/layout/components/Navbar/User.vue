<template>
  <div class="info">
    <el-dropdown>
      <div class="user-trigger">
        <span class="user-avatar" aria-hidden="true">{{ avatarText }}</span>
        <span class="user-name">{{ realName }}</span>
        <el-icon class="user-arrow"><arrow-down /></el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="onLogout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
  import { ArrowDown } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/modules/user'
  import { computed, ref } from 'vue'
  import { removeToken } from '@/utils/cookie'
  import { ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { PATH } from '@/utils/constants/system'

  const realName = ref(useUserStore().realName)
  const avatarText = computed(() =>
    String(realName.value || '管')
      .slice(0, 1)
      .toUpperCase()
  )
  const router = useRouter()

  /**
   * 退出登录
   */
  const onLogout = () => {
    ElMessageBox.confirm('确认要退出登录?', '退出登录', {
      type: 'warning',
      cancelButtonText: '取消',
      confirmButtonText: '确认'
    }).then(async () => {
      removeToken()
      useUserStore().logout()
      await router.push({ path: PATH.URL_LOGIN })
    })
  }
</script>
<style lang="scss" scoped>
  .info {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: auto;
    margin-right: 24px;
  }

  .user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 8px;
    color: var(--xe-ink-900);
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: var(--xe-ink-100);
    }

    // Element Plus 对下拉触发器设置了 outline:none，这里用焦点环保证键盘可见
    &:focus-visible {
      box-shadow: var(--xe-focus-ring);
    }
  }

  .user-avatar {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--xe-brand-100);
    color: var(--xe-brand-700);
    font-weight: 700;
  }

  .user-arrow {
    color: var(--xe-ink-500);
  }
</style>
