<template>
  <section class="panel" aria-labelledby="stat-login-title">
    <div class="panel-head">
      <h2 id="stat-login-title">近 14 天注册与登录</h2>
    </div>
    <div v-if="error" class="panel-error" role="alert">
      <span>{{ error }}</span>
      <el-button link type="primary" @click="load">重新加载</el-button>
    </div>
    <div v-show="!error" v-loading="loading" class="chart-wrap">
      <div ref="chartRef" class="axis" role="img" :aria-label="chartLabel" />
    </div>
  </section>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { statApi } from '@/api/dashboard'

  const chartRef = ref()
  const loading = ref(true)
  const error = ref('')
  const chartData = ref({})
  let chart
  let resizeObserver
  let requestId = 0

  const sum = (list) => (Array.isArray(list) ? list.reduce((total, value) => total + Number(value || 0), 0) : 0)
  const chartLabel = computed(() => {
    const days = chartData.value.dateList || []
    if (!days.length) return '近 14 天登录人数与注册人数折线图'
    return `近 14 天（${days[0]} 至 ${days[days.length - 1]}）登录人数与注册人数折线图：登录合计 ${sum(chartData.value.loginList)} 人次，注册合计 ${sum(chartData.value.registerList)} 人`
  })

  async function load() {
    const current = ++requestId
    loading.value = true
    error.value = ''
    try {
      const data = (await statApi.login()) || {}
      if (current !== requestId) return
      chartData.value = data
      await nextTick()
      render(data)
    } catch (e) {
      if (current === requestId) error.value = e?.data?.msg || e?.response?.data?.msg || '注册与登录统计读取失败，请重新加载'
    } finally {
      if (current === requestId) loading.value = false
    }
  }

  function render(data) {
    if (!chartRef.value) return
    // 每次挂载都在当前容器上创建实例，卸载时销毁，避免切换页面后复用已移除容器上的旧实例
    chart = chart || echarts.init(chartRef.value)
    const axisLabel = { color: '#64748B' }
    chart.setOption({
      color: ['#2563EB', '#D97706'],
      tooltip: { trigger: 'axis' },
      legend: { data: ['登录人数', '注册人数'], top: 0, right: 0, icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#475569' } },
      grid: { top: 40, right: 16, bottom: 8, left: 8, containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: data.dateList || [], axisTick: { show: false }, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLabel },
      series: [
        { name: '登录人数', type: 'line', showSymbol: false, lineStyle: { width: 2.5 }, data: data.loginList || [] },
        { name: '注册人数', type: 'line', showSymbol: false, lineStyle: { width: 2.5 }, data: data.registerList || [] }
      ]
    })
    chart.resize()
  }

  onMounted(() => {
    resizeObserver = new ResizeObserver(() => chart?.resize())
    resizeObserver.observe(chartRef.value)
    load()
  })

  onBeforeUnmount(() => {
    requestId++
    resizeObserver?.disconnect()
    chart?.dispose()
    chart = undefined
  })

  defineExpose({ load })
</script>

<style lang="scss" scoped>
  .panel {
    min-width: 0;
    padding: 20px 24px;
    background: #fff;
    border: 1px solid var(--xe-ink-200);
    border-radius: var(--xe-radius-md);
  }

  .panel-head h2 {
    margin: 0;
    color: var(--xe-ink-900);
    font-size: 15px;
    font-weight: 700;
  }

  .chart-wrap {
    margin-top: 12px;
  }

  .axis {
    height: 360px;
  }

  .panel-error {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 120px;
    color: var(--xe-danger-700);
  }
</style>
