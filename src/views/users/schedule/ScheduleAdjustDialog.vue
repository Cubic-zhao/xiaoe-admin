<template>
  <el-dialog :model-value="visible" title="调整排课时间" width="520px" :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item label="当前时间">
        <span>{{ formatTime(current.startAt) }}</span>
      </el-form-item>
      <el-form-item label="新时间" prop="newStartAt">
        <el-date-picker v-model="form.newStartAt" type="datetime" value-format="x" style="width: 100%" />
      </el-form-item>
      <el-form-item label="原因" prop="reason">
        <el-input v-model="form.reason" type="textarea" :rows="3" maxlength="255" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose()">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit()">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { usersApi } from '@/api/users'

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const loading = ref(false)
  const formRef = ref()
  const current = reactive({})
  const form = reactive({
    id: undefined,
    newStartAt: '',
    reason: ''
  })
  const rules = {
    newStartAt: [{ required: true, message: '请选择新时间', trigger: 'change' }],
    reason: [{ required: true, message: '请输入原因', trigger: 'blur' }]
  }

  const onOpen = (row) => {
    Object.assign(current, row)
    form.id = row.id
    form.newStartAt = row.startAt ? String(row.startAt) : ''
    form.reason = ''
    visible.value = true
  }
  defineExpose({ onOpen })

  const onSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return
    loading.value = true
    try {
      await usersApi.scheduleAdjust({
        id: form.id,
        newStartAt: Number(form.newStartAt),
        reason: form.reason
      })
      ElMessage.success('操作成功')
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  const onClose = () => {
    Object.keys(current).forEach((key) => delete current[key])
    form.id = undefined
    form.newStartAt = ''
    form.reason = ''
    visible.value = false
  }

  const formatTime = (value) => (value ? new Date(value).toLocaleString() : '-')
</script>
