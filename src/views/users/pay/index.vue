<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.orderNo" placeholder="订单号" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="query.serialNumber" placeholder="支付流水号" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item>
            <enum-select v-model="query.payType" :enum-name="'PayTypeEnum'" :title="'支付方式'" />
          </el-form-item>
          <el-form-item>
            <enum-select v-model="query.orderStatus" :enum-name="'OrderStatusEnum'" :title="'支付状态'" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="订单号 / 流水号" min-width="210">
        <template #default="scope">
          <div>{{ scope.row.orderNo || '-' }}</div>
          <div class="table-secondary">流水 {{ scope.row.serialNumber || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="金额" min-width="150">
        <template #default="scope">
          <div>实付 ¥{{ formatAmount(scope.row.coursePrice) }}</div>
          <div class="table-secondary">划线价 ¥{{ formatAmount(scope.row.rulingPrice) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" min-width="110">
        <template #default="scope">
          <enum-view :enum-name="'PayTypeEnum'" :enum-value="scope.row.payType" />
        </template>
      </el-table-column>
      <el-table-column label="支付状态" min-width="110">
        <template #default="scope">
          <enum-view :enum-name="'OrderStatusEnum'" :enum-value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="客户备注" min-width="180" show-overflow-tooltip>
        <template #default="scope">{{ scope.row.remarkCus || '-' }}</template>
      </el-table-column>
      <el-table-column label="时间" min-width="180">
        <template #default="scope">
          <div>创建 {{ scope.row.gmtCreate || '-' }}</div>
          <div class="table-secondary">{{ scope.row.payTime ? '支付 ' + scope.row.payTime : '未支付' }}</div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template #default="scope">
          <el-button v-permission="'user:order:pay:view'" text type="primary" @click="openDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <el-drawer v-model="detail.visible" size="560px" title="支付流水详情">
      <div v-loading="detail.loading">
        <el-descriptions v-if="detail.data" :column="1" border>
          <el-descriptions-item label="记录 ID">{{ detail.data.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ detail.data.orderNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付流水号">{{ detail.data.serialNumber || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">¥{{ formatAmount(detail.data.coursePrice) }}</el-descriptions-item>
          <el-descriptions-item label="划线价">¥{{ formatAmount(detail.data.rulingPrice) }}</el-descriptions-item>
          <el-descriptions-item label="支付方式"><enum-view :enum-name="'PayTypeEnum'" :enum-value="detail.data.payType" /></el-descriptions-item>
          <el-descriptions-item label="支付状态"><enum-view :enum-name="'OrderStatusEnum'" :enum-value="detail.data.orderStatus" /></el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.data.gmtCreate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ detail.data.payTime || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="客户备注">{{ detail.data.remarkCus || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
  // 支付流水只读页：字段对照 AdminOrderPayController /user/admin/order/pay/{page,view}
  // 与 AdminOrderPayPageReq / AdminOrderPayPageResp / AdminOrderPayViewResp；退款类操作在 RELEASE-REFUND 收口前不在本页开放
  import { reactive } from 'vue'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'
  import EnumSelect from '@/components/Enum/Select/index.vue'

  const { page, handlePage, query, handleQuery, resetQuery } = useTable({ page: usersApi.orderPayPage })

  const formatAmount = (value) => Number(value || 0).toFixed(2)

  const detail = reactive({
    visible: false,
    loading: false,
    data: null
  })

  const openDetail = async (row) => {
    detail.data = null
    detail.visible = true
    detail.loading = true
    try {
      detail.data = await usersApi.orderPayView({ id: row.id })
    } catch {
      detail.visible = false
    } finally {
      detail.loading = false
    }
  }
</script>

<style scoped>
  .table-secondary {
    color: var(--xe-ink-500);
    font-size: 12px;
    line-height: 1.6;
  }
</style>
