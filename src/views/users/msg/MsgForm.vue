<template>
  <el-dialog :append-to-body="true" :model-value="visible" :title="formModel.id ? '编辑消息' : '新增消息'" width="720px" center align-center :destroy-on-close="true" @close="onClose">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="90px" @submit.prevent>
      <el-form-item label="消息类型" prop="msgType">
        <el-radio-group v-model="formModel.msgType">
          <el-radio :value="1">系统消息</el-radio>
          <el-radio :value="2">其他消息</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="家教分类" prop="remark">
        <el-select v-model="formModel.remark" clearable placeholder="移动端消息分类" style="width: 100%">
          <el-option v-for="item in messageCategoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item class="form-group" label="标题" prop="msgTitle">
        <el-input v-model="formModel.msgTitle" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="状态" prop="statusId">
        <enum-radio v-model="formModel.statusId" :enum-name="'StatusIdEnum'"></enum-radio>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formModel.sort" :min="0" />
      </el-form-item>
      <el-form-item label="定时发送" prop="isTimeSend">
        <el-radio-group v-model="formModel.isTimeSend">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formModel.isTimeSend === 1" label="发送时间" prop="sendTime">
        <el-date-picker v-model="formModel.sendTime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="选择发送时间" />
      </el-form-item>
      <el-form-item label="已发送" prop="isSend">
        <el-radio-group v-model="formModel.isSend">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="置顶" prop="isTop">
        <el-radio-group v-model="formModel.isTop">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="form-group" label="内容" prop="msgText">
        <el-input v-model="formModel.msgText" maxlength="2000" show-word-limit type="textarea" :rows="6" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">取消</el-button>
        <el-button type="primary" @click="onSubmit()">确定</el-button>
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
  const messageCategoryOptions = [
    { label: '约课提醒', value: 'booking' },
    { label: '排课变更', value: 'schedule' },
    { label: '上课记录', value: 'lesson' },
    { label: '支付消息', value: 'payment' },
    { label: '系统消息', value: 'system' }
  ]
  const rules = {
    msgType: [{ required: true, message: '不能为空', trigger: 'change' }],
    msgTitle: [{ required: true, message: '不能为空', trigger: 'blur' }],
    statusId: [{ required: true, message: '不能为空', trigger: 'change' }],
    msgText: [{ required: true, message: '不能为空', trigger: 'blur' }],
    sendTime: [
      {
        validator: (_, value, callback) => {
          if (formModel.isTimeSend === 1 && !value) {
            callback(new Error('请选择发送时间'))
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
      ElMessage.warning('正在处理···')
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
        ElMessage.success('修改成功')
      } else {
        await usersApi.msgSave(payload)
        ElMessage.success('添加成功')
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
