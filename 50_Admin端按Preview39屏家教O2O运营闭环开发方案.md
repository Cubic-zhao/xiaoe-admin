<!-- markdownlint-disable MD013 MD024 MD033 -->
# 50. Admin 端按 Preview 39 屏家教 O2O 运营闭环开发方案

**文档版本**：v1.4  
**创建日期**：2026-05-14  
**最后更新**：2026-05-19（v1.5 — W6 Admin RBAC 与 T-ADM-01~05 L5 复验通过）  
**适用项目**：`D:/MyProject/Program/XiaoE/Xiaoe-education-release/xiaoe-education-admin`  
**配套文档**：Android 27 号屏级计划 + 后端 20 号家教 O2O 后端方案  
**目标**：让 admin 端具备运营 preview 39 屏所需的真实能力，做到“移动端用户路径可用，后台能配置、审核、处理、追踪、回滚”。

---

## 0. 文档定位

### 0.0 当前真实开发文档声明（2026-05-16）

自 2026-05-16 起，Admin 端以本文为家教 O2O 运营后台实施标准，并与以下两份文档共同构成本项目当前真实开发文档：

| 文档 | 权责 |
|---|---|
| Android 27 号 | 产品屏级路线、preview 39 屏、T-AND-06 约课主路径和移动端 L6 验收标准 |
| 后端 20 号 | mobile/admin/feign/callback 端点、表结构、状态机、Gateway、RBAC 与后端 L1-L7 门禁 |
| Admin 50 号（本文） | 后台菜单、页面、API 模块、权限按钮、运营动作、审计回放和 Android 可见联动 |

本文所有计划以 Android 27 号 §9.5 P3.5 W1-W6 为标准展开。Admin 页面只有在能通过后端 admin 端点改变真实业务状态，并让 Android 对应屏或路径看见变化时，才算达到本项目“正常运行、功能真实可用”的验收标准。

### 0.1 唯一目标

Admin 端不是单纯 CRUD 后台。本期 admin 必须支撑家教平台真实运营：

1. 能配置首页、讲师入口、课时包、FAQ、消息等移动端展示内容。
2. 能审核讲师资质并影响移动端教师身份。
3. 能处理约课订单、排课、上课记录、退款、提现、反馈等运营动作。
4. 能通过权限、审计、状态机阻止误操作。
5. 能在 L6 验收时证明：admin 操作会改变后端真实状态，并被 Android preview 路线看见。

### 0.2 当前真实基线

| 维度 | 现状 |
|---|---|
| 技术栈 | Vue 3.4 / Vite 5.2 / Pinia 2.1 / Element Plus 2.6 / Axios 1.7 |
| 请求 | `src/utils/request.js` 注入 `token` header，baseURL 为 `/gateway` |
| 路由 | 后端菜单驱动，`createNewRouter()` 从 `routerList` 动态装配 |
| 权限 | `v-permission` 使用后端权限 key |
| API 模块 | `src/api/{login,system,course,users,dashboard,upload}.js` |
| 已有页面 | 系统、课程、资源、学员、讲师、订单、提现、消息、配置、工作台 |
| 已有治理能力 | `mobileOpsFieldAdapter.js`、`releaseGateTemplate.js`、讲师策略配置片段 |
| 缺口 | 未见资质审核、课时包运营、约课排课运营、反馈工单、FAQ 管理、家教学情看板页面 |

### 0.3 设计边界

| 边界 | 说明 |
|---|---|
| 不改请求主链 | 继续走 `src/utils/request.js`，不在页面直接调 axios |
| 不硬编码菜单 | 新页面必须由后端 `sys_menu` seed 驱动 |
| 不新增 admin 包装体 | admin 只消费 `Result<T>` 的 `data` |
| 不重命名后端字段 | DTO 字段以后端 20 号方案为准 |
| 不做产品路线外页面 | 只做 preview 39 屏运营闭环所需页面 |
| 不引入新 npm 依赖 | 复用 Element Plus、ECharts、现有上传/预览组件 |

### 0.4 权威顺序与冲突裁决

Admin 开发出现口径冲突时，按以下顺序处理：

| 冲突类型 | 裁决顺序 | 处理要求 |
|---|---|---|
| 产品路线 / 页面是否需要 | Android 27 号 preview 39 屏 > 50 号运营能力总图 > 旧 Web 20/30 号 | 不新增 preview 路线外页面；旧 Web 计划只作历史参考 |
| 后端字段 / 状态机 | 后端 20 号 > 后端真实 Controller/DTO > Admin 页面草案 | 页面字段必须跟随后端真值，不在前端重新定义状态 |
| 菜单与权限 | 后端 `sys_menu` seed + 50 号权限设计 > 页面本地路由 | 不硬编码绕过动态路由和 `v-permission` |
| 请求方式 | `src/api/*.js` + `src/utils/request.js` 约定 > 组件局部实现 | 不在组件中直接调用 axios |
| 周计划 | Android 27 号 §9.5 > 后端 20 号 §2.1 > 本文 §8.6 | Admin 只承接后端已提供的真实动作 |
| 验收 | T-ADM-01~05 + Android 可见联动 > 页面 build 成功 | 页面能打开不等于完成 |

如 20 号后端端点与本文 API 表不一致，先修正本文 API 表和页面计划，再进入页面实现。

### 0.5 Admin 开发规范

