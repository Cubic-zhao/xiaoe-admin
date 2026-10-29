<template>
  <div class="dashboard-container">
    <div class="page-head">
      <div>
        <h1>{{ pageTitle }}</h1>
        <p>今日运营概览</p>
      </div>
      <el-button v-if="hasPermission('stat:o2o') || hasPermission('stat:data') || hasPermission('stat:login')" :icon="Refresh" :loading="refreshing" @click="refresh">刷新</el-button>
    </div>

    <todo-panel v-if="hasPermission('stat:o2o')" ref="todoRef" />

    <stat-data v-if="hasPermission('stat:data')" ref="statDataRef" />

    <div class="bottom-row" :class="{ 'is-single': !hasPermission('stat:login') }">
      <stat-login v-if="hasPermission('stat:login')" ref="statLoginRef" />
      <quick-links />
    </div>
  </div>
</template>
<script setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { Refresh } from '@element-plus/icons-vue'
  import StatLogin from './StatLogin.vue'
  import StatData from './StatData.vue'
  import QuickLinks from './QuickLinks.vue'
  import TodoPanel from './TodoPanel.vue'
  import { hasPermission } from '@/utils/permission.js'

  const route = useRoute()
  const pageTitle = computed(() => route.meta?.title || '家教工作台')
  const todoRef = ref()
  const statDataRef = ref()
  const statLoginRef = ref()
  const refreshing = ref(false)

  // 刷新 = 重新请求今日待办、经营数据与注册登录统计（60 号方案 §4.3）
  async function refresh() {
    if (refreshing.value) return
    refreshing.value = true
    try {
      await Promise.allSettled([todoRef.value?.load(), statDataRef.value?.load(), statLoginRef.value?.load()])
    } finally {
      refreshing.value = false
    }
  }
</script>
<style lang="scss" scoped>
  .page-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;

    h1 {
      margin: 0;
      color: var(--xe-ink-900);
      font-size: 22px;
      font-weight: 700;
      line-height: 1.4;
    }

    p {
      margin: 2px 0 0;
      color: var(--xe-ink-600);
      font-size: 14px;
    }
  }

  .bottom-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 16px;
    margin-top: 24px;

    &.is-single {
      grid-template-columns: minmax(0, 380px);
    }
  }
</style>
