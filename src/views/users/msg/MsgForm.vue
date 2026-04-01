<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? 'Edit Message' : 'Add Message'" width="720px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="90px" @submit.prevent>
      <el-form-item label="Type" prop="msgType">
        <el-radio-group v-model="formModel.msgType">
          <el-radio :value="1">System</el-radio>
          <el-radio :value="2">Other</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="form-group" label="Title" prop="msgTitle">
        <el-input v-model="formModel.msgTitle" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="Status" prop="statusId">
        <enum-radio v-model="formModel.statusId" :enum-name="'StatusIdEnum'"></enum-radio>
      </el-form-item>
      <el-form-item label="Sort" prop="sort">
        <el-input-number v-model="formModel.sort" :min="0" />
      </el-form-item>
      <el-form-item label="Scheduled" prop="isTimeSend">
        <el-radio-group v-model="formModel.isTimeSend">
          <el-radio :value="1">Yes</el-radio>
          <el-radio :value="0">No</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formModel.isTimeSend === 1" label="Send Time" prop="sendTime">
        <el-date-picker v-model="formModel.sendTime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="Pick send time" />
      </el-form-item>
      <el-form-item label="Sent" prop="isSend">
        <el-radio-group v-model="formModel.isSend">
          <el-radio :value="1">Yes</el-radio>
          <el-radio :value="0">No</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Pinned" prop="isTop">
        <el-radio-group v-model="formModel.isTop">
          <el-radio :value="1">Yes</el-radio>
          <el-radio :value="0">No</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="form-group" label="Content" prop="msgText">
        <el-input v-model="formModel.msgText" maxlength="2000" show-word-limit type="textarea" :rows="6" />
      </el-form-item>
      <el-form-item class="form-group" label="Remark" prop="remark">
        <el-input v-model="formModel.remark" maxlength="255" show-word-limit type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">Cancel</el-button>
        <el-button type="primary" @click="onSubmit()">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ElMessage } from 'element-plus'
  import { reactive, ref, watch } from 'vue'
  import { usersApi } from '@/api/users'
  import EnumRadio from '@/components/Enum/Radio/index.vue'

  const formRef = ref()
  const rules = {
    msgType: [{ required: true, message: 'Required', trigger: 'change' }],
    msgTitle: [{ required: true, message: 'Required', trigger: 'blur' }],
    statusId: [{ required: true, message: 'Required', trigger: 'change' }],
    msgText: [{ required: true, message: 'Required', trigger: 'blur' }],
    sendTime: [
      {
        validator: (_, value, callback) => {
          if (formModel.isTimeSend === 1 && !value) {
            callback(new Error('Pick send time'))
            return
          }
          callback()
        },
        trigger: 'change'
      }
    ]
  }

  const emit = defineEmits(['refresh'])
  const visible = ref(false)
  const loading = ref(false)
  const formDefault = {
    id: undefined,
    statusId: 1,
    sort: 1,
    msgType: 1,
    msgTitle: '',
    msgText: '',
    isTimeSend: 0,
    sendTime: '',
    isSend: 0,
    isTop: 0,
    remark: ''
  }
  const formModel = reactive({ ...formDefault })

  watch(
    () => formModel.isTimeSend,
    (value) => {
      if (value !== 1) {
        formModel.sendTime = ''
      }
    }
  )

  const onSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return
    if (loading.value === true) {
      ElMessage.warning('Processing...')
      return
    }

    const payload = {
      ...formModel,
      sendTime: formModel.isTimeSend === 1 ? formModel.sendTime : undefined
    }

    loading.value = true
    try {
      if (formModel.id) {
        await usersApi.msgEdit(payload)
        ElMessage.success('Updated')
      } else {
        await usersApi.msgSave(payload)
        ElMessage.success('Created')
      }
      emit('refresh')
      onClose()
    } finally {
      loading.value = false
    }
  }

  const onOpen = async (item) => {
    Object.assign(formModel, formDefault)
    if (item) {
      const res = await usersApi.msgView({ id: item.id })
      Object.assign(formModel, { ...formDefault, ...res })
    }
    visible.value = true
  }
  defineExpose({ onOpen })

  const onClose = () => {
    Object.assign(formModel, formDefault)
    visible.value = false
  }
</script>