| 维度 | 强制规范 | 失败判定 |
|---|---|---|
| 页面入口 | 新页面必须由后端菜单 seed 下发，经 `createNewRouter()` 装配 | 手写本地业务路由替代菜单 |
| 请求层 | 只在 `src/api/users.js`、`src/api/course.js`、`src/api/system.js` 等领域文件扩展方法 | 在 `views/**` 中直接写请求 URL |
| 请求包装 | 全部经 `src/utils/request.js` 的 `postRequest/getRequest/putRequest/deleteRequest` | 直接 axios 或绕过 token header |
| 权限按钮 | 所有审核、调整、取消、回复、投放、禁用动作必须绑定权限 key | 只有页面权限，无按钮权限 |
| 字段来源 | 表格、详情、表单枚举以后端 20 号 DTO / enum 为准 | 前端私自改字段名或另造状态值 |
| 表单计算 | 金额、课时、折扣、退款额前端只展示预估，提交后以后端返回为最终值 | 前端计算结果直接当业务真值 |
| 状态操作 | 资质审核、排课调整、取消约课、退款、关闭反馈必须二次确认并展示结果 | 静默改状态或无法回放 |
| 审计可见 | 高风险操作详情页必须能查看操作人、时间、前后状态、原因 | 后端写了日志但页面无入口 |
| 页面形态 | 采用现有查询表单 + action bar + 表格 + 分页 + 弹窗/抽屉模式 | 为单页引入新交互体系 |
| 下游复验 | 每个关键操作必须标明 Android 对应屏和验证字段 | 页面操作无法对应用户侧结果 |

### 0.6 Admin 边界红线

以下情况视为未按本文执行：

1. Admin 调 mobile 端点读取或修改业务数据。
2. 页面绕过 `src/api` 和 `src/utils/request.js` 直接请求后端。
3. 菜单、路由、按钮权限只写在前端，不写后端 seed。
4. 前端自行定义资质、约课、排课、退款、反馈状态。
5. 只做页面静态表格，不实现真实查询、操作、刷新、错误处理。
6. 操作成功后只弹提示，不重新读取后端真值。
7. 高风险动作没有确认、原因、审计或回放入口。
8. 页面验收只停在 `npm run build`，没有对应 T-ADM 或 Android 可见复验。
9. 为了页面好看新增与 Android 27 号路线无关的运营模块。

### 0.7 Admin 开工检查表

每个页面动代码前必须完成以下检查：

| 检查项 | 通过标准 |
|---|---|
| 对齐 Android | 找到 27 号对应 Screen、T-AND 路径和用户可见字段 |
| 对齐后端 | 找到 20 号对应 admin 端点、DTO、状态机、错误码 |
| 对齐菜单 | 确认页面 path、component、permission key、按钮 key、API seed |
| 对齐请求层 | 明确 API 函数放入哪个 `src/api/*.js`，使用何种 wrapper |
| 对齐页面模式 | 明确查询项、表格列、详情抽屉、表单弹窗、操作反馈 |
| 对齐验收 | 写出 T-ADM 编号、后端真值变化、Android 对应屏复验字段 |

---

## 1. Admin 运营能力总图

| Preview 路线 | 移动端功能 | Admin 必须具备 |
|---|---|---|
| HomeScreen | Banner、快捷入口、找老师、城市、学科 | 首页运营位、讲师策略、分类、城市配置 |
| TeacherList / TeacherDetail | 找老师、老师详情、资质标签 | 讲师资料、资质审核、排序、推荐权重 |
| CourseDetail / LessonPackageDetail | 课时包、上课方式、约课 CTA | 课程扩展配置、课时包管理、价格校验 |
| Booking / OrderDetail | 创建约课、支付、取消、退款 | 约课订单、支付对账、退款、取消审核 |
| LessonSchedule | 排课、改约、查看下节课 | 排课日历、人工改约、异常处理 |
| LessonRecord | 上课记录、作业、评分 | 上课记录查看、争议处理、附件核验 |
| StudentIntro / MyStudents / MyCourses | 学生资料、学情进度、双身份 | 学员扩展资料、师生关系、学情看板 |
| WalletCenter | 充值、提现、账单 | 提现审核、充值对账、账户流水 |
| MessageList | 约课提醒、学情通知、系统消息 | 消息模板、定向投放、效果观测 |
| Help / Feedback / ContactService | FAQ、反馈、客服 | FAQ 管理、反馈工单、客服配置 |

---

## 2. 信息架构与菜单设计

### 2.1 新增一级/二级菜单

| 一级 | 二级 | 路由 | 组件 | 权限前缀 |
|---|---|---|---|---|
| 家教运营 | 资质审核 | `/users/tutor/audit` | `/users/tutor/audit/index` | `user:tutor:audit` |
| 家教运营 | 讲师运营 | `/users/tutor/list` | `/users/tutor/list/index` | `user:tutor:list` |
| 家教运营 | 师生关系 | `/users/tutor/relation` | `/users/tutor/relation/index` | `user:tutor:relation` |
| 课程运营 | 课时包 | `/course/lesson-package` | `/course/lessonPackage/index` | `course:lessonPackage` |
| 交易运营 | 约课订单 | `/users/booking` | `/users/booking/index` | `user:booking` |
| 交易运营 | 排课日历 | `/users/schedule` | `/users/schedule/index` | `user:schedule` |
| 交易运营 | 上课记录 | `/users/lesson-record` | `/users/lessonRecord/index` | `user:lessonRecord` |
| 内容运营 | FAQ 管理 | `/system/faq` | `/system/faq/index` | `system:faq` |
| 内容运营 | 反馈工单 | `/users/feedback` | `/users/feedback/index` | `user:feedback` |

### 2.2 菜单 seed 要求

1. 每个页面 seed 菜单类型为页面节点。
2. 每个按钮操作 seed 为权限节点，绑定后端 admin API。
3. 资质审核、排课调整、退款、关闭工单必须有独立按钮权限。
4. 菜单路径与组件路径必须和 `createNewRouter()` 解析规则一致。
5. seed SQL 放入 `xiaoe-education-master/docs/sql/20260514_d13_admin_menu_permission_seed.sql`。

