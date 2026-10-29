<template>
  <el-main>
    <div class="main-container" :class="{ 'is-bare': isWorkbench }">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path"></component>
      </router-view>
    </div>
  </el-main>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { PATH } from '@/utils/constants/system'

  // 工作台把卡片直接放在灰底上；其余页面仍放在白色卡片容器里（60 号方案 §4.2）
  const currentRoute = useRoute()
  const isWorkbench = computed(() => currentRoute.path === PATH.URL_DASHBOARD)
</script>

<style lang="scss" scoped>
  .el-main {
    background: var(--xe-ink-100);
    --el-main-padding: 24px;
    transition: margin-right 0.5s;

    .main-container {
      box-sizing: border-box;
      min-height: calc(100vh - var(--xe-header-height) - 48px);
      padding: 20px;
      overflow: hidden;
      background: #fff;
      border: 1px solid var(--xe-ink-200);
      border-radius: var(--xe-radius-md);

      &.is-bare {
        padding: 0;
        overflow: visible;
        background: transparent;
        border: 0;
        border-radius: 0;
      }
    }
  }
</style>
