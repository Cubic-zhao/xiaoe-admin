<template>
  <el-alert
    v-if="props.configType === '2'"
    title="Teacher 移动端策略：交付（deliver）/下线（offline）"
    type="info"
    :closable="false"
    style="margin-bottom: 12px"
  />
  <el-card v-if="props.configType === '2'" shadow="never" style="margin-bottom: 12px">
    <el-form label-width="140px">
      <el-form-item label="Teacher 交付策略">
        <el-radio-group v-model="teacherStrategy">
          <el-radio label="deliver">交付</el-radio>
          <el-radio label="offline">下线</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveTeacherStrategy">保存策略</el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-table :data="props.list">
    <el-table-column label="配置名称" prop="configName" min-width="30">
      <template #default="scope">
        <span>{{ scope.row.configName }}&nbsp;</span>
        <el-tooltip :content="scope.row.configKey" placement="right-start" effect="light">
          <el-icon>
            <InfoFilled />
          </el-icon>
        </el-tooltip>
      </template>
    </el-table-column>
    <el-table-column label="参数">
      <template #default="scope">
        <span v-if="(scope.row.contentType === 1 || scope.row.contentType === 2) && scope.row.configShow">{{ scope.row.configValue }}</span>
        <el-button v-if="(scope.row.contentType === 1 || scope.row.contentType === 2) && !scope.row.configShow" link type="primary" @click="handleView(scope.row)">【查看详情】</el-button>
        <img v-if="scope.row.contentType === 3" :alt="scope.row.configName" :src="scope.row.configValue" />
        <span v-if="scope.row.contentType === 4">{{ scope.row.configValue == 1 ? '开启' : '关闭' }}</span>
        <enum-view v-if="scope.row.configKey === 'vodPlatform'" :enum-name="'VodPlatformEnum'" :enum-value="scope.row.configValue" />
        <enum-view v-if="scope.row.configKey === 'livePlatform'" :enum-name="'LivePlatformEnum'" :enum-value="scope.row.configValue" />
        <enum-view v-if="scope.row.configKey === 'storagePlatform'" :enum-name="'StoragePlatformEnum'" :enum-value="scope.row.configValue" />
        <enum-view v-if="scope.row.configKey === 'smsPlatform'" :enum-name="'SmsPlatformEnum'" :enum-value="scope.row.configValue" />
        <br />
        <span style="color: #999; font-size: 13px">{{ scope.row.remark }}</span>
      </template>
    </el-table-column>
    <el-table-column v-permission="'sys:config:edit'" label="操作" width="220">
      <template #default="scope">
        <el-switch
          v-if="scope.row.contentType === 4"
          v-model="scope.row.configValue"
          active-color="#13ce66"
          active-text="开启"
          active-value="1"
          inactive-color="#ff4949"
          inactive-text="关闭"
          inactive-value="0"
          @change="handleSwitch(scope.row)"
        />
        <el-button v-else text type="primary" @click="openFormModal(scope.row)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
  <config-form ref="formRef" @refresh="handleList"></config-form>
  <form-view ref="viewRef"></form-view>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import ConfigForm from './ConfigForm.vue'
  import FormView from './View.vue'
  import { systemApi } from '@/api/system.js'
  import { ElMessage } from 'element-plus'
  import EnumView from '@/components/Enum/View/index.vue'

  const emit = defineEmits(['refresh'])
  const handleList = () => {
    emit('refresh')
  }

  const teacherStrategy = ref('deliver')
  const teacherStrategyConfig = computed(() => props.list?.find((item) => item.configKey === 'mobileTeacherStrategy'))

  watch(
    () => teacherStrategyConfig.value,
    (item) => {
      if (item?.configValue) {
        teacherStrategy.value = item.configValue
      }
    },
    { immediate: true }
  )

  const saveTeacherStrategy = async () => {
    if (!teacherStrategyConfig.value) {
      ElMessage.warning('未找到 mobileTeacherStrategy 配置项，请先由后端初始化')
      return
    }
    await systemApi.sysConfigEdit({
      id: teacherStrategyConfig.value.id,
      configKey: 'mobileTeacherStrategy',
      configValue: teacherStrategy.value
    })
    ElMessage.success('Teacher 策略已保存')
    emit('refresh')
  }

  // 查看
  const viewRef = ref()
  const handleView = (item) => {
    viewRef.value.onOpen(item)
  }

  const handleSwitch = (row) => {
    const formModel = {
      id: row.id,
      configKey: row.configKey,
      configValue: row.configValue
    }
    systemApi.sysConfigEdit(formModel)
  }

  // 添加/修改
  const formRef = ref()
  const openFormModal = (item) => {
    formRef.value.onOpen(item)
  }

  const props = defineProps({
    list: { type: Array, default: null },
    configType: { type: String, default: '' }
  })
</script>
<style lang="scss" scoped>
  img {
    height: 50px;
    width: auto;
  }

</style>