---

## 3. API 模块设计

沿用现有 6 个 API 文件，减少新抽象。

### 3.1 `src/api/users.js` 扩展

| 方法名 | 路径 | 说明 |
|---|---|---|
| `tutorQualificationPage` | POST `/user/admin/tutor/qualification/page` | 资质审核列表 |
| `tutorQualificationView` | GET `/user/admin/tutor/qualification/view?id=` | 审核详情 |
| `tutorQualificationApprove` | PUT `/user/admin/tutor/qualification/approve` | 审核通过 |
| `tutorQualificationReject` | PUT `/user/admin/tutor/qualification/reject` | 审核驳回 |
| `tutorIntroPage` | POST `/user/admin/tutor/intro/page` | 讲师入驻资料 |
| `tutorIntroEdit` | PUT `/user/admin/tutor/intro/edit` | 讲师资料纠偏 |
| `bookingPage` | POST `/user/admin/booking/page` | 约课订单列表 |
| `bookingView` | GET `/user/admin/booking/view?id=` | 约课详情 |
| `bookingCancel` | PUT `/user/admin/booking/cancel` | 取消约课 |
| `schedulePage` | POST `/user/admin/schedule/page` | 排课列表 |
| `scheduleAdjust` | PUT `/user/admin/schedule/adjust` | 调整排课 |
| `lessonRecordView` | GET `/user/admin/lesson/record/view?scheduleId=` | 上课记录 |
| `feedbackPage` | POST `/user/admin/feedback/page` | 反馈列表 |
| `feedbackReply` | PUT `/user/admin/feedback/reply` | 回复 |
| `feedbackClose` | PUT `/user/admin/feedback/close` | 关闭 |

### 3.2 `src/api/course.js` 扩展

| 方法名 | 路径 | 说明 |
|---|---|---|
| `lessonPackagePage` | POST `/course/admin/lesson/package/page` | 课时包列表 |
| `lessonPackageView` | GET `/course/admin/lesson/package/view?id=` | 课时包详情 |
| `lessonPackageSave` | POST `/course/admin/lesson/package/save` | 新建课时包 |
| `lessonPackageEdit` | PUT `/course/admin/lesson/package/edit` | 编辑课时包 |
| `lessonPackageSort` | PUT `/course/admin/lesson/package/sort` | 排序 |
| `lessonPackageDelete` | DELETE `/course/admin/lesson/package/delete?id=` | 逻辑删除 |
| `courseLessonConfig` | PUT `/course/admin/course/lesson-config` | 课程上课方式配置 |

### 3.3 `src/api/system.js` 扩展

| 方法名 | 路径 | 说明 |
|---|---|---|
| `faqPage` | POST `/system/admin/faq/page` | FAQ 列表 |
| `faqView` | GET `/system/admin/faq/view?id=` | FAQ 详情 |
| `faqSave` | POST `/system/admin/faq/save` | 新建 |
| `faqEdit` | PUT `/system/admin/faq/edit` | 编辑 |
| `faqSort` | PUT `/system/admin/faq/sort` | 排序 |
| `faqDelete` | DELETE `/system/admin/faq/delete?id=` | 逻辑删除 |

---

## 4. 页面方案

### 4.1 资质审核页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/tutor/audit/index.vue` |
| 子组件 | `QualificationPreview.vue`、`AuditDialog.vue` |
| 查询 | 状态、科目、城市、提交时间、手机号、姓名 |
| 表格 | 讲师、科目、学历、上课方式、提交时间、审核状态、审核人 |
| 详情 | 身份证正反面、教师资格证、学历证书、头像、讲师简介 |
| 操作 | 通过、驳回、查看审核日志 |
| 校验 | 驳回原因必填且不少于 10 字 |
| 联动 | 通过后 mobile `roles` 含 `TEACHER`，TeacherList 可检索 |

### 4.2 讲师运营页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/tutor/list/index.vue` |
| 查询 | 科目、城市、资质状态、上课方式、热度排序 |
| 表格 | 讲师、授课科目、课时价、教龄、评分、学生数、已上课时 |
| 操作 | 查看、编辑简介、调整推荐权重、启停展示 |
| 风险 | 不允许后台直接改资质状态，只能进入审核页 |
| 验收 | Home/TeacherList 推荐老师随推荐权重变化 |

### 4.3 课时包管理页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/course/lessonPackage/index.vue` |
| 子组件 | `LessonPackageForm.vue` |
| 查询 | 课程、学科、上课方式、启用状态 |
| 表格 | 课程、包名、课时数、单课时长、单价、折扣、总价、上课方式、排序 |
| 表单 | 课程选择、课时数、单价、折扣、上课方式、说明 |
| 计算 | 总价前端仅展示预估，最终以后端返回为准 |
| 删除 | 已关联约课订单的课时包只允许禁用 |
| 验收 | 新增课时包后 Android `LessonPackageApi.listByCourse` 可见 |

### 4.4 课程上课方式配置

| 项 | 设计 |
|---|---|
| 入口 | 课程编辑页新增“家教配置”区 |
| 字段 | `lessonRate`、`deliveryModes`、`packageCount` 展示 |
| 交互 | 多选上门/线上；参考价非必填；课时包数量只读 |
| 约束 | 课程下架后不可创建新课时包 |
| 验收 | CourseDetail 返回 `deliveryModes` 与 admin 配置一致 |

