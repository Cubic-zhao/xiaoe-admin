<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col v-if="hasPermission('stat:data')" :span="12">
        <stat-data />
      </el-col>
      <el-col :span="12">
        <el-card class="info">
          <template #header>家教服务工作台</template>
          <div class="info-body">
            <div class="info-content">
              <div>老师入驻：核对资料、处理资质审核与展示设置。</div>
              <div>课程预约：维护辅导课程、课时包与约课订单。</div>
              <div>教学跟进：查看排课、课后记录与师生学情。</div>
              <div>服务反馈：处理反馈工单、维护帮助中心。</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div v-if="hasPermission('stat:login')">
      <stat-login />
    </div>
  </div>
</template>
<script setup>
  import StatLogin from './StatLogin.vue'
  import StatData from './StatData.vue'
  import { hasPermission } from '@/utils/permission.js'
</script>
<style lang="scss" scoped>
  .info {
    padding: 15px;
    border-radius: 5px;
    font-size: 16px;
    .info-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .info-content {
      div {
        line-height: 30px;
      }
    }
  }
</style>
