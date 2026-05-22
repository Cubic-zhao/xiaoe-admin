<template>
  <el-dialog v-model="visible" :title="mode === 'approve' ? '审核通过' : '审核驳回'" width="480px">
    <el-form :model="form" label-width="90px">
      <el-form-item label="用户ID">
        <el-input v-model="form.userId" disabled />
      </el-form-item>
      <el-form-item label="原因">
        <el-input v-model="form.reason" type="textarea" maxlength="300" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button :type="mode === 'approve' ? 'primary' : 'danger'" :loading="saving" @click="submit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { usersApi } from '@/api/users'

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const saving = ref(false)
  const mode = ref('approve')
  const form = reactive({ userId: null, reason: '' })

  const onOpen = (nextMode, row) => {
    mode.value = nextMode
    form.userId = row.userId
    form.reason = ''
    visible.value = true
  }

  const submit = async () => {
    if (mode.value === 'reject' && form.reason.trim().length < 10) {
      ElMessage.error('驳回原因不少于10个字')
      return
    }
    saving.value = true
    try {
      if (mode.value === 'approve') {
        await usersApi.tutorQualificationApprove(form)
      } else {
        await usersApi.tutorQualificationReject(form)
      }
      ElMessage.success('操作成功')
      visible.value = false
      emit('refresh')
    } finally {
      saving.value = false
    }
  }

  defineExpose({ onOpen })
</script>