### 4.5 约课订单页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/booking/index.vue` |
| 子组件 | `BookingDetailDrawer.vue`、`BookingCancelDialog.vue` |
| 查询 | 订单号、学生、老师、课程、状态、支付状态、上课方式、创建时间 |
| 表格 | 订单号、课程、课时包、总价、已上/总课时、首课时间、状态 |
| 详情 | 课程、课时包、老师、学生、支付、排课、退款、消息流水 |
| 操作 | 取消约课、查看排课、跳转退款、备注 |
| 约束 | 已完成订单不可取消；已上课时大于 0 时必须走部分退款规则 |
| 验收 | admin 取消后 Android OrderDetail 显示取消状态与原因 |

### 4.6 排课日历页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/schedule/index.vue` |
| 子组件 | `ScheduleAdjustDialog.vue`、`ScheduleCalendar.vue` |
| 视图 | 日历视图 + 列表视图 |
| 查询 | 日期范围、老师、学生、课程、状态、上课方式 |
| 表格 | 时间、老师、学生、课程、第几课时、方式、状态 |
| 操作 | 调整时间、取消排课、查看上课记录 |
| 校验 | 新时间必须晚于当前时间 6 小时；理由必填 |
| 验收 | admin 改约后 Android LessonSchedule 显示新时间 |

### 4.7 上课记录页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/lessonRecord/index.vue` |
| 查询 | 老师、学生、课程、日期、是否有作业、评分 |
| 详情 | 上课笔记、作业、附件、学生评分、老师评语 |
| 操作 | 查看、标记争议、导出单条记录 |
| 约束 | admin 默认只读，不替老师填写记录 |
| 验收 | LessonRecordScreen 保存后 admin 可查看 |

### 4.8 师生关系与学情页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/tutor/relation/index.vue` |
| 查询 | 老师、学生、课程、进行中/已完结 |
| 表格 | 老师、学生、课程、已上课时、剩余课时、下节课、最近记录 |
| 操作 | 查看学情、跳转排课、跳转上课记录 |
| 验收 | MyStudents 与 MyCourses 聚合数和 admin 一致 |

### 4.9 FAQ 管理页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/system/faq/index.vue` |
| 查询 | 分类、关键词、热门、状态 |
| 表格 | 分类、问题、热门、排序、更新时间 |
| 表单 | 分类、问题、答案、热门、排序 |
| 验收 | admin 新增 FAQ 后 Android HelpCenter 可见 |

### 4.10 反馈工单页

| 项 | 设计 |
|---|---|
| 路径 | `src/views/users/feedback/index.vue` |
| 查询 | 类型、状态、用户、提交时间 |
| 表格 | 工单号、用户、类型、摘要、联系方式、状态、处理人 |
| 详情 | 内容、截图、处理记录 |
| 操作 | 回复、关闭、重开 |
| 校验 | 回复内容必填；关闭必须有处理结论 |
| 验收 | admin 处理后工单状态可追踪 |

### 4.11 消息模板与触达

| 项 | 设计 |
|---|---|
| 现有路径 | `src/views/users/msg/index.vue` |
| 扩展分类 | 约课提醒、排课变更、上课记录、支付状态、系统公告 |
| 扩展表单 | targetType 支持学生、老师、订单、课程 |
| 效果 | 发送量、已读量、点击跳转目标 |
| 验收 | 投放后 Android MessageList 显示对应分类 |

### 4.12 工作台指标

| 指标 | 来源 |
|---|---|
| 今日约课数 | `booking_order` |
| 待审核资质 | `qualification_item` |
| 今日排课 | `lesson_schedule` |
| 待处理反馈 | `feedback_ticket` |
| 支付异常 | `order_pay` / `booking_order` |
| 提现待审 | 既有提现表 |

---

## 5. 权限设计

| 权限 key | 说明 |
|---|---|
| `user:tutor:audit:page` | 资质审核列表 |
| `user:tutor:audit:view` | 资质详情 |
| `user:tutor:audit:approve` | 审核通过 |
| `user:tutor:audit:reject` | 审核驳回 |
| `course:lessonPackage:page` | 课时包列表 |
| `course:lessonPackage:save` | 新建课时包 |
| `course:lessonPackage:edit` | 编辑课时包 |
| `user:booking:page` | 约课订单列表 |
| `user:booking:cancel` | 取消约课 |
| `user:schedule:page` | 排课列表 |
| `user:schedule:adjust` | 调整排课 |
| `user:lessonRecord:view` | 查看上课记录 |
| `system:faq:page` | FAQ 列表 |
| `system:faq:save` | 新建 FAQ |
| `system:faq:edit` | 编辑 FAQ |
| `user:feedback:page` | 反馈列表 |
| `user:feedback:reply` | 回复反馈 |
| `user:feedback:close` | 关闭反馈 |

按钮级操作全部使用 `v-permission`，后端 `AdminGlobalFilter` 同步校验 `admin_apis:{userId}`。

---

## 6. 页面交互规范

| 场景 | 规范 |
|---|---|
| 列表 | 搜索表单、操作栏、表格、分页沿用现有 CRUD 页结构 |
| 审核 | 二次确认；原因就近校验；提交按钮 loading + disabled |
| 金额 | 前端展示两位小数；计算以后端返回为准 |
| 状态 | 使用 tag 显示状态；状态文案集中在页面常量 |
| 文件预览 | 资质图用图片预览；PDF/文档新窗口 |
| 调整排课 | 必须展示原时间、新时间、原因、影响用户 |
| 取消订单 | 必须展示已上课时、退款规则、影响金额 |
| 表单 | 不允许提交空字符串作为有效字段 |
| 错误 | 业务错误由 request.js 统一弹出，页面保留当前输入 |

---

## 7. 与后端的状态联动

