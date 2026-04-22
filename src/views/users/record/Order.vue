<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.orderNo" placeholder="根据订单号搜索" prefix-icon="Search" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.anomalyType" clearable placeholder="异常类型" style="width: 180px">
              <el-option v-for="item in anomalyOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-table v-loading="page.loading" :data="page.list">
      <el-table-column :min-width="180" label="商品信息">
        <template #default="scope">
          <img
            :alt="scope.row.courseViewVO?.courseName || 'course'"
            :src="scope.row.courseViewVO?.courseLogo"
            style="float: left; height: 50px; width: 90px; vertical-align: middle; border-radius: 5px"
          />
          <div style="float: left; margin-left: 10px">
            {{ scope.row.courseViewVO?.courseName || '课程信息缺失' }}
            <br />
            <span v-if="scope.row.courseViewVO?.isFree == 1">免费</span>
            <span v-else-if="scope.row.courseViewVO">
              ￥{{ scope.row.courseViewVO.coursePrice }}<span style="text-decoration: line-through; margin-left: 10px">￥{{ scope.row.courseViewVO.rulingPrice }}</span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :min-width="120" label="订单号" prop="orderNo" />
      <el-table-column :min-width="90" label="实付金额">
        <template #default="scope">
          <span>￥{{ scope.row.coursePrice }}</span>
        </template>
      </el-table-column>
      <el-table-column :min-width="120" label="支付方式/时间">
        <template #default="scope">
          <div>{{ scope.row.payTypeLabel || '-' }}</div>
          <div class="table-secondary">{{ scope.row.payTime || scope.row.gmtCreate || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="100" label="订单状态">
        <template #default="scope">
          <div>{{ scope.row.orderStatusLabel || '-' }}</div>
          <div class="table-secondary">Mobile: {{ scope.row.mobileStatus || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" label="异常治理">
        <template #default="scope">
          <el-tag effect="plain" :type="anomalyTagType(scope.row.anomalyCode)">{{ scope.row.anomalyLabel || '待确认' }}</el-tag>
          <div class="table-secondary order-multi-line">{{ scope.row.anomalyHint || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" label="用户结果回放">
        <template #default="scope">
          <div class="order-multi-line">{{ scope.row.androidReplayHint || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" label="运营建议">
        <template #default="scope">
          <div class="order-multi-line">{{ scope.row.governanceSuggestion || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="140" label="审计状态">
        <template #default="scope">
          <div class="order-multi-line">{{ scope.row.callbackAuditStatus || '-' }}</div>
          <div class="table-secondary order-multi-line">{{ scope.row.reconciliationStatus || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="120" label="客户/备注">
        <template #default="scope">
          <div>{{ scope.row.remarkCus || '-' }}</div>
          <div class="table-secondary">{{ scope.row.remark || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column :width="150" fixed="right" label="操作">
        <template #default="scope">
          <el-button text type="info" @click="openReplayDrawer(scope.row)">回放</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'order:remark'" text type="primary" @click="openFormModal(scope.row)">写备注</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <order-form ref="formRef" @refresh="handlePage" />

    <el-drawer v-model="replayDrawer.visible" size="720px" title="订单异常回放">
      <el-descriptions v-if="replayDrawer.row" :column="2" border>
        <el-descriptions-item label="订单号">{{ replayDrawer.row.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ replayDrawer.row.orderStatusLabel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{ replayDrawer.row.payTypeLabel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ replayDrawer.row.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="异常标签">{{ replayDrawer.row.anomalyLabel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="移动端状态">{{ replayDrawer.row.mobileStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="异常说明" :span="2">{{ replayDrawer.row.anomalyHint || '-' }}</el-descriptions-item>
        <el-descriptions-item label="运营建议" :span="2">{{ replayDrawer.row.governanceSuggestion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="Android 回放" :span="2">{{ replayDrawer.row.androidReplayHint || '-' }}</el-descriptions-item>
        <el-descriptions-item label="回调审计" :span="2">{{ replayDrawer.row.callbackAuditStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="查单审计" :span="2">{{ replayDrawer.row.reconciliationStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="客户备注" :span="2">{{ replayDrawer.row.remarkCus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="后台备注" :span="2">{{ replayDrawer.row.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>
<script setup>
  import useTable from '@/utils/table'
  import { reactive, ref } from 'vue'
  import { usersApi } from '@/api/users'
  import Pagination from '@/components/Pagination/index.vue'
  import { useRoute } from 'vue-router'
  import OrderForm from '@/views/common/order/OrderForm.vue'

  const route = useRoute()

  const anomalyOptions = [
    { label: '支付成功', value: 'success' },
    { label: '支付失败', value: 'failed' },
    { label: '订单关闭', value: 'cancelled' },
    { label: '支付处理中', value: 'paying' },
    { label: '待支付超时', value: 'timeout' },
    { label: '数据不一致', value: 'data_mismatch' }
  ]

  const formRef = ref()
  const replayDrawer = reactive({
    visible: false,
    row: null
  })

  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const openReplayDrawer = (item) => {
    replayDrawer.row = item
    replayDrawer.visible = true
  }

  const anomalyTagType = (code) => {
    switch (code) {
      case 'success':
        return 'success'
      case 'failed':
      case 'data_mismatch':
        return 'danger'
      case 'timeout':
        return 'warning'
      case 'paying':
        return 'primary'
      case 'cancelled':
        return 'info'
      default:
        return 'info'
    }
  }

  const { page, handlePage, query, handleQuery, resetQuery } = useTable(
    {
      page: usersApi.orderInfoPage
    },
    { userId: route.query.userId }
  )
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .order-multi-line {
    line-height: 1.6;
    white-space: normal;
  }
</style>
