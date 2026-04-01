<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.mobile" placeholder="Login account" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">Search</el-button>
            <el-button @click="resetQuery()">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-if="canSaveUser" type="primary" @click="openFormModal()">Add Account</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id" class="drag-table">
      <el-table-column label="Login Account" prop="mobile" />
      <el-table-column label="Display Name" prop="realName" />
      <el-table-column label="Roles" min-width="220">
        <template #default="scope">
          <el-tag v-for="(item, index) in scope.row.roleNameList" :key="index" class="role-tag">{{ item }}</el-tag>
          <span v-if="!scope.row.roleNameList || !scope.row.roleNameList.length" class="table-secondary">No roles</span>
        </template>
      </el-table-column>
      <el-table-column label="Remark" prop="remark" show-overflow-tooltip />
      <el-table-column label="Status" width="100">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="360" fixed="right">
        <template #default="scope">
          <el-button v-if="canEditUser" text type="primary" @click="openFormModal(scope.row)">Edit</el-button>

          <el-divider v-if="canEditUser && canSetUserRole" direction="vertical" />

          <el-button v-if="canSetUserRole" text type="primary" @click="openRoleModal(scope.row)">Assign Roles</el-button>

          <el-divider v-if="canManageMore" direction="vertical" />

          <el-dropdown v-if="canManageMore">
            <el-button text type="primary">
              More
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="canUpdatePassword" @click="openPasswordModal(scope.row)">
                  <span>Password</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="canEditUser" @click="handleStatus(scope.row)">
                  <span>{{ scope.row.statusId === 0 ? 'Enable' : 'Disable' }}</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="canDeleteUser" @click="handleDelete(scope.row)">
                  <span>Delete</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <user-form ref="formRef" @refresh="handlePage" />
    <password ref="passwordRef" @refresh="handlePage" />
    <role-set v-if="roleVisible" ref="roleRef" @close="handleRoleClose" @refresh="handleRoleRefresh" />
  </div>
</template>

<script setup>
  import { nextTick, ref } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { systemApi } from '@/api/system'
  import Pagination from '@/components/Pagination/index.vue'
  import useTable from '@/utils/table'
  import { hasPermission } from '@/utils/permission.js'
  import UserForm from './UserForm.vue'
  import Password from './Password.vue'
  import RoleSet from './RoleSet.vue'
  import EnumView from '@/components/Enum/View/index.vue'

  const canSaveUser = hasPermission('sys:user:save')
  const canEditUser = hasPermission('sys:user:edit')
  const canDeleteUser = hasPermission('sys:user:delete')
  const canSetUserRole = hasPermission('sys:user:role:set')
  const canUpdatePassword = hasPermission('sys:user:password')
  const canManageMore = canUpdatePassword || canEditUser || canDeleteUser

  const roleRef = ref()
  const roleVisible = ref(false)
  const openRoleModal = (item) => {
    roleVisible.value = true
    nextTick(() => {
      roleRef.value?.onOpen(item)
    })
  }
  const handleRoleClose = () => {
    roleVisible.value = false
  }
  const handleRoleRefresh = () => {
    handleRoleClose()
    handlePage()
  }

  const passwordRef = ref()
  const openPasswordModal = (item) => {
    passwordRef.value.onOpen(item)
  }

  const formRef = ref()
  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: systemApi.sysUserPage,
    delete: systemApi.sysUserDelete,
    status: systemApi.sysUserEdit,
    sort: systemApi.sysUserSort
  })
</script>

<style scoped>
  .role-tag {
    margin: 4px;
  }

  .table-secondary {
    color: #909399;
    font-size: 12px;
  }
</style>
