<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-button type="primary" @click="handleQuery()"> 查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'user:edit'" type="primary" @click="openConsumeRecord()">添加余额</el-button>
      </div>
    </div>
    <el-card class="reconcile-card" shadow="never">
      <template #header>
        <div class="reconcile-header">
          <span>充值对账与主动查单</span>
          <el-tag effect="plain" type="warning">最终以渠道回调验签和主动查单为准</el-tag>
        </div>
      </template>
      <el-form inline label-width="96px">
        <el-form-item label="统计窗口">
          <el-input-number v-model="reconcileQuery.recentHours" :min="1" :max="168" controls-position="right" />
          <span class="unit-text">小时</span>
        </el-form-item>
        <el-form-item label="查单超时">
          <el-input-number v-model="reconcileQuery.timeoutMinutes" :min="1" :max="1440" controls-position="right" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item>
          <el-button :loading="reconcileLoading" @click="loadRechargeReconcileStats">刷新统计</el-button>
          <el-button type="primary" :loading="reconcileRunning" @click="runRechargeReconcile">执行主动查单</el-button>
        </el-form-item>
      </el-form>
      <el-descriptions :column="6" border size="small">
        <el-descriptions-item label="窗口">{{ reconcileStats.recentHours || reconcileQuery.recentHours }}h</el-descriptions-item>
        <el-descriptions-item label="总数">{{ reconcileStats.total || 0 }}</el-descriptions-item>
        <el-descriptions-item label="成功">{{ reconcileStats.success || 0 }}</el-descriptions-item>
        <el-descriptions-item label="待确认">{{ (reconcileStats.created || 0) + (reconcileStats.paying || 0) }}</el-descriptions-item>
        <el-descriptions-item label="失败">{{ reconcileStats.failed || 0 }}</el-descriptions-item>
        <el-descriptions-item label="超时">{{ reconcileStats.timeout || 0 }}</el-descriptions-item>
      </el-descriptions>
      <el-alert
        class="reconcile-alert"
        type="info"
        :closable="false"
        show-icon
        title="该面板用于运营观察和触发 created/paying 充值单的主动查单；如果缺少真实渠道配置，查单结果仍会按联调网关能力返回，不能替代商用签核。"
      />
    </el-card>
    <el-table v-loading="page.loading" :data="page.list">
      <el-table-column label="时间" prop="gmtCreate" />
      <el-table-column label="消费类型" prop="consumeType">
        <template #default="scope">
          <enum-view :enum-name="'ConsumeTypeEnum'" :enum-value="scope.row.consumeType" />
        </template>
      </el-table-column>
      <el-table-column label="金额" prop="consumeAmount">
        <template #default="scope">
          <span v-if="scope.row.consumeType === 1">-</span>
          <span v-if="scope.row.consumeType === 2">+</span>
          {{ scope.row.consumeAmount }}
        </template>
      </el-table-column>
      <el-table-column label="余额" prop="balanceAmount" />
      <el-table-column label="备注" prop="remark" />
      <el-table-column label="订单号" prop="orderNo" />
    </el-table>
    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <consume-form ref="consumeRef" @refresh="handlePage" />
  </div>
</template>
<script setup>
  import useTable from '@/utils/table'
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { usersApi } from '@/api/users'
  import Pagination from '@/components/Pagination/index.vue'
  import ConsumeForm from './ConsumeForm.vue'
  import { useRoute } from 'vue-router/dist/vue-router'
  import EnumView from '@/components/Enum/View/index.vue'
  const route = useRoute()
  // 添加
  const consumeRef = ref()
  const openConsumeRecord = () => {
    consumeRef.value.onOpen(route.query.userId)
  }
  const reconcileQuery = reactive({
    recentHours: 24,
    timeoutMinutes: 30
  })
  const reconcileStats = ref({})
  const reconcileLoading = ref(false)
  const reconcileRunning = ref(false)

  const loadRechargeReconcileStats = async () => {
    reconcileLoading.value = true
    try {
      reconcileStats.value = await usersApi.rechargeReconcileStats({
        recentHours: reconcileQuery.recentHours
      })
    } finally {
      reconcileLoading.value = false
    }
  }

  const runRechargeReconcile = async () => {
    reconcileRunning.value = true
    try {
      const result = await usersApi.rechargeReconcileRun({
        timeoutMinutes: reconcileQuery.timeoutMinutes
      })
      ElMessage.success(result.message || '主动查单已执行')
      await loadRechargeReconcileStats()
      handlePage()
    } finally {
      reconcileRunning.value = false
    }
  }

  onMounted(loadRechargeReconcileStats)

  // 基础功能
  const { page, handlePage, query, handleQuery, resetQuery } = useTable(
    {
      page: usersApi.usersAccountConsumePage
    },
    { userId: route.query.userId }
  )
</script>
<style scoped>
  .reconcile-card {
    margin-bottom: 16px;
  }

  .reconcile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .unit-text {
    margin-left: 6px;
    color: var(--el-text-color-secondary);
  }

  .reconcile-alert {
    margin-top: 12px;
  }
</style>