| Admin 操作 | 后端变化 | Android 可见 |
|---|---|---|
| 审核通过讲师资质 | `qualification_item.status=approved`，用户 `roles` 派生 TEACHER | MeScreen 教师身份入口、TeacherList 可见 |
| 审核驳回讲师资质 | `status=rejected` + 审核说明 | TutorQualificationScreen 显示驳回原因 |
| 新建课时包 | `lesson_package` 新行 | CourseDetail / Booking 可选 |
| 禁用课时包 | `status_id=0` | 新约课不可选，历史订单保留 |
| 调整排课 | `lesson_schedule.start_at/end_at` 更新，写 `reschedule_log` | LessonSchedule 显示新时间 |
| 取消约课 | `booking_order.status=canceled`，必要时触发退款 | OrderDetail 显示取消 |
| 回复反馈 | `feedback_ticket.status=replied/closed` | 用户侧可追踪处理状态 |
| 投放消息 | `msg/msg_user` 写入 | MessageList 可见 |

---

## 8. 分阶段实施计划

### 8.1 A0 契约与菜单

| 任务 | 文件 |
|---|---|
| 确认后端 admin 端点字段 | 后端 20 号 §8 |
| 新增 admin 菜单与权限 seed | 后端 SQL 增量 |
| 扩展 `users.js/course.js/system.js` API | `src/api/*.js` |
| 验证动态路由可装配 | `src/router/index.js` 只读复验 |

### 8.2 A1 家教基础运营

| 任务 | 页面 |
|---|---|
| 资质审核 | `users/tutor/audit` |
| 讲师运营 | `users/tutor/list` |
| 课程家教配置 | `course/list` / `course/update` 扩展 |
| 课时包管理 | `course/lessonPackage` |

### 8.3 A2 交易与排课运营

| 任务 | 页面 |
|---|---|
| 约课订单 | `users/booking` |
| 排课日历 | `users/schedule` |
| 上课记录 | `users/lessonRecord` |
| 退款/提现联动 | 复用既有 order / withdraw 页面并加跳转 |

### 8.4 A3 内容与客服运营

| 任务 | 页面 |
|---|---|
| FAQ 管理 | `system/faq` |
| 反馈工单 | `users/feedback` |
| 消息模板与投放 | `users/msg` 扩展 |
| 工作台指标 | `dashboard` 扩展 |

### 8.5 A4 联调验收

| 路径 | 验收 |
|---|---|
| 资质审核路径 | admin 审核通过后 Android 教师身份可见 |
| 课时包路径 | admin 新建课时包后 Android Booking 可选择 |
| 排课路径 | admin 调整排课后 Android 显示新时间 |
| 反馈路径 | Android 提交反馈后 admin 可回复并关闭 |
| 消息路径 | admin 投放后 Android 消息列表可读 |

### 8.6 按周开发计划（以 Android 27 号 P3.5 为标准）

本节是 Admin 当前执行周计划。周次与 Android 27 号 §9.5、后端 20 号 §2.1 一一对应，Admin 不单独追求页面数量，优先完成能闭合 Android 用户路径的运营动作。

| 周次 | 对齐 Android 27 号 | Admin 交付 | 后端 / Android 联动 | 周 Gate |
|---|---|---|---|---|
| 第 1 周 | W1：讲师入驻 + 资质审核 + 课时包 | 扩展 `src/api/users.js`、`src/api/course.js`；落地资质审核页、课时包管理页、审核弹窗、课时包表单；接入菜单 seed 与权限按钮 | 调用后端资质审核、课时包 admin 端点；Android 资质状态和课时包列表读取同一后端数据 | T-ADM-01、T-ADM-02 达 L5：审核通过影响教师身份，新增课时包在移动端可见 |
| 第 2 周 | W2：约课 + 排课 + 上课记录 | 约课订单页、约课详情抽屉、排课日历页、排课调整弹窗、上课记录页；订单与排课状态筛选 | 调用后端 booking/schedule/lesson-record admin 端点；Android 创建约课后 Admin 可处理，Admin 调整后 Android 排课同步 | T-ADM-03、T-ADM-04 后台链路 L5：订单、排课、记录可查可操作 |
| 第 3 周 | W3：双身份 + 学生扩展资料 + 学情看板 | 师生关系页、讲师运营页学情字段、学员资料扩展展示；工作台增加待审核、待排课、异常课时指标 | 调用后端关系与学情端点；Android `MeScreen`、`MyStudentsScreen`、`MyCoursesScreen` 与 Admin 展示同一统计 | 学情字段与关系状态一致；Admin 操作不绕过资质与角色状态机 |
| 第 4 周 | W4：讲师发现 + 找老师入口 | 讲师运营页补筛选、推荐权重、展示启停、城市/科目/上课方式过滤；课程列表增加家教配置入口 | 后端权重和展示状态改变后，Android `HomeScreen`、`TeacherListScreen`、`TeacherDetailScreen` 读取排序和标签变化 | 讲师发现运营 L5：权重调整有审计，移动端结果可复验 |
| 第 5 周 | W5：评价、优惠券、FAQ、反馈、消息 | FAQ 管理页、反馈工单页、反馈回复弹窗、消息模板与投放扩展、优惠券状态筛选复验 | Android 提交反馈后 Admin 可回复关闭；Admin 投放约课/学情消息后 Android 消息列表可见 | T-ADM-05 达 L5；FAQ、反馈、消息三类内容可配置、可追踪 |
| 第 6 周 | W6：总联调与上线门禁 | 收敛菜单、权限、按钮状态、空态、错误态、审计入口；按 T-ADM-01~05 联调修正页面字段与交互 | 与后端 20 号 L3-L5、Android 27 号 T-AND-06 联合复验 | Admin L6：五条运营路径全部能改变后端真实状态并被 Android 对应屏看见 |

执行纪律：

