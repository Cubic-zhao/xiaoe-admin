<template>
  <section class="stat-section" aria-labelledby="stat-data-title">
    <div class="block-title">
      <h2 id="stat-data-title">经营数据</h2>
    </div>
    <div v-if="error" class="stat-error" role="alert">
      <span>{{ error }}</span>
      <el-button link type="primary" @click="load">重新加载</el-button>
    </div>
    <div v-else class="stat-panel" :aria-busy="loading ? 'true' : 'false'">
      <router-link v-for="item in items" :key="item.key" class="stat" :to="item.to">
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="text" class="skeleton-title" />
            <el-skeleton-item variant="h3" class="skeleton-value" />
          </template>
          <template #default>
            <el-statistic :title="item.title" :value="statData[item.key]" :precision="item.money ? 2 : 0" :prefix="item.money ? '¥' : ''" />
          </template>
        </el-skeleton>
      </router-link>
    </div>
  </section>
</template>

<script setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { statApi } from '@/api/dashboard.js'

  // 字段与跳转目标沿用原有实现：GET /user/admin/stat/data（AdminStatDataResp）
  const items = [
    { key: 'todayOrder', title: '今日订单', to: '/common/order' },
    { key: 'todayMoney', title: '今日收入', to: '/common/order', money: true },
    { key: 'yesterdayOrder', title: '昨日订单', to: '/common/order' },
    { key: 'yesterdayMoney', title: '昨日收入', to: '/common/order', money: true },
    { key: 'userSum', title: '用户总数', to: '/users/list' },
    { key: 'courseSum', title: '课程总数', to: '/course/list' },
    { key: 'orderSum', title: '订单总数', to: '/common/order' },
    { key: 'orderMoney', title: '累计收入', to: '/common/order', money: true }
  ]

  const statData = ref({})
  const loading = ref(true)
  const error = ref('')
  let requestId = 0

  async function load() {
    const current = ++requestId
    loading.value = true
    error.value = ''
    try {
      const res = await statApi.data()
      if (current === requestId) statData.value = res || {}
    } catch (e) {
      if (current === requestId) error.value = e?.data?.msg || e?.response?.data?.msg || '经营数据读取失败，请重新加载'
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  onMounted(load)
  onBeforeUnmount(() => {
    requestId++
  })
  defineExpose({ load })
</script>

<style lang="scss" scoped>
  .block-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0 12px;

    h2 {
      margin: 0;
      color: var(--xe-ink-900);
      font-size: 15px;
      font-weight: 700;
    }
  }

  .stat-panel {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    overflow: hidden;
    background: #fff;
    border: 1px solid var(--xe-ink-200);
    border-radius: var(--xe-radius-md);
  }

  .stat {
    display: block;
    padding: 18px 24px;
    border-right: 1px solid var(--xe-ink-100);
    border-bottom: 1px solid var(--xe-ink-100);

    &:nth-child(4n) {
      border-right: 0;
    }

    &:nth-child(n + 5) {
      border-bottom: 0;
    }

    &:hover {
      background: var(--xe-ink-50);
    }

    &:focus-visible {
      border-radius: 0;
      box-shadow: inset 0 0 0 2px var(--xe-brand-600);
    }
  }

  :deep(.el-statistic) {
    --el-statistic-title-font-size: 13px;
    --el-statistic-title-color: var(--xe-ink-500);
    --el-statistic-content-font-size: 24px;
    --el-statistic-content-font-weight: 800;
    --el-statistic-content-color: var(--xe-ink-900);
  }

  :deep(.el-statistic__head) {
    margin-bottom: 4px;
  }

  .skeleton-title {
    width: 40%;
  }

  .skeleton-value {
    width: 70%;
    margin-top: 10px;
  }

  .stat-error {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: #fff;
    border: 1px solid var(--xe-ink-200);
    border-radius: var(--xe-radius-md);
    color: var(--xe-danger-700);
  }
</style>
