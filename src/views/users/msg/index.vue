<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.msgTitle" placeholder="Message title" clearable />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.msgType" clearable placeholder="Message type" style="width: 200px">
              <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <enum-select v-model="query.statusId" :enum-name="'StatusIdEnum'" :title="'Status'" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.isTimeSend" clearable placeholder="Schedule" style="width: 200px">
              <el-option v-for="item in booleanOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select v-model="query.isSend" clearable placeholder="Send status" style="width: 200px">
              <el-option v-for="item in booleanOptions" :key="item.value" :label="item.sendLabel" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">Search</el-button>
            <el-button @click="resetQuery()">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'msg:save'" type="primary" @click="openFormModal()">Add Message</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="Title" min-width="180" prop="msgTitle" show-overflow-tooltip />
      <el-table-column label="Type" min-width="100">
        <template #default="scope">
          <el-tag effect="plain" :type="scope.row.msgType === 1 ? 'primary' : 'info'">{{ getMsgTypeLabel(scope.row.msgType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Content" min-width="260" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.msgText || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Status" min-width="90">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column label="Scheduled" min-width="100">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isTimeSend)">{{ getBooleanLabel(scope.row.isTimeSend) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Sent" min-width="90">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isSend)">{{ getSendStatusLabel(scope.row.isSend) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Pinned" min-width="90">
        <template #default="scope">
          <el-tag effect="plain" :type="getBooleanTagType(scope.row.isTop)">{{ getBooleanLabel(scope.row.isTop) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Send Time" min-width="160" prop="sendTime" />
      <el-table-column label="Updated At" min-width="160" prop="gmtModified" />
      <el-table-column label="Remark" min-width="200" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.remark || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :width="210" fixed="right" label="Actions">
        <template #default="scope">
          <el-button v-permission="'msg:edit'" text type="primary" @click="openFormModal(scope.row)">Edit</el-button>
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
                  <el-button v-if="scope.row.statusId === 0" v-permission="'msg:edit'" text type="primary" @click="handleStatus(scope.row)">Enable</el-button>
                  <el-button v-if="scope.row.statusId === 1" v-permission="'msg:edit'" text type="primary" @click="handleStatus(scope.row)">Disable</el-button>
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-button v-permission="'msg:delete'" text type="primary" @click="handleDelete(scope.row)">Delete</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <msg-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { usersApi } from '@/api/users'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumSelect from '@/components/Enum/Select/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'
  import MsgForm from './MsgForm.vue'

  const msgTypeOptions = [
    { label: 'System', value: 1 },
    { label: 'Other', value: 2 }
  ]

  const booleanOptions = [
    { label: 'Yes', sendLabel: 'Sent', value: 1 },
    { label: 'No', sendLabel: 'Pending', value: 0 }
  ]

  const getMsgTypeLabel = (value) => {
    const target = msgTypeOptions.find((item) => item.value === value)
    return target ? target.label : 'Unknown'
  }

  const getBooleanLabel = (value) => {
    return value === 1 ? 'Yes' : 'No'
  }

  const getSendStatusLabel = (value) => {
    return value === 1 ? 'Sent' : 'Pending'
  }

  const getBooleanTagType = (value) => {
    return value === 1 ? 'success' : 'info'
  }

  const formRef = ref()
  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: usersApi.msgPage,
    delete: usersApi.msgDelete,
    status: usersApi.msgEdit
  })
</script>