1. 页面完成标准不是静态展示，而是 `查询 -> 操作 -> 后端状态变化 -> Android 可见` 的闭环。
2. 所有新增页面必须由后端菜单 seed 驱动，按钮由权限 key 控制。
3. 表单金额、课时、状态、角色等关键字段最终以后端返回为准，前端只做输入校验和可读展示。
4. 每周只做 Android 27 号路线和后端 20 号已交付能力对应的后台动作，不扩展产品路线外运营页。

---

## 9. 文件清单

### 9.1 新增页面文件

| 文件 | 说明 |
|---|---|
| `src/views/users/tutor/audit/index.vue` | 资质审核列表 |
| `src/views/users/tutor/audit/QualificationPreview.vue` | 资质材料预览 |
| `src/views/users/tutor/audit/AuditDialog.vue` | 审核弹窗 |
| `src/views/users/tutor/list/index.vue` | 讲师运营 |
| `src/views/users/tutor/relation/index.vue` | 师生关系 |
| `src/views/course/lessonPackage/index.vue` | 课时包管理 |
| `src/views/course/lessonPackage/LessonPackageForm.vue` | 课时包表单 |
| `src/views/users/booking/index.vue` | 约课订单 |
| `src/views/users/booking/BookingDetailDrawer.vue` | 约课详情 |
| `src/views/users/schedule/index.vue` | 排课日历 |
| `src/views/users/schedule/ScheduleAdjustDialog.vue` | 调整排课 |
| `src/views/users/lessonRecord/index.vue` | 上课记录 |
| `src/views/system/faq/index.vue` | FAQ 管理 |
| `src/views/system/faq/FaqForm.vue` | FAQ 表单 |
| `src/views/users/feedback/index.vue` | 反馈工单 |
| `src/views/users/feedback/FeedbackReplyDialog.vue` | 反馈回复 |

### 9.2 修改文件

| 文件 | 修改 |
|---|---|
| `src/api/users.js` | 增加 tutor/booking/schedule/lessonRecord/feedback API |
| `src/api/course.js` | 增加 lessonPackage API |
| `src/api/system.js` | 增加 faq API |
| `src/views/users/msg/index.vue` | 增加家教消息分类 |
| `src/views/dashboard/index.vue` | 增加家教运营指标 |
| `src/views/system/config/List.vue` | 保留并复验 teacherStrategy |

---

## 10. 验收标准

### 10.1 L1-L7

| 级别 | Admin 证据 |
|---|---|
| L1 | 页面、API 方法、菜单 seed、权限 key、后端 admin 端点真实存在 |
| L2 | `npm run build` 成功 |
| L3 | 后端 admin filter / governance 测试通过；前端权限按钮显示正确 |
| L4 | admin dev server 可访问，后端 gateway/service UP |
| L5 | 所有 admin API 经 `/gateway` 返回真实 `data` |
| L6 | 五条 admin 运营路径与 Android 对应屏完成联动 |
| L7 | 文件 URL、支付退款、短信/OSS 等第三方能力按真实配置验证 |

### 10.1.1 每周 Gate 验收矩阵

| 周次 | Admin 必达 | 后端真值 | Android 可见结果 | 不通过判定 |
|---|---|---|---|---|
| 第 1 周 | 资质审核页、课时包管理页、API、菜单、权限按钮 | 资质状态、课时包价格、上课方式写入后端 | 教师身份/资质状态、课时包列表可见 | 页面保存后 mobile 读取不到变化 |
| 第 2 周 | 约课订单、排课日历、上课记录页 | 订单、排课、改约、记录状态机真实流转 | T-AND-06 中订单、排课、记录同步变化 | Admin 操作只改页面缓存 |
| 第 3 周 | 师生关系、学情看板、工作台指标 | 关系、已上课时、下节课、教师学生列表一致 | `MyStudentsScreen` / `MyCoursesScreen` 数值一致 | Admin 与 Android 统计不一致 |
| 第 4 周 | 讲师运营、推荐权重、展示启停、课程家教配置 | 讲师排序、筛选、课程推荐权重可审计 | `HomeScreen` / `TeacherListScreen` 排序和标签变化 | 权重调整对移动端无影响 |
| 第 5 周 | FAQ、反馈工单、消息模板与投放、优惠券状态复验 | FAQ、反馈、消息、优惠券状态可追踪 | Help/Feedback/Message/Coupon 屏读取真数据 | 内容只在 Admin 可见 |
| 第 6 周 | 菜单、权限、错误态、审计、五条路径总复验 | T-ADM-01~05 全部可回放 | Android 对应屏全部可见 | 任一核心操作无审计或无 Android 结果 |

### 10.1.2 页面完成定义

单个 Admin 页面只有同时满足以下条件，才能标记完成：

1. L1：页面文件、子组件、API 方法、菜单 seed、按钮权限、后端 admin 端点均存在。
2. L2：`npm run build` 成功。
3. L3：登录后菜单可见，按钮按权限显示，未授权账号不可操作。
4. L5：查询、保存、编辑、审核、调整、回复等动作均经 `/gateway` 返回真实 `data`。
5. L6：操作后重新读取后端，并能在 Android 对应屏看到同一业务结果。
6. L7：涉及文件、退款、短信、OSS 时，必须等真实或沙箱配置完成后复验；配置缺失时不得标记 L7。

### 10.2 Admin 五条必过路径

| 编号 | 路径 | 完成判定 |
|---|---|---|
| T-ADM-01 | 讲师提交资质 -> admin 审核通过 -> Android 教师身份可见 | roles 含 TEACHER |
| T-ADM-02 | admin 新建课时包 -> Android CourseDetail / Booking 可见 | packages 非空 |
| T-ADM-03 | 用户创建约课 -> admin 查看订单 -> admin 调整排课 -> Android 同步新时间 | schedule 时间一致 |
| T-ADM-04 | Android 保存上课记录 -> admin 查看记录 -> 学情统计更新 | record 可查，课时累计 |
| T-ADM-05 | Android 提交反馈 -> admin 回复关闭 -> 工单状态可追踪 | feedback 状态 closed |

