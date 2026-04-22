export const RELEASE_GATE_TEMPLATE = {
  graySteps: '',
  monitorScreenshots: '',
  rollbackRecord: '',
  approver: '',
  updatedAt: ''
}

export const validateReleaseGate = (model = RELEASE_GATE_TEMPLATE) => {
  const errors = []
  if (!model.graySteps || !String(model.graySteps).trim()) errors.push('请填写灰度步骤')
  if (!model.monitorScreenshots || !String(model.monitorScreenshots).trim()) errors.push('请填写监控截图链接')
  if (!model.rollbackRecord || !String(model.rollbackRecord).trim()) errors.push('请填写回滚记录')
  if (!model.approver || !String(model.approver).trim()) errors.push('请填写签核人')

  return {
    valid: errors.length === 0,
    errors
  }
}
