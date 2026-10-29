<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">{{ item.title }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'

  const route = useRoute()

  const breadcrumbList = computed(() => {
    let menuId = route.name
    if (!menuId) {
      return []
    }
    return useUserStore().getBreadcrumbMap.get(menuId)
  })
</script>

<style lang="scss" scoped>
  .el-breadcrumb {
    min-width: 0;
    margin-left: 32px;
    font-size: 14px;
    white-space: nowrap;

    :deep(.el-breadcrumb__inner) {
      color: var(--xe-ink-500);
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: var(--xe-ink-900);
      font-weight: 600;
    }
  }
</style>
