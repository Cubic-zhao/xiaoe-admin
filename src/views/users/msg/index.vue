<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
          <el-input v-model="query.msgTitle" placeholder="消息标题" clearable />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.msgType" clearable placeholder="消息类型" style="width: 200px">
              <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <enum-select v-model="query.statusId" :enum-name="'StatusIdEnum'" :title="'状态'" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.isTimeSend" clearable placeholder="定时发送" style="width: 200px">
              <el-option v-for="item in booleanOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.isSend" clearable placeholder="发送状态" style="width: 200px">
              <el-option v-for="item in booleanOptions" :key="item.value" :label="item.sendLabel" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'msg:save'" type="primary" @click="openFormModal()">新增消息</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="标题" min-width="180" prop="msgTitle" show-overflow-tooltip />
      <el-table-column label="类型" min-width="100">
        <template #default="scope">
          <el-tag effect="plain" :type="scope.row.msgType === 1 ? 'primary' : 'info'">{{ getMsgTypeLabel(scope.row.msgType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="260" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.msgText || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="90">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column label="定时" min-width="100">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isTimeSend)">{{ getBooleanLabel(scope.row.isTimeSend) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送" min-width="90">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isSend)">{{ getSendStatusLabel(scope.row.isSend) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶" min-width="90">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isTop)">{{ getBooleanLabel(scope.row.isTop) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" min-width="160" prop="sendTime" />
      <el-table-column label="更新时间" min-width="160" prop="gmtModified" />
      <el-table-column label="备注" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.remark || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :width="280" fixed="right" label="操作">
        <template #default="scope">
          <el-button v-permission="'msg:edit'" text type="primary" @click="openFormModal(scope.row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'msg:edit'" text type="success" @click="openDispatchDialog(scope.row)">投放</el-button>
          <el-divider direction="vertical" />
          <el-button text type="info" @click="openEffectDrawer(scope.row)">效果</el-button>
          <el-divider direction="vertical" />
          <el-dropdown>
            <el-button text type="primary">
              More
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-button v-if="scope.row.statusId === 0" v-permission="'msg:edit'" text type="primary" @click="handleStatus(scope.row)">启用</el-button>
                  <el-button v-if="scope.row.statusId === 1" v-permission="'msg:edit'" text type="primary" @click="handleStatus(scope.row)">停用</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button v-permission="'msg:delete'" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <msg-form ref="formRef" @refresh="handlePage" />

    <el-dialog v-model="dispatchDialog.visible" title="消息投放" width="680px" destroy-on-close>
      <el-form ref="dispatchFormRef" :model="dispatchDialog.form" :rules="dispatchRules" label-width="100px">
        <el-form-item label="消息">
          <div class="dispatch-title">{{ dispatchDialog.row?.msgTitle || '-' }}</div>
        </el-form-item>
        <el-form-item label="用户ID" prop="userIds">
          <el-input
            v-model="dispatchDialog.form.userIds"
            type="textarea"
            :rows="4"
            placeholder="支持逗号、空格或换行分隔多个用户ID"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="mobiles">
          <el-input
            v-model="dispatchDialog.form.mobiles"
            type="textarea"
            :rows="4"
            placeholder="支持逗号、空格或换行分隔多个手机号"
          />
        </el-form-item>
        <el-alert type="info" :closable="false" show-icon title="投放后会真实写入 msg_user 记录。Android 刷新消息页或角标后，应能消费到未读变化。" />
      </el-form>
      <template #footer>
        <el-button @click="closeDispatchDialog()">取消</el-button>
        <el-button :loading="dispatchDialog.loading" type="primary" @click="submitDispatch()">确认投放</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="effectDrawer.visible" :title="effectDrawer.row ? `投放效果 · ${effectDrawer.row.msgTitle}` : '投放效果'" size="760px">
      <div v-loading="effectDrawer.loading" class="effect-panel">
        <div class="effect-summary">
          <el-card shadow="never">
            <div class="effect-card-label">有效投放</div>
            <div class="effect-card-value">{{ effectDrawer.summary.activeDeliveryCount ?? 0 }}</div>
          </el-card>
          <el-card shadow="never">
            <div class="effect-card-label">未读</div>
            <div class="effect-card-value">{{ effectDrawer.summary.unreadCount ?? 0 }}</div>
          </el-card>
          <el-card shadow="never">
            <div class="effect-card-label">已读</div>
            <div class="effect-card-value">{{ effectDrawer.summary.readCount ?? 0 }}</div>
          </el-card>
          <el-card shadow="never">
            <div class="effect-card-label">失效投放</div>
            <div class="effect-card-value">{{ effectDrawer.summary.inactiveDeliveryCount ?? 0 }}</div>
          </el-card>
        </div>

        <el-alert :closable="false" type="info" show-icon :title="effectDrawer.summary.effectHint || '当前还没有形成可验证的投放证据。'" />

        <el-card shadow="never" class="effect-verification-card">
          <template #header>
            <div class="effect-card-header">联调验收提示</div>
          </template>
          <div class="effect-verification-grid">
            <div class="effect-verification-item">
              <div class="effect-verification-label">读达率</div>
              <div class="effect-verification-value">{{ formatReadRate(effectDrawer.summary) }}</div>
            </div>
            <div class="effect-verification-item">
              <div class="effect-verification-label">Android 侧预期</div>
              <div class="effect-verification-text">{{ buildAndroidExpectation(effectDrawer.summary) }}</div>
            </div>
            <div class="effect-verification-item">
              <div class="effect-verification-label">建议取证动作</div>
              <div class="effect-verification-text">1. 先记录投放前未读数 2. 执行投放 3. Android 下拉刷新消息页/返回首页观察角标 4. 补录屏与接口摘要。</div>
            </div>
          </div>
        </el-card>

        <el-descriptions :column="2" border class="effect-meta">
          <el-descriptions-item label="最近投放">{{ effectDrawer.summary.latestDeliveryTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最近消费">{{ effectDrawer.summary.latestConsumeTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="effect-toolbar">
          <el-input v-model="effectDrawer.query.mobile" placeholder="按手机号筛选" clearable style="width: 220px" @keyup.enter="loadEffectDeliveries()" />
          <el-select v-model="effectDrawer.query.isRead" clearable placeholder="阅读状态" style="width: 160px" @change="loadEffectDeliveries()">
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
          <el-button @click="loadEffectDeliveries()">刷新</el-button>
        </div>

        <el-table v-loading="effectDrawer.recordsLoading" :data="effectDrawer.records.list" row-key="id">
          <el-table-column label="投放记录ID" min-width="140" prop="id" />
          <el-table-column label="用户ID" min-width="140" prop="userId" />
          <el-table-column label="手机号" min-width="150" prop="mobile" />
          <el-table-column label="阅读状态" min-width="100">
            <template #default="scope">
              <el-tag effect="plain" :type="scope.row.isRead === 1 ? 'success' : 'warning'">{{ scope.row.isRead === 1 ? '已读' : '未读' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="scope">
              <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
            </template>
          </el-table-column>
          <el-table-column label="投放时间" min-width="170" prop="gmtCreate" />
          <el-table-column label="更新时间" min-width="170" prop="gmtModified" />
        </el-table>

        <pagination
          v-model:current-page="effectDrawer.records.pageCurrent"
          v-model:page-size="effectDrawer.records.pageSize"
          :total="effectDrawer.records.totalCount"
          @pagination="loadEffectDeliveries"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumSelect from '@/components/Enum/Select/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'
  import MsgForm from './MsgForm.vue'

  const msgTypeOptions = [
    { label: '系统消息', value: 1 },
    { label: '其他消息', value: 2 }
  ]

  const booleanOptions = [
    { label: '是', sendLabel: '已发送', value: 1 },
    { label: '否', sendLabel: '待发送', value: 0 }
  ]

  const getMsgTypeLabel = (value) => {
    const target = msgTypeOptions.find((item) => item.value === value)
    return target ? target.label : '未知类型'
  }

  const getBooleanLabel = (value) => {
    return value === 1 ? '是' : '否'
  }

  const getSendStatusLabel = (value) => {
    return value === 1 ? '已发送' : '待发送'
  }

  const getBooleanTagType = (value) => {
    return value === 1 ? 'success' : 'info'
  }

  const formRef = ref()
  const dispatchFormRef = ref()

  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: usersApi.msgPage,
    delete: usersApi.msgDelete,
    status: usersApi.msgEdit
  })

  const dispatchDialog = reactive({
    visible: false,
    loading: false,
    row: null,
    form: {
      userIds: '',
      mobiles: ''
    }
  })

  const dispatchRules = {
    userIds: [
      {
        validator: (_, value, callback) => {
          if (!value && !dispatchDialog.form.mobiles) {
            callback(new Error('请填写用户ID或手机号'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    mobiles: [
      {
        validator: (_, value, callback) => {
          if (!value && !dispatchDialog.form.userIds) {
            callback(new Error('请填写用户ID或手机号'))
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  }

  const effectDrawer = reactive({
    visible: false,
    loading: false,
    recordsLoading: false,
    row: null,
    summary: {},
    query: {
      mobile: '',
      isRead: undefined
    },
    records: {
      list: [],
      pageCurrent: 1,
      pageSize: 10,
      totalCount: 0
    }
  })

  const openDispatchDialog = (row) => {
    dispatchDialog.row = row
    dispatchDialog.form.userIds = ''
    dispatchDialog.form.mobiles = ''
    dispatchDialog.visible = true
  }

  const closeDispatchDialog = () => {
    dispatchDialog.visible = false
    dispatchDialog.loading = false
    dispatchDialog.row = null
    dispatchDialog.form.userIds = ''
    dispatchDialog.form.mobiles = ''
  }

  const submitDispatch = async () => {
    const valid = await dispatchFormRef.value.validate().catch(() => false)
    if (!valid || !dispatchDialog.row) return
    dispatchDialog.loading = true
    try {
      const res = await usersApi.msgDispatch({
        msgId: dispatchDialog.row.id,
        userIds: dispatchDialog.form.userIds,
        mobiles: dispatchDialog.form.mobiles
      })
      ElMessage.success(res || '投放成功')
      closeDispatchDialog()
      handlePage()
      if (effectDrawer.visible && effectDrawer.row?.id === dispatchDialog.row.id) {
        await refreshEffectDrawer(dispatchDialog.row)
      }
    } finally {
      dispatchDialog.loading = false
    }
  }

  const openEffectDrawer = async (row) => {
    effectDrawer.row = row
    effectDrawer.visible = true
    effectDrawer.records.pageCurrent = 1
    effectDrawer.query.mobile = ''
    effectDrawer.query.isRead = undefined
    await refreshEffectDrawer(row)
  }

  const refreshEffectDrawer = async (row) => {
    if (!row) return
    effectDrawer.loading = true
    try {
      effectDrawer.summary = await usersApi.msgEffect({ id: row.id })
      await loadEffectDeliveries()
    } finally {
      effectDrawer.loading = false
    }
  }

  const loadEffectDeliveries = async () => {
    if (!effectDrawer.row) return
    effectDrawer.recordsLoading = true
    try {
      const res = await usersApi.msgUserPage(
        {
          msgId: effectDrawer.row.id,
          mobile: effectDrawer.query.mobile,
          isRead: effectDrawer.query.isRead
        },
        effectDrawer.records.pageCurrent,
        effectDrawer.records.pageSize
      )
      effectDrawer.records.list = res.list || []
      effectDrawer.records.totalCount = res.totalCount || 0
      effectDrawer.records.pageCurrent = res.pageCurrent || effectDrawer.records.pageCurrent
      effectDrawer.records.pageSize = res.pageSize || effectDrawer.records.pageSize
    } finally {
      effectDrawer.recordsLoading = false
    }
  }

  const formatReadRate = (summary) => {
    const active = Number(summary?.activeDeliveryCount || 0)
    if (active <= 0) return '暂无数据'
    const read = Number(summary?.readCount || 0)
    return `${((read / active) * 100).toFixed(1)}%`
  }

  const buildAndroidExpectation = (summary) => {
    const unread = Number(summary?.unreadCount || 0)
    if (unread > 0) {
      return `当前仍有 ${unread} 条未读，Android 端角标与消息列表应能看到对应未读变化。`
    }
    const active = Number(summary?.activeDeliveryCount || 0)
    if (active > 0) {
      return '当前有效投放已全部读完，Android 端角标应回落到 0 或按剩余未读总数展示。'
    }
    return '当前尚未形成有效投放，Android 端未读数不应因该消息产生变化。'
  }
</script>

<style scoped>
  .dispatch-title {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .effect-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .effect-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .effect-card-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
  }

  .effect-card-value {
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .effect-meta {
    margin-top: 4px;
  }

  .effect-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .effect-verification-card {
    border: 1px solid var(--el-border-color-lighter);
  }

  .effect-card-header {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .effect-verification-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .effect-verification-item {
    min-height: 92px;
    padding: 12px;
    border-radius: 12px;
    background: var(--el-fill-color-light);
  }

  .effect-verification-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .effect-verification-value {
    font-size: 24px;
    line-height: 1.1;
    font-weight: 700;
    color: var(--el-color-primary);
  }

  .effect-verification-text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }
</style>
