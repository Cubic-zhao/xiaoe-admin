<template>
  <el-dialog :model-value="visible" title="回复反馈" width="640px" destroy-on-close @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="90px" @submit.prevent>
      <el-form-item label="工单">
        <span>#{{ row?.id || '-' }} · {{ row?.category || '-' }}</span>
      </el-form-item>
      <el-form-item label="用户内容">
        <div class="content-box">{{ row?.content || '-' }}</div>
      </el-form-item>
      <el-form-item label="回复" prop="replyContent">
        <el-input v-model="formModel.replyContent" maxlength="1000" show-word-limit type="textarea" :rows="6" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onClose()">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onSubmit()">确认回复</el-button>
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
  const row = ref(null)
  const formModel = reactive({
    replyContent: ''
  })
  const rules = {
    replyContent: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
  }

  const onOpen = (item) => {
    row.value = item
    formModel.replyContent = ''
    visible.value = true
  }

  const onClose = () => {
    row.value = null
    formModel.replyContent = ''
    visible.value = false
  }

  const onSubmit = async () => {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid || !row.value) return
    loading.value = true
    try {
      await usersApi.feedbackReply({
        id: row.value.id,
        replyContent: formModel.replyContent
      })
      ElMessage.success('已回复反馈')
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  defineExpose({ onOpen })
</script>

<style scoped>
  .content-box {
    width: 100%;
    min-height: 72px;
    padding: 10px 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
    white-space: pre-wrap;
  }
</style>
