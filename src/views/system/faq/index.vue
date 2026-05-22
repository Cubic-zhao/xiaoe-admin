<template>
  <div class="app-container">
    <div class="page_head">
      <div class="search_bar clearfix">
        <el-form :model="query" inline label-width="70px">
          <el-form-item label="分类">
            <el-select v-model="query.category" clearable style="width: 150px">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="热门">
            <el-select v-model="query.hot" clearable style="width: 120px">
              <el-option label="热门" :value="1" />
              <el-option label="普通" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <enum-select v-model="query.statusId" :enum-name="'StatusIdEnum'" :title="'状态'" />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="query.keyword" clearable placeholder="问题或答案" @keyup.enter="handleQuery()" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery()">查询</el-button>
            <el-button @click="resetQuery()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="button_bar">
        <el-button v-permission="'system:faq:save'" type="primary" @click="formRef.onOpen()">新增FAQ</el-button>
      </div>
    </div>

    <el-table v-loading="page.loading" :data="page.list" row-key="id">
      <el-table-column label="分类" width="110">
        <template #default="scope">
          <el-tag effect="plain">{{ categoryLabel(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="问题" min-width="220" prop="question" show-overflow-tooltip />
      <el-table-column label="答案" min-width="320" prop="answer" show-overflow-tooltip />
      <el-table-column label="热门" width="90">
        <template #default="scope">
          <el-tag effect="plain" :type="scope.row.hot === 1 ? 'danger' : 'info'">{{ scope.row.hot === 1 ? '热门' : '普通' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="90" prop="sort" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <enum-view :enum-name="'StatusIdEnum'" :enum-value="scope.row.statusId" />
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="160" prop="gmtModified" />
      <el-table-column fixed="right" label="操作" width="180">
        <template #default="scope">
          <el-button v-permission="'system:faq:edit'" text type="primary" @click="formRef.onOpen(scope.row)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button v-permission="'system:faq:edit'" text type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-model:current-page="page.pageCurrent" v-model:page-size="page.pageSize" :total="page.totalCount" @pagination="handlePage" />
    <faq-form ref="formRef" @refresh="handlePage" />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { systemApi } from '@/api/system'
  import useTable from '@/utils/table'
  import Pagination from '@/components/Pagination/index.vue'
  import EnumSelect from '@/components/Enum/Select/index.vue'
  import EnumView from '@/components/Enum/View/index.vue'
  import FaqForm from './FaqForm.vue'

  const formRef = ref()
  const categoryOptions = [
    { label: '账号', value: 'ACCOUNT' },
    { label: '约课', value: 'BOOKING' },
    { label: '支付', value: 'PAYMENT' },
    { label: '老师', value: 'TEACHER' },
    { label: '学生', value: 'STUDENT' },
    { label: '其他', value: 'OTHER' }
  ]

  const { page, handlePage, query, handleQuery, resetQuery, handleDelete } = useTable({
    page: systemApi.faqPage,
    delete: systemApi.faqDelete
  })

  const categoryLabel = (value) => categoryOptions.find((item) => item.value === value)?.label || value || '-'
</script>