### 10.3 文档一致性验收

| 核对项 | 通过标准 |
|---|---|
| 与 27 号一致 | 页面只服务 preview 39 屏和 T-AND-01~06，不新增路线外运营功能 |
| 与 20 号一致 | API 路径、DTO 字段、状态机、错误码与后端 20 号一致 |
| 与菜单 seed 一致 | 路由 path、component、permission key 与 SQL seed 一致 |
| 与验收路径一致 | 每个页面至少归属一个 T-ADM 或明确为支撑页面 |
| 与回滚策略一致 | 高风险操作具备审计、反向处理或禁用策略 |

---

## 11. 风险与回滚

| 风险 | 影响 | 回滚 |
|---|---|---|
| 菜单 seed 错误 | 页面不可访问或权限异常 | 删除本次 seed，恢复原菜单 |
| API 字段与后端不一致 | 页面显示异常 | 以后端 DTO 为准修正 `src/api` 与页面字段 |
| 审核误操作 | 老师身份错误开放 | admin 审计 + 反向驳回 + mobile roles 重算 |
| 排课误调整 | 用户时间错误 | `reschedule_log` 回放旧时间 |
| 课时包价格误填 | 影响支付金额 | 禁用课时包，新建正确课时包；历史订单不改价 |
| 第三方配置缺失 | 支付/文件无法验收 L7 | 保持业务错误码，配置齐后复验 |

---

## 12. 待复验项

| 项 | 阻塞 | 解除条件 |
|---|---|---|
| 后端 admin 端点 | 20 号后端方案尚未实施 | admin API 能经 `/gateway` 返回真实数据 |
| 菜单 seed | 新页面 seed 未落库 | 登录后 `routerList` 包含新增页面 |
| 资质文件预览 | 依赖真实上传 URL | OSS/本地存储配置可读 |
| 支付退款联动 | 依赖沙箱支付配置 | 退款/回调 L7 通过 |
| Android 联动 | 依赖 27 号 P3.5 屏真实对接 | T-ADM-01~05 全部 L6 |

### 12.1 2026-05-17 W1 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| 资质审核页 | `src/api/users.js` 已接 `tutorQualification*` 与 `tutorIntro*`；`users/tutor/audit` 页面、材料预览、审核弹窗已落地；Admin build 通过 | 登录后经真实菜单进入页面，审核通过或驳回后用 mobile 资质查询复核状态 |
| 课时包管理页 | `src/api/course.js` 已接 `lessonPackage*`；`course/lessonPackage` 列表页与表单已落地；菜单权限 seed 已落盘 | 执行 seed 后登录确认菜单与按钮权限，保存课时包后用 mobile 课时包列表复核 |

### 12.2 2026-05-17 W2 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| 约课订单页 | `src/api/users.js` 已接 `bookingPage`、`bookingView`、`bookingCancel`；`src/views/users/booking/index.vue` 与 `BookingDetailDrawer.vue` 已落地；Admin build 通过 | 登录后查询真实约课订单，取消待支付约课后用 mobile OrderDetail 或 schedule 列表复核状态 |
| 排课管理页 | `schedulePage`、`scheduleAdjust` 已接入；`src/views/users/schedule/index.vue` 与 `ScheduleAdjustDialog.vue` 已落地；按钮权限为 `user:schedule:adjust` | seed 入库后验证菜单与按钮权限；调整排课后 Android LessonSchedule 读取同一新时间 |
| 上课记录页 | `lessonRecordView` 已接入；`src/views/users/lessonRecord/index.vue` 已落地，只读查看老师保存的课后记录 | Android 或 mobile 端保存记录后，admin 页面查看记录并复核课时累计 |
| 菜单权限 | 后端 seed `docs/sql/20260517_d13_booking_admin_menu_seed.sql` 已新增页面与按钮权限 | 目标库执行 seed 后确认 `routerList` 包含 `/users/booking`、`/users/schedule`、`/users/lesson-record` |

### 12.3 2026-05-17 W3 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| 师生关系页 | `src/api/users.js` 已接 `tutorRelationPage` 与 `tutorRelationProgress`；`src/views/users/tutor/relation/index.vue` 已落地，支持学生、讲师、课程、状态筛选 | 执行菜单 seed 后登录 admin，确认 `/users/tutor/relation` 可见并能查询真实关系 |
| 学情看板 | 关系页展示已上课时、总课时、剩余课时、进度、下节课、最近记录与评分；学情抽屉读取 `/user/admin/tutor/relation/progress` | Android 老师保存课后记录后，admin 重新查询显示同一累计课时 |
| 联动跳转 | 关系页可跳转 `/users/schedule?bookingId=` 与 `/users/lesson-record?bookingId=`；排课与记录页读取路由 query 作为初始过滤条件 | 在真实浏览器中从关系页跳转后确认目标页只加载对应约课记录 |
| 菜单权限 | 后端 seed `docs/sql/20260517_d13_student_relation_admin_menu_seed.sql` 已新增页面、查询、学情查看权限 | 目标库执行 seed 后确认 `routerList` 与按钮权限 key 均生效 |

