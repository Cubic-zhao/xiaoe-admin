<template>
  <el-dialog
    :append-to-body="true"
    :destroy-on-close="true"
    :model-value="visible"
    :title="dialogTitle"
    width="860px"
    center
    align-center
    @close="onClose"
  >
    <div class="page_head" style="text-align: left">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item label="Role Name">
            <el-input v-model="query.roleName" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">Search</el-button>
            <el-button @click="resetQuery()">Reset</el-button>
            <el-button @click="clearAllRoles">Clear All</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <el-table ref="tableRef" v-loading="page.loading" :data="page.list" row-key="id" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :width="50" />
      <el-table-column label="Role Name" prop="roleName" />
      <el-table-column label="Remark" prop="remark" show-overflow-tooltip />
      <el-table-column label="Selected" width="100">
        <template #default="scope">
          <el-tag v-if="selectedRoleIds.includes(scope.row.id)" type="success" effect="plain">Yes</el-tag>
          <span v-else class="table-secondary">No</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-info">Selected {{ selectedRoleIds.length }} roles</span>
        <span class="handle_bar">
          <el-button @click="onClose">Cancel</el-button>
          <el-button :loading="saving" type="primary" @click="onSubmit">Confirm</el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { systemApi } from '@/api/system'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'

  const emit = defineEmits(['refresh', 'close'])

  const tableRef = ref()
  const visible = ref(false)
  const saving = ref(false)
  const userId = ref()
  const userLabel = ref('')
  const selectedRoleIds = ref([])

  const dialogTitle = computed(() => (userLabel.value ? `Assign Roles - ${userLabel.value}` : 'Assign Roles'))

  const { page, handlePage, query, handleQuery, resetQuery } = useTable({
    page: systemApi.sysRolePage
  })

  const normalizeIds = (ids) => {
    return Array.from(
      new Set(
        ids
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item))
      )
    )
  }

  const syncSelection = async () => {
    if (!visible.value || !tableRef.value) {
      return
    }
    await nextTick()
    tableRef.value.clearSelection()
    page.list.forEach((item) => {
      if (selectedRoleIds.value.includes(item.id)) {
        tableRef.value.toggleRowSelection(item, true)
      }
    })
  }

  watch(
    () => page.list,
    async () => {
      await syncSelection()
    }
  )

  const handleSelectionChange = (selection) => {
    const pageIds = page.list.map((item) => item.id)
    const reservedIds = selectedRoleIds.value.filter((id) => !pageIds.includes(id))
    const currentSelectionIds = selection.map((item) => item.id)
    selectedRoleIds.value = normalizeIds(reservedIds.concat(currentSelectionIds))
  }

  const clearAllRoles = () => {
    selectedRoleIds.value = []
    tableRef.value?.clearSelection()
    ElMessage.success('Role selections cleared')
  }

  const onSubmit = async () => {
    if (!userId.value || saving.value) {
      return
    }

    saving.value = true
    try {
      await systemApi.sysRoleUserSave({
        userId: userId.value,
        roleIdList: selectedRoleIds.value
      })
      ElMessage.success('User roles updated')
      emit('refresh')
      onClose()
    } finally {
      saving.value = false
    }
  }

  const onOpen = async (item) => {
    userId.value = item?.id
    userLabel.value = item?.realName || item?.mobile || String(item?.id || '')
    visible.value = true
    selectedRoleIds.value = normalizeIds(await systemApi.sysRoleUserList({ userId: userId.value }))
    page.pageCurrent = 1
    if (page.pageSize < 100) {
      page.pageSize = 100
    }
    await handlePage()
    await syncSelection()
  }

  const onClose = () => {
    visible.value = false
    saving.value = false
    selectedRoleIds.value = []
    userId.value = undefined
    userLabel.value = ''
    tableRef.value?.clearSelection()
    emit('close')
  }

  defineExpose({ onOpen })
</script>

<style lang="scss" scoped>
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .footer-info {
    color: #909399;
    font-size: 12px;
  }

  .table-secondary {
    color: #909399;
    font-size: 12px;
  }
</style>
