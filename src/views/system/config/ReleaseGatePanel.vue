<template>
  <el-card shadow="never" class="release-gate-card">
    <template #header>
      <div class="card-header">
        <span>发布门禁四件套</span>
      </div>
    </template>

    <el-form :model="model" label-width="120px">
      <el-form-item label="灰度步骤">
        <el-input v-model="model.graySteps" type="textarea" :rows="2" placeholder="填写灰度发布步骤" />
      </el-form-item>
      <el-form-item label="监控截图链接">
        <el-input v-model="model.monitorScreenshots" placeholder="监控大盘截图链接或附件地址" />
      </el-form-item>
      <el-form-item label="回滚记录">
        <el-input v-model="model.rollbackRecord" type="textarea" :rows="2" placeholder="填写回滚演练或回滚预案记录" />
      </el-form-item>
      <el-form-item label="签核人">
        <el-input v-model="model.approver" placeholder="填写签核责任人" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存门禁模板</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { RELEASE_GATE_TEMPLATE, validateReleaseGate } from '@/utils/releaseGateTemplate'

const model = reactive({ ...RELEASE_GATE_TEMPLATE })

const handleSave = () => {
  const gate = validateReleaseGate(model)
  if (!gate.valid) {
    ElMessage.error(gate.errors[0])
    return
  }
  model.updatedAt = new Date().toISOString()
  ElMessage.success('发布门禁模板已就绪，请在上线单中引用')
}
</script>

<style scoped>
.release-gate-card {
  margin-top: 16px;
}
.card-header {
  font-weight: 600;
}
</style>
