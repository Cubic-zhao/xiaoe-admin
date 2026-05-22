<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="用户ID">
            <el-input-number v-model="query.userId" :min="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="类型">
            <el-input v-model="query.category" clearable placeholder="反馈类型" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" clearable style="width: 140px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" clearable placeholder="内容/联系方式" @keyup.enter="handleQuery()" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="工单" min-width="150">
        <template #default="scope">
          <div>#{{ scope.row.id }}</div>
          <div class="table-secondary">{{ scope.row.category || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="用户" min-width="180">
        <template #default="scope">
          <div>{{ scope.row.userName || '-' }} / UID: {{ scope.row.userId }}</div>
          <div class="table-secondary">{{ scope.row.userMobile || '-' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="320" prop="content" show-overflow-tooltip />
      <el-table-column label="联系方式" min-width="160" prop="contact" show-overflow-tooltip />
      <el-table-column label="状态" width="110">
        <template #default="scope">
          <el-tag effect="plain" :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="160" prop="gmtModified" />
      <el-table-column fixed="right" label="操作" width="260">
        <template #default="scope">
          <el-button text type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'user:feedback:reply'" text type="success" :disabled="scope.row.status === 'closed'" @click="replyRef.onOpen(scope.row)">回复</el-button>
          <el-divider direction="vertical" />
          <el-button
            v-if="scope.row.status !== 'closed'"
            v-permission="'user:feedback:close'"
            text
            type="danger"
            @click="closeTicket(scope.row)"
          >
            关闭
          </el-button>
          <el-button v-else v-permission="'user:feedback:close'" text type="warning" @click="reopenTicket(scope.row)">重开</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <feedback-reply-dialog ref="replyRef" @refresh="handlePage" />

    <el-drawer v-model="detail.visible" title="反馈详情" size="640px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="工单ID">{{ detail.data.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.data.userName || '-' }} / {{ detail.data.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.data.category || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag effect="plain" :type="statusType(detail.data.status)">{{ statusLabel(detail.data.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ detail.data.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容">
          <div class="pre-wrap">{{ detail.data.content || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="截图">{{ detail.data.screenshots || '-' }}</el-descriptions-item>
        <el-descriptions-item label="回复内容">
          <div class="pre-wrap">{{ detail.data.replyContent || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="回复时间">{{ detail.data.replyTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.data.gmtModified || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import FeedbackReplyDialog from './FeedbackReplyDialog.vue'

  const replyRef = ref()
  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: usersApi.feedbackPage
  })

  const statusOptions = [
    { label: '待处理', value: 'open' },
    { label: '已回复', value: 'replied' },
    { label: '已关闭', value: 'closed' }
  ]
  const statusLabel = (value) => statusOptions.find((item) => item.value === value)?.label || value || '-'
  const statusType = (value) => ({ open: 'warning', replied: 'success', closed: 'info' })[value] || 'info'

  const detail = reactive({
    visible: false,
    data: {}
  })

  const openDetail = async (row) => {
    detail.data = await usersApi.feedbackView({ id: row.id })
    detail.visible = true
  }

  const closeTicket = async (row) => {
    await ElMessageBox.confirm(`确认关闭反馈工单 #${row.id}？`, '关闭反馈', { type: 'warning' })
    await usersApi.feedbackClose({ id: row.id })
    ElMessage.success('已关闭反馈工单')
    handlePage()
  }

  const reopenTicket = async (row) => {
    await ElMessageBox.confirm(`确认重开反馈工单 #${row.id}？`, '重开反馈', { type: 'warning' })
    await usersApi.feedbackReopen({ id: row.id })
    ElMessage.success('已重开反馈工单')
    handlePage()
  }
</script>

<style scoped>
  .table-secondary {
    color: #909399;
    font-size: 12px;
    line-height: 1.6;
  }

  .pre-wrap {
    white-space: pre-wrap;
    line-height: 1.7;
  }
</style>
