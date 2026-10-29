<template>
  <section class="todo-section" aria-labelledby="todo-title">
    <div class="block-title">
      <h2 id="todo-title">今日待办</h2>
    </div>
    <div v-if="error" class="todo-error" role="alert">
      <span>{{ error }}</span>
      <el-button link type="primary" @click="load">重新加载</el-button>
    </div>
    <ul v-else class="todo-grid" :aria-busy="loading ? 'true' : 'false'">
      <li v-for="item in items" :key="item.key" class="todo" :class="{ 'is-danger': item.danger && Number(stat[item.key]) > 0 }">
        <span class="todo-label">{{ item.label }}</span>
        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="h3" class="todo-skeleton" />
          </template>
          <template #default>
            <strong>{{ stat[item.key] ?? '—' }}</strong>
          </template>
        </el-skeleton>
        <router-link v-if="canOpen(item.path)" :to="item.path" class="todo-link">{{ item.action }} →</router-link>
      </li>
    </ul>
  </section>
</template>

<script setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { statApi } from '@/api/dashboard.js'
  import { useUserStore } from '@/store/modules/user'

  // GET /user/admin/stat/o2o（AdminStatO2oResp）；链接路径与 docs/sql 中的 sys_menu 种子一致
  const items = [
    { key: 'pendingQualification', label: '待审核资质', path: '/users/tutor/audit', action: '去审核' },
    { key: 'todayBooking', label: '今日约课', path: '/users/booking', action: '约课订单' },
    { key: 'todaySchedule', label: '今日排课', path: '/users/schedule', action: '查看排课' },
    { key: 'openFeedback', label: '待处理反馈', path: '/users/feedback', action: '去处理' },
    { key: 'pendingRefund', label: '待审退款', path: '/users/refund', action: '去审核', danger: true },
    { key: 'pendingWithdraw', label: '提现待处理', path: '/users/withdraw', action: '去处理' }
  ]

  const stat = ref({})
  const loading = ref(true)
  const error = ref('')
  let requestId = 0

  const normalizePath = (path) => (path ? `/${String(path)}`.replace(/\/+/g, '/') : '')
  const routePaths = computed(() => new Set((useUserStore().getRouterList || []).map((menu) => normalizePath(menu?.path))))
  const canOpen = (path) => routePaths.value.has(path)

  async function load() {
    const current = ++requestId
    loading.value = true
    error.value = ''
    try {
      const res = await statApi.o2o()
      if (current === requestId) stat.value = res || {}
    } catch (e) {
      if (current === requestId) error.value = e?.data?.msg || e?.response?.data?.msg || '今日待办读取失败，请重新加载'
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

  .todo-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .todo {
    display: flex;
    flex-direction: column;
    min-height: 120px;
    padding: 16px 18px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid var(--xe-ink-200);
    border-radius: var(--xe-radius-md);

    strong {
      display: block;
      margin-top: 6px;
      color: var(--xe-ink-900);
      font-size: 30px;
      font-weight: 800;
      line-height: 1.2;
    }

    &.is-danger strong {
      color: var(--xe-danger-700);
    }
  }

  .todo-label {
    color: var(--xe-ink-600);
    font-size: 14px;
  }

  .todo-skeleton {
    width: 50%;
    margin-top: 10px;
  }

  .todo-link {
    margin-top: auto;
    padding-top: 8px;
    color: var(--xe-brand-600);
    font-size: 13px;
    font-weight: 600;

    &:hover {
      color: var(--xe-brand-700);
      text-decoration: underline;
    }
  }

  .todo-error {
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
