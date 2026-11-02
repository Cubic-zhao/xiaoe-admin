<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="80px">
          <el-form-item>
            <el-input v-model="query.roleName" placeholder="角色名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-if="canSaveRole" type="primary" @click="openFormModal()">新增角色</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="角色名称" prop="roleName" />
      <el-table-column label="备注" prop="remark" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="scope">
          <el-button v-if="canEditRole" text type="primary" @click="openFormModal(scope.row)">编辑</el-button>

          <el-divider v-if="canEditRole && canSetRoleMenu" direction="vertical" />

          <el-button v-if="canSetRoleMenu" text type="primary" @click="openMenuSet(scope.row)">分配菜单</el-button>

          <el-divider v-if="canManageMore" direction="vertical" />

          <el-dropdown v-if="canManageMore">
            <el-button text type="primary">
              更多
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="canEditRole" @click="handleStatus(scope.row)">
                  <span>{{ scope.row.statusId === 1 ? '禁用' : '启用' }}</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="canDeleteRole" @click="handleDelete(scope.row)">
                  <span>删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <role-form ref="formRef" @refresh="handlePage" />
    <menu-set v-if="menuVisible" ref="menuRef" @close="handleMenuClose" @refresh="handleMenuRefresh" />
  </div>
</template>

<script setup>
  import { nextTick, ref } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { systemApi } from '@/api/system'
  import useTable from '@/utils/table'
  import { hasPermission } from '@/utils/permission.js'
  import RoleForm from './RoleForm.vue'
  import MenuSet from './MenuSet.vue'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'

  const canSaveRole = hasPermission('sys:role:save')
  const canEditRole = hasPermission('sys:role:edit')
  const canDeleteRole = hasPermission('sys:role:delete')
  const canSetRoleMenu = hasPermission('sys:role:menu:set')
  const canManageMore = canEditRole || canDeleteRole

  const menuRef = ref()
  const menuVisible = ref(false)
  const openMenuSet = (item) => {
    menuVisible.value = true
    nextTick(() => {
      menuRef.value?.onOpen(item)
    })
  }
  const handleMenuClose = () => {
    menuVisible.value = false
  }
  const handleMenuRefresh = () => {
    handleMenuClose()
  }

  const formRef = ref()
  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete, handleStatus } = useTable({
    page: systemApi.sysRolePage,
    delete: systemApi.sysRoleDelete,
    status: systemApi.sysRoleEdit,
    sort: systemApi.sysRoleSort
  })
</script>