### 12.4 2026-05-17 W4 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| 讲师运营页 | 新增 `src/views/users/tutor/list/index.vue`，支持科目、城市、资质状态、上课方式、展示状态、排序筛选；表格展示讲师、授课科目、课时价、教龄、评分、学生数、已上课时、运营权重与展示状态 | 执行菜单 seed 后登录 admin，确认 `/users/tutor/list` 可见并能查询真实讲师 |
| 运营配置 | `src/api/users.js` 新增 `tutorOperationPage/tutorOperationConfig`；页面可编辑简介、上课方式、推荐权重、热度补分、展示启停 | 保存配置后刷新页面，再用 mobile 讲师列表复核排序与展示状态 |
| 权限菜单 | 后端 seed `docs/sql/20260517_d13_teacher_discovery_admin_menu_seed.sql` 已新增页面、查询、配置权限 | 目标库执行 seed 后确认 `user:tutor:list:*` 权限 key 生效 |
| 证据 | Admin 页面源码已落地，后端 W4 编译通过 | `npm run build`、浏览器 L6、与 Android TeacherListScreen 联动待复验 |

### 12.5 2026-05-18 W5 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| FAQ 管理 | `src/api/system.js` 已接 `faqPage/view/save/edit/delete/sort`；`src/views/system/faq/index.vue` 与 `FaqForm.vue` 已落地，支持分类、关键词、热门、状态查询与增删改 | 执行菜单 seed 后登录 admin，新增 FAQ，再用 Android HelpCenter 或 mobile FAQ curl 读取 |
| 反馈工单 | `src/api/users.js` 已接 `feedbackPage/view/reply/close/reopen`；`src/views/users/feedback/index.vue` 与 `FeedbackReplyDialog.vue` 已落地，支持查询、详情、回复、关闭、重开 | Android 提交反馈后，admin 回复关闭，复核工单状态与用户消息回执 |
| 消息模板与投放 | `src/views/users/msg/index.vue` 与 `MsgForm.vue` 已扩展家教分类 `booking/schedule/lesson/payment/system`，投放仍写真实 `msg/msg_user` | admin 投放分类消息后 Android MessageListScreen 按家教分类可见 |
| 菜单权限 | 后端 seed `docs/sql/20260518_d13_w5_faq_feedback_message_seed.sql` 已包含 FAQ、反馈页面与按钮权限 | 目标库执行 seed 后确认 `routerList` 包含 `/system/faq`、`/users/feedback` |
| 证据 | `npm run build` 成功；后端 W5 编译与治理测试通过 | L6 浏览器操作需本地服务、数据库和 admin token |

### 12.6 2026-05-18 W6 执行记录

| 范围 | 已达证据 | 仍需复验 |
|---|---|---|
| 菜单与权限总核对 | 后端新增 `verify-d13-w6-gate.ps1`，静态核对 W1-W5 所有 admin 页面 permission key 与 API seed；覆盖 `user:tutor:audit`、`course:lessonPackage`、`user:booking`、`user:schedule`、`user:lessonRecord`、`user:tutor:relation`、`user:tutor:list`、`system:faq`、`user:feedback` | 执行 seed 后登录 admin，确认 `routerList`、页面可见性、按钮 `v-permission` 与 Redis RBAC API 一致 |
| T-ADM-01~05 只读 Gate | W6 脚本支持携带 `-AdminToken` 经 Gateway 调用资质审核列表、课时包列表、约课列表、排课列表、反馈列表、消息列表；上课记录详情需传 `-ScheduleId` | 准备真实 admin token 和测试数据后运行脚本，再在浏览器执行审核、建课时包、排课调整、查看记录、反馈回复五条路径 |
| 页面状态收敛 | W1-W5 页面均使用现有 `useTable` loading、Element Plus 表格空态和操作后刷新后端真值；高风险动作已有弹窗确认或原因输入：资质驳回、约课取消、排课调整、反馈关闭/重开 | 浏览器 L6 仍需逐页确认空态、错误态、按钮禁用态与真实接口异常提示，不以 build 通过替代联调 |
| Android 可见联动 | W6 只读 Gate 与 Android 27 号 T-AND-06 共用后端路径；Admin 操作后的可见结果以 mobile FAQ、课时包、排课、消息、反馈状态读取为准 | 真机复验 Android 对应屏全部可见：教师身份、课时包、排课时间、课后记录、反馈进展、分类消息 |

### 12.7 2026-05-19 W6 Admin 待复验推进记录

| 范围 | 本次结果 | 仍需复验 |
|---|---|---|
| 菜单 seed 兼容 | D13 admin 菜单 SQL 已兼容当前 Release 基线 `/user` 父菜单与 `Release Super Admin` 角色；本地库 D13 菜单 29 项、核心运营权限均有角色绑定 | 非 Release 目标库执行前需核对父菜单路径与角色名 |
| Admin token 与 RBAC | 通过真实验证码接口、Redis 验证码值、RSA 公钥加密密码登录 `13800138000 / XiaoE@2026`，刷新 `admin_apis:1` 后，T-ADM-01/02/03/05 列表类 Gate 均返回 HTTP 200 + `code=200` | T-ADM-04 上课记录详情需真实 `ScheduleId`；审核通过、课时包新建、排课调整、反馈回复等写路径需浏览器 L6 逐项执行 |
| Gate 脚本 | `verify-d13-w6-gate.ps1` 已收紧为业务 `code=200` 才通过，避免 `MENU_NO(306)` 被误判为 OK | 浏览器页面状态、按钮禁用态、异常提示仍需 Admin dev server 联调 |

---

## 13. 落地顺序

1. 后端先交付 admin 端点和菜单 seed。
2. Admin 先接 API 层，再做资质审核和课时包两个 P0 页面。
3. 约课订单、排课、上课记录随后与后端状态机联调。
4. FAQ、反馈、消息、工作台在主交易链可用后补齐。
5. 每个 admin 操作都要拿 Android 对应屏复验，不把后台页面孤立算完成。
