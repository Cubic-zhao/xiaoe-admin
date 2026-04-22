const MOBILE_OP_SCHEME = 'app://mobile-op'
const LEGACY_TARGET_SELF = 2

const TARGET_LABELS = {
  1: '外链',
  2: '课程',
  3: '讲师',
  4: '活动'
}

const ACTION_LABELS = {
  navigate: '页面跳转',
  webview: 'WebView',
  none: '无动作'
}

const toNumberOrFallback = (value, fallback) => {
  const next = Number(value)
  return Number.isNaN(next) ? fallback : next
}

const sanitizeText = (value) => String(value ?? '').trim()

export const decodeMobileOpsLink = (rawLink = '') => {
  const link = sanitizeText(rawLink)
  if (!link.startsWith(MOBILE_OP_SCHEME)) {
    return {
      encoded: false,
      targetType: 1,
      targetId: '',
      link,
      action: link ? 'navigate' : 'none'
    }
  }

  try {
    const url = new URL(link)
    return {
      encoded: true,
      targetType: toNumberOrFallback(url.searchParams.get('targetType'), 1),
      targetId: sanitizeText(url.searchParams.get('targetId')),
      link: sanitizeText(url.searchParams.get('link')),
      action: sanitizeText(url.searchParams.get('action')) || 'navigate'
    }
  } catch {
    return {
      encoded: false,
      targetType: 1,
      targetId: '',
      link,
      action: link ? 'navigate' : 'none'
    }
  }
}

export const encodeMobileOpsLink = (form = {}) => {
  const targetType = toNumberOrFallback(form.targetType, 1)
  const targetId = sanitizeText(form.targetId)
  const link = sanitizeText(form.link)
  const action = sanitizeText(form.action) || 'navigate'

  const params = new URLSearchParams()
  params.set('targetType', String(targetType))
  params.set('action', action)
  if (targetId) {
    params.set('targetId', targetId)
  }
  if (link) {
    params.set('link', link)
  }
  return `${MOBILE_OP_SCHEME}?${params.toString()}`
}

export const normalizeMobileOpsForm = (form = {}) => {
  const model = { ...form }
  const decoded = decodeMobileOpsLink(model.carouselUrl ?? model.navUrl ?? model.link ?? '')

  model.targetType = toNumberOrFallback(model.targetType ?? decoded.targetType, decoded.targetType)
  model.targetId = sanitizeText(model.targetId ?? decoded.targetId)
  model.link = sanitizeText(model.link ?? decoded.link)
  model.action = sanitizeText(model.action ?? decoded.action) || 'navigate'
  model.sort = toNumberOrFallback(model.sort, 1)
  model.status = toNumberOrFallback(model.status ?? model.statusId, 1)

  const encodedLink = encodeMobileOpsLink(model)
  model.carouselUrl = encodedLink
  model.navUrl = encodedLink
  model.carouselTarget = toNumberOrFallback(model.carouselTarget, LEGACY_TARGET_SELF)
  model.navTarget = toNumberOrFallback(model.navTarget, LEGACY_TARGET_SELF)

  return model
}

export const buildMobileOpsPayload = (form = {}, scene = 'carousel') => {
  const normalized = normalizeMobileOpsForm(form)
  if (scene === 'nav') {
    return {
      id: normalized.id,
      statusId: normalized.status,
      sort: normalized.sort,
      navTitle: normalized.navTitle,
      navUrl: normalized.navUrl,
      navTarget: normalized.navTarget
    }
  }

  return {
    id: normalized.id,
    statusId: normalized.status,
    sort: normalized.sort,
    carouselTitle: normalized.carouselTitle,
    carouselImg: normalized.carouselImg,
    carouselUrl: normalized.carouselUrl,
    carouselTarget: normalized.carouselTarget,
    beginTime: normalized.beginTime,
    endTime: normalized.endTime
  }
}

export const describeMobileOps = (rawLink = '') => {
  const decoded = decodeMobileOpsLink(rawLink)
  return {
    targetTypeLabel: TARGET_LABELS[toNumberOrFallback(decoded.targetType, 1)] || '未知',
    actionLabel: ACTION_LABELS[decoded.action] || decoded.action || '页面跳转',
    displayLink: decoded.link || '未配置',
    targetId: decoded.targetId || '-'
  }
}

export const validateMobileOpsForm = (form = {}) => {
  const errors = []
  const targetType = toNumberOrFallback(form.targetType, 0)
  const action = sanitizeText(form.action)
  const link = sanitizeText(form.link)
  const targetId = sanitizeText(form.targetId)

  if (!targetType) {
    errors.push('目标类型不能为空')
  }

  if (!action) {
    errors.push('动作类型不能为空')
  }

  if (action !== 'none' && targetType === 1 && !link) {
    errors.push('外链模式必须填写跳转链接')
  }

  if (action !== 'none' && [2, 3, 4].includes(targetType) && !targetId) {
    errors.push('课程、讲师、活动模式必须填写目标ID')
  }

  if (Number.isNaN(Number(form.sort))) {
    errors.push('排序必须为数字')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
