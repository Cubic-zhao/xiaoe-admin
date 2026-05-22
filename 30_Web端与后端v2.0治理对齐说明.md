# 30. Web 端与后端 v2.0 治理对齐说明

> **版本**：v1.0（2026-04-28，基于实地代码勘察）  
> **配套**：本文档与后端 `xiaoe-education-master/docs/02-05/07/12-18` 号文档共同构成跨端治理证据链  
> **定位**：Web 端 admin 面契约事实 + 与后端 v2.0 治理对齐情况，**不替代** 10 号项目全面信息文档（10 号是入口，本文是契约细节）  
> **不重复内容**：本文不重复 10 号已说的运行链路；只补充实地代码勘察的契约层结论

---

## 1. 文档定位

本文是 2026-04-28 三端文档结构治理的产物之一。本日完成的同步治理：

- 后端：`02_common模块.md` ~ `05_service模块.md` v2.0 重写 + `07_系统部署与升级.md` v2.0 + `18_xiaoe-generator模块.md` v1.0
- Android：`21/22` 路径修正与补记 + `24_Android端与后端v2.0治理对齐说明.md` v1.0 新建
- Web（本仓）：`10/20` 路径修正与补记 + `README.md` 升级 + `30_Web端与后端v2.0治理对齐说明.md` v1.0 新建（**本文**）

本文体量目标：在 17 KB 内容控制下完整描述 Web 端的契约真实状态 + 与后端 12-17 号文档的对应关系。

---

## 2. Web 端实地代码勘察总览

### 2.1 工程基线（package.json 实地验证）

| 维度 | 值 |
|---|---|
| 包名 | `roncoo-education-admin`（沿用历史命名） |
| 版本 | `25.0.0-RELEASE` |
| Node 要求 | `>=18.0.0` |
| 模块化 | `"type": "module"` ESM |
| 包管理 | npm |
| 构建工具 | Vite 5.2.14 |
| 框架 | Vue 3.4.21 |
| 路由 | Vue Router 4.3.0（HashHistory） |
| 状态管理 | Pinia 2.1.7 |
| UI 组件 | Element Plus 2.6.3 + `@element-plus/icons-vue` 2.3.1 |
| HTTP | Axios 1.7.4 |
| 富文本 | wangEditor 5.1.23 + `@wangeditor/editor-for-vue` 5.1.12 |
| 图表 | ECharts 5.5.0 |
| 上传 | `simple-uploader.js` 0.6.0 + `@polyv/vod-upload-js-sdk` 1.6.0 |
| 加密 | jsencrypt 3.2.1（密码 RSA 加密） |
| 工具 | lodash 4.17.21 / mitt 3.0.1 / sortablejs 1.15.2 / vuedraggable 4.1.0 |

### 2.2 源码体量统计

| 目录 | 文件数 | 备注 |
|---|---|---|
| `src/api/` | 6 | 110 API 端点 |
| `src/views/` | 68 | 7 业务域 + 403/404 |
| `src/components/` | 22 | 9 组件家族（Cascader/Editor/Enum/Icon/Pagination/Preview/Selector/Upload/common） |
| `src/store/modules/` | 3 | user / website / upload |
| `src/utils/` | 12 | 含 2 治理产物（`mobileOpsFieldAdapter.js` / `releaseGateTemplate.js`） |
| `src/layout/` | 2 | 主框架 + 6 子组件 |
| `src/router/` | 1 | `index.js` 含动态路由装配 |
| `src/assets/` | 10 | 样式 + svg + 图片 |

### 2.3 启动链（main.js 实地验证）

```
浏览器加载 index.html
  ↓
main.js setupInit()
  ↓
检查 cookie EDU_OS_ADMIN_TOKEN
  ├── 无 token → init() 渲染登录页
  └── 有 token →
        loginApi.getUserInfo() 拉取当前用户 + 菜单 + 权限
        ↓
        createNewRouter(routerList) 动态注入路由
        ↓
        userStore.login(res) 写入用户态
        ↓
        init() 渲染 Layout 主框架
        ↓
        全局指令 v-permission 按 permissionList 控制按钮显隐
```

错误处理：`getUserInfo()` 失败 → `userStore.logout()` + 强制跳 login。

---

## 3. 110 API 端点完整清单

### 3.1 按文件分布

| 文件 | 端点数 | admin 面 | legacy api 面 | 说明 |
|---|---|---|---|---|
| `src/api/login.js` | 4 | 2 | 2 | 登录 + 验证码 + 站点配置 + 当前用户 |
| `src/api/system.js` | 36 | 35 | 1 | 菜单/角色/系统用户/系统配置/日志/网站运营 |
| `src/api/course.js` | 35 | 35 | 0 | 专区/分类/课程/章节/资源/学习评论收藏 |
| `src/api/users.js` | 27 | 27 | 0 | 学员/讲师/订单/钱包/消息/账户消费 |
| `src/api/dashboard.js` | 3 | 3 | 0 | 数据统计/登录统计/视频统计 |
| `src/api/upload.js` | 5 | 5 | 0 | 图片/文档/APP/视频云上传 |
| **总计** | **110** | **107** | **3** | — |

### 3.2 legacy api 面 3 端点（**冻结，不得新增**）

| 端点 | 调用文件 | 用途 | 后端归属 |
|---|---|---|---|
| `GET /system/api/sys/config/website` | `login.js:5` | 登录页前获取站点配置（站名/Logo/ICP） | service-system 公开接口 |
| `GET /system/api/common/code` | `login.js:8` | 登录前获取图形验证码 | service-system 公开接口 |
| `POST /system/api/common/enum` | `system.js:5` | 通用枚举字典查询 | service-system 公开接口 |

> **治理结论**：这 3 个 legacy api 面端点是登录前的"未鉴权公开能力"，符合后端 12 号文档 5.5 节 legacy 面冻结策略——**保留但不新增**。任何新需求都必须落 admin 面。

### 3.3 admin 面 107 端点按业务域分布

| 业务域 | 路径前缀 | 端点数 | 主要 API.js |
|---|---|---|---|
| **system** | `/system/admin/**` | 40 | system.js（35 个）+ login.js（2 个）+ dashboard.js（1 个）+ upload.js（3 个） |
| **user**（含订单/钱包/消息/讲师/学员/统计） | `/user/admin/**` | 29 | users.js（27 个）+ dashboard.js（2 个） |
| **course** | `/course/admin/**` | 38 | course.js（35 个）+ users.js（1 个 user/course/page）+ upload.js（2 个 resource） |

**完整端点列表见附录 A**（共 107 行 admin 端点）。

---

## 4. admin 面契约对齐细节（与后端 12 号文档）

### 4.1 Token Header（**关键差异于 mobile 面**）

| 项 | 实地代码 | 路径 |
|---|---|---|
| Header 名 | `token`（**不带 Bearer 前缀**） | `src/utils/request.js:22` |
| Cookie 存储 Key | `EDU_OS_ADMIN_TOKEN` | `src/utils/constants/system.js:11` |
| Cookie 工具 | `getToken()` / `removeToken()` | `src/utils/cookie.js` |
| 注入逻辑 | `if (token) config.headers['token'] = token` | `src/utils/request.js:21-23` |

**与后端 admin 面契约一致**：后端 `AdminGlobalFilter`（`xiaoe-education-master/docs/04_gateway模块.md` 第 4 章）期望 `token` Header，**不接受** `Authorization: Bearer ...`。

**绝对禁止**：将 mobile 端的 `Authorization: Bearer xxx` 风格用到管理端，会被 Gateway 直接拒绝。

### 4.2 baseURL 与代理

| 环境 | baseURL | 代理规则 |
|---|---|---|
| 开发 | `/gateway` | `vite.config.js` 第 13-17 行：`/gateway` → `http://localhost:7700`（rewrite 去掉 `/gateway`） |
| 生产 | `/gateway` | `nginx.conf` 第 23-25 行：`location /gateway/ { proxy_pass http://localhost:7700/; }` |

**重要**：所有 API 路径在 axios 中是 `/system/admin/...`，但实际发出的请求是 `/gateway/system/admin/...`，由 `request.js` 的 `axios.create({ baseURL: '/gateway' })` 自动拼接。

### 4.3 包装体 `Result<T>` 字段（与 mobile 面 8 字段不同）

```typescript
{
  code: number,    // 200 成功；301~306 各种异常
  msg: string,     // 业务消息或错误说明
  data: T          // 业务数据
}
```

**差异于 mobile 面 `MobileResult<T>`**（8 字段）：admin 面是精简版 3 字段，没有 `timestamp` / `requestId` / `success` / `traceId` / `appVersion`。

### 4.4 错误码处理（与 ResultEnum 对齐）

| code | 含义 | 前端处理（`request.js`） | 后端 ResultEnum |
|---|---|---|---|
| 200 | 成功 | `Promise.resolve(res.data)` 返回业务数据 | `SUCCESS` |
| 301 | Token 过期 | `removeToken()` + 跳 `/login` + 提示"登录已过期" | `TOKEN_PAST` |
| 302 | Token 异常 | 弹 `ElMessageBox.confirm` 让用户登出 | `TOKEN_ERROR` |
| 303 | 登录异常 | 同 302 | `LOGIN_ERROR` |
| 304 | 异地登录 | 同 302 | `OFFSITE_LOGIN`（后端定义） |
| 305 | 菜单过期 | 同 302 | `MENU_EXPIRED`（后端定义） |
| 306 | 权限不足 | 跳 `/403` + 提示"权限不足" | `NO_PERMISSION` |
| 其他 | 业务错误 | `ElMessage.error(res.msg)` | 业务自定义 |

**结论**：Web 端错误码处理与后端 `ResultEnum` **完全对齐**，无需调整。

---

## 5. 治理工具实地落地状态

### 5.1 `src/utils/mobileOpsFieldAdapter.js`（162 行）

**作用**：移动语义字段适配器，统一轮播 / 导航等运营位的字段模型。

**导出函数**：

| 函数 | 作用 | 关键逻辑 |
|---|---|---|
| `decodeMobileOpsLink(rawLink)` | 解析 `app://mobile-op?targetType=...&targetId=...&action=...&link=...` 格式 | 处理 URL 协议头，未编码格式自动降级 |
| `encodeMobileOpsLink(form)` | 将表单数据编码为 `app://mobile-op` URL | 用 `URLSearchParams` 拼接 |
| `normalizeMobileOpsForm(form)` | 表单数据规范化（`carouselUrl/navUrl/link` 统一处理） | 6 字段：`targetType` / `targetId` / `link` / `action` / `sort` / `status` |
| `buildMobileOpsPayload(form, scene)` | 按场景（`carousel` / `nav`）构建提交体 | 字段命名按后端 admin 接口契约 |
| `describeMobileOps(rawLink)` | 列表展示用的可读描述（"外链"/"课程"/"讲师"/"活动"等中文标签） | 用于 `views/common/carousel/index.vue` 等列表页 |
| `validateMobileOpsForm(form)` | 表单提交前校验 | 联动校验：外链需 link，课程/讲师/活动需 targetId |

**对齐 20 号 WEB-01**：完成"字段模型统一"步骤（4.2 节第 1 步），剩余 4 步需 UI / 联调 / 证据补齐。

### 5.2 `src/utils/releaseGateTemplate.js`（21 行）

**作用**：发布门禁模板与校验。

```javascript
RELEASE_GATE_TEMPLATE = {
  graySteps: '',           // 灰度步骤
  monitorScreenshots: '',  // 监控截图链接
  rollbackRecord: '',      // 回滚记录
  approver: '',            // 签核人
  updatedAt: ''            // 更新时间
}

validateReleaseGate(model)  // 返回 { valid, errors }
```

**对齐 20 号 WEB-06**：完成"四件套模板"步骤（4.7 节第 1 步），剩余 4 步需落库 / 历史追溯 / 演练补齐。

---

## 6. Web 端 admin API ↔ 后端 admin Controller 对应矩阵

### 6.1 service-system（Web 调用 40 端点）

| Web 调用路径前缀 | 后端 Controller（实地存在） | 备注 |
|---|---|---|
| `/system/admin/login/**` | `AuthAdminController` | 登录 |
| `/system/admin/sys/user/**` | `UserAdminController` | 系统用户 CRUD |
| `/system/admin/sys/role/**` | `RoleAdminController` | 角色 CRUD |
| `/system/admin/sys/menu/**` | `MenuAdminController` | 菜单 CRUD |
| `/system/admin/sys/config/**` | `ConfigAdminController` | 系统配置 |
| `/system/admin/sys/log/**` | `LogAdminController` | 系统日志 |
| `/system/admin/website/app/**` | `AppAdminController`（推测） | APP 版本管理 |
| `/system/admin/website/nav/**` | `NavAdminController`（推测） | 导航管理 |
| `/system/admin/website/carousel/**` | `CarouselAdminController`（推测） | 轮播管理 |
| `/system/admin/website/link/**` | `LinkAdminController`（推测） | 友情链接 |
| `/system/admin/upload/**` | `UploadAdminController` | 文件上传（pic/doc/app） |
| `/system/admin/stat/**` | `StatAdminController`（推测） | 视频用量统计 |

### 6.2 service-user（Web 调用 29 端点）

| Web 调用路径前缀 | 后端 Controller（实地存在） |
|---|---|
| `/user/admin/users/**` | `UsersAdminController` |
| `/user/admin/lecturer/**` | `LecturerAdminController` |
| `/user/admin/order/info/**` | `OrderAdminController` |
| `/user/admin/order/pay/**` | `AdminOrderPayController`（W3 新增退款 / 关闭交易，详见 §8 偏差 #6） |
| `/user/admin/wallet/withdraw/**` | `WithdrawAdminController` |
| `/user/admin/wallet/recharge/**` | `RechargeReconcileAdminController`（对账） |
| `/user/admin/msg/**` | `MsgAdminController` |
| `/user/admin/stat/**` | `StatAdminController` |

### 6.3 service-course（Web 调用 38 端点）

| Web 调用路径前缀 | 后端 Controller（实地存在） |
|---|---|
| `/course/admin/zone/**` | `ZoneAdminController` |
| `/course/admin/zone/course/**` | `ZoneCourseAdminController` |
| `/course/admin/category/**` | `CategoryAdminController` |
| `/course/admin/course/**` | `CourseAdminController` |
| `/course/admin/course/chapter/**` | `ChapterAdminController` |
| `/course/admin/course/chapter/period/**` | `PeriodAdminController` |
| `/course/admin/resource/**` | `ResourceAdminController` |
| `/course/admin/user/course/**` | `UserCourseAdminController` |
| `/course/admin/user/study/**` | `UserStudyAdminController` |

### 6.4 后端 Controller 索引权威源

实际后端 `service-system` / `service-user` / `service-course` 的 admin Controller 完整数量与命名以 `xiaoe-education-master/docs/05_service模块.md`（v2.0）第 3-5 章为准。本文表格基于路径前缀的推断，详细 Controller 类名以 05 号文档实地索引为准。

---

## 7. 动态菜单路由 + v-permission 权限点机制

### 7.1 路由不写死，由后端菜单驱动

**关键代码**：`src/router/index.js:89-126` 的 `createNewRouter()`：

1. 拉取后端 `routerList`（来自 `loginApi.getUserInfo()`）
2. 用 `import.meta.glob('../views/**/*.vue')` 预加载所有视图
3. 按 `menu.path` 与 `menu.component` 拼接生成路由
4. 找不到组件文件时降级到 `MissingRouteView`（404）容错
5. 挂载到顶层 `/` 下的 `Layout` 子路由

### 7.2 权限点 `v-permission`

`src/main.js:54-58`：

```javascript
app.directive('permission', (el, binding) => {
  if (!hasPermission(binding.value)) {
    el.parentNode && el.parentNode.removeChild(el)
  }
})
```

**Vue 模板用法**：

```vue
<el-button v-permission="'sys:user:save'" @click="save">新增</el-button>
```

权限点字符串与后端 `permissionList` 比对，无权直接 DOM 移除（不是隐藏，而是真删除）。

### 7.3 菜单元数据约定

后端返回的 `routerList` 每项必含：

| 字段 | 用途 |
|---|---|
| `id` | 路由 name + meta.id（用于面包屑映射） |
| `path` | 路由路径（不带 `/` 前缀会自动补） |
| `component` | 组件相对路径（不带 `.vue` 会自动补，找不到降 404） |
| `menuName` | 菜单标题（meta.title） |
| `menuIcon` | 菜单图标（meta.icon） |

**绝对禁止**：在前端写死动态菜单路由；菜单元数据漂移会导致整个左侧导航失效。

---

## 8. 已识别的潜在跨端契约偏差（待复验）

| # | 偏差点 | 当前状态 | 解决方案 | 优先级 |
|---|---|---|---|---|
| 1 | legacy api 面 3 端点（`website` / `code` / `enum`）仍被使用 | 后端 12 号文档已冻结 legacy 面，仅允许"薄适配收敛" | 保留现状，不新增；待后端有替代方案再迁移 | P3 |
| 2 | Web 端 `Result<T>` 3 字段，后端追加新字段如何兼容 | 当前 axios 取 `res.data`，多余字段被自然丢弃 | 现状 OK；如需 `requestId` 追踪，再修 `request.js` | P3 |
| 3 | 后端 admin Controller 命名未在 12 号文档列出权威清单 | 推断式对应表，需后端 05 号 v2.0 文档侧确认 | 后端 05 号文档已 v2.0，需对端补 Controller 索引 | P2 |
| 4 | `users.js` 中 `userCoursePage` 调 `/course/admin/...`（跨域调用） | API.js 文件按 Web 视图分组，跨服务调用是常态 | 现状 OK；说明 Web 端按业务视图组织而非按服务边界 | N/A |
| 5 | RSA 加密未在 `request.js` 中体现 | jsencrypt 依赖在 package.json 中存在 | 验证登录密码加密链路是否在 `views/login/index.vue` 实现 | P3 |
| 6 | 后端 W3 已新增 3 个 admin 端点（`order/pay/refund` / `refund/query` / `close`），Web 端 `users.js` 尚未对接 | 后端 `AdminOrderPayController` 已落地 + RBAC SQL 已注册（`20260501_admin_order_pay_refund_seed.sql`），Web 端订单页缺退款审核入口 | 在 `users.js` 增 3 个 axios（`orderPayRefund` / `orderPayRefundQuery` / `orderPayClose`），并在 `views/users/record/Order/*.vue` 增退款详情面板。属 Web 阶段 B 工作（对应 20 号文档 §4.5 订单异常治理） | P1 |

---

## 9. 后续开发与文档维护建议

### 9.1 文档治理纪律

1. 新增 admin 面端点 → 必须更新本文（30 号）第 3 章 + 后端 `05_service模块.md`
2. 修改 `request.js` Token 注入 → 必须更新本文 4.1 节
3. 修改 `vite.config.js` 或 `nginx.conf` 代理 → 必须更新本文 4.2 节
4. 新增治理工具（类似 `mobileOpsFieldAdapter`） → 必须更新本文第 5 章
5. 当后端 12 号文档 admin 面契约变更 → 必须同步本文第 4 章

### 9.2 与后端协同纪律（不可违反）

1. **路径前缀**：管理端**只**走 `/{system|user|course}/admin/**`
2. **不调 mobile 面**：mobile 面（`/{domain}/mobile/api/v1/**`）仅服务于 Android / iOS
3. **不调 feign 面**：feign 面被 `FeignSurfaceBlockFilter` 拦截
4. **不绕过 Gateway**：管理端所有请求必经 `/gateway/**` 反代
5. **Token Header**：`token`（**不带 Bearer**），存 cookie key `EDU_OS_ADMIN_TOKEN`
6. **legacy api 面冻结**：现有 3 端点保留，**不得新增**
7. **错误码以 ResultEnum 为准**：301-306 已在 `request.js` 处理，业务码以后端为权威

### 9.3 Vue 组件开发约定

1. 新页面优先复用 `src/api/*.js + views/*/index.vue` 的 CRUD 模式
2. 不直接使用原始 axios，统一走 `src/utils/request.js`
3. 不在前端写死动态菜单路由
4. 修改权限点 / 菜单路径 / 组件路径必须同时核对后端菜单元数据
5. 涉及首页 / 课程 / 消息 / 钱包数据时按"三端闭环"检查（不只看 Web 自身）

---

## 10. 关联文档导航

### 10.1 Web 仓内（4 文件，全部已治理）

| 文档 | 作用 |
|---|---|
| `README.md` | 仓库入口（已升级到 2026-04-28） |
| `10_Web端项目全面完整信息文档_2026-04-11.md` | 全面信息基线（已加 13 节复验补记） |
| `20_Web端功能完善开发计划_上线运营版.md` | 上线开发计划（已加 10 节复验补记） |
| `30_Web端与后端v2.0治理对齐说明.md` | **本文** |

### 10.2 后端仓（`xiaoe-education-master/docs/`）

| 主题 | 文档 |
|---|---|
| 后端开发统一总纲 | `17_后端开发统一总纲与收敛方案.md` |
| 五面契约权威源头 | `12_后端接口分层治理与迁移开发方案.md` |
| Gateway 路由与过滤器 | `04_gateway模块.md`（v2.0） |
| service Controller 索引（含 admin） | `05_service模块.md`（v2.0） |
| feign 接口（仅参考，Web 不调） | `03_feign模块.md`（v2.0） |
| service-course admin 端点 | `13_service-course模块开发方案.md` |
| service-user admin 端点 | `14_service-user模块开发方案.md` |
| service-system admin 端点 | `15_service-system模块开发方案.md` |
| 部署 runbook | `07_系统部署与升级.md`（v2.0） |
| 文档导航 | `README.md` |

### 10.3 Android 仓（`xiaoe-education-android/docs/`）

| 主题 | 文档 |
|---|---|
| 三端统一入口 | `22_项目基础信息与关键信息归档.md` |
| Android 与后端契约对齐 | `24_Android端与后端v2.0治理对齐说明.md` |
| 三端任务执行清单 | `19_三端完整开发与执行清单_优化版.md` |

### 10.4 工作区根

| 文件 | 作用 |
|---|---|
| `AGENTS.md` | 任意 AI agent 进入工作区前必读 |
| `.windsurf/rules/` | 7 条 rules（按文件类型自动加载） |
| `.windsurf/workflows/` | 10 条 skills（slash 命令） |

---

## 附录 A：admin 面 107 端点完整清单

> **生成方式**：从 `src/api/*.js` 实地提取，按"业务域 / 文件 / 函数 / 路径 / 方法"排列

### A.1 system 域（40 个）

```
login.js
  POST /system/admin/login/password                         登录
  GET  /system/admin/sys/user/current                       当前用户

system.js（35 个）
  POST   /system/admin/website/app/page                     APP 版本分页
  PUT    /system/admin/website/app/edit                     APP 版本修改
  POST   /system/admin/website/app/save                     APP 版本保存
  DELETE /system/admin/website/app/delete                   APP 版本删除
  POST   /system/admin/website/nav/page                     导航分页
  PUT    /system/admin/website/nav/edit                     导航修改
  PUT    /system/admin/website/nav/sort                     导航排序
  POST   /system/admin/website/nav/save                     导航保存
  DELETE /system/admin/website/nav/delete                   导航删除
  POST   /system/admin/website/carousel/page                轮播分页
  PUT    /system/admin/website/carousel/edit                轮播修改
  PUT    /system/admin/website/carousel/sort                轮播排序
  POST   /system/admin/website/carousel/save                轮播保存
  DELETE /system/admin/website/carousel/delete              轮播删除
  POST   /system/admin/website/link/page                    友情链接分页
  PUT    /system/admin/website/link/edit                    友情链接修改
  PUT    /system/admin/website/link/sort                    友情链接排序
  POST   /system/admin/website/link/save                    友情链接保存
  DELETE /system/admin/website/link/delete                  友情链接删除
  GET    /system/admin/sys/config/video/init                视频云初始化
  GET    /system/admin/sys/config/video/config              视频云配置
  POST   /system/admin/sys/config/list                      系统配置列表
  PUT    /system/admin/sys/config/edit                      系统配置编辑
  POST   /system/admin/sys/menu/list                        菜单列表
  POST   /system/admin/sys/menu/save                        菜单新增
  PUT    /system/admin/sys/menu/delete                      菜单删除（PUT 软删）
  PUT    /system/admin/sys/menu/edit                        菜单编辑
  POST   /system/admin/sys/menu/role/list                   角色权限查询
  POST   /system/admin/sys/menu/role/save                   分配菜单
  POST   /system/admin/sys/role/page                        角色分页
  POST   /system/admin/sys/role/save                        角色新增
  PUT    /system/admin/sys/role/delete                      角色删除（PUT 软删）
  PUT    /system/admin/sys/role/edit                        角色编辑
  PUT    /system/admin/sys/role/sort                        角色排序
  POST   /system/admin/sys/role/user/save                   用户分配角色
  POST   /system/admin/sys/role/user/list                   用户已分配角色
  POST   /system/admin/sys/user/page                        系统用户分页
  POST   /system/admin/sys/user/save                        系统用户新增
  PUT    /system/admin/sys/user/delete                      系统用户删除
  PUT    /system/admin/sys/user/edit                        系统用户编辑
  PUT    /system/admin/sys/user/sort                        系统用户排序
  PUT    /system/admin/sys/user/password                    系统用户改密
  POST   /system/admin/sys/log/page                         系统日志

dashboard.js（1 个）
  GET    /system/admin/stat/vod                             点播用量统计

upload.js（3 个）
  POST   /system/admin/upload/pic                           图片上传
  POST   /system/admin/upload/doc                           文档上传
  POST   /system/admin/upload/app                           APP 包上传
```

### A.2 user 域（29 个）

```
users.js（27 个）
  POST   /user/admin/users/account/consume/save            消费记录保存
  POST   /user/admin/users/account/consume/page            消费记录分页
  POST   /user/admin/lecturer/page                          讲师分页
  GET    /user/admin/lecturer/view                          讲师详情
  PUT    /user/admin/lecturer/edit                          讲师编辑
  PUT    /user/admin/lecturer/sort                          讲师排序
  POST   /user/admin/lecturer/save                          讲师新增
  DELETE /user/admin/lecturer/delete                        讲师删除
  POST   /user/admin/users/page                             学员分页
  PUT    /user/admin/users/edit                             学员编辑
  GET    /user/admin/users/view                             学员详情
  DELETE /user/admin/users/delete                           学员删除
  POST   /user/admin/users/log/page                         登录日志分页
  POST   /user/admin/order/info/page                        订单分页
  PUT    /user/admin/order/info/edit                        订单编辑
  GET    /user/admin/order/info/stat                        订单统计
  POST   /user/admin/wallet/withdraw/page                   提现分页
  GET    /user/admin/wallet/withdraw/view                   提现详情
  PUT    /user/admin/wallet/withdraw/pass                   提现通过
  PUT    /user/admin/wallet/withdraw/reject                 提现驳回
  GET    /user/admin/wallet/recharge/reconcile/stats        充值对账统计
  POST   /user/admin/wallet/recharge/reconcile/run          充值对账执行
  POST   /user/admin/msg/page                               消息分页
  GET    /user/admin/msg/view                               消息详情
  GET    /user/admin/msg/effect                             消息触达效果
  POST   /user/admin/msg/save                               消息保存
  POST   /user/admin/msg/dispatch                           消息投放
  PUT    /user/admin/msg/edit                               消息编辑
  DELETE /user/admin/msg/delete                             消息删除
  POST   /user/admin/msg/user/page                          消息投放对象分页

dashboard.js（2 个）
  GET    /user/admin/stat/data                              数据统计
  GET    /user/admin/stat/login                             登录注册统计
```

### A.3 course 域（38 个）

```
course.js（35 个）
  POST   /course/admin/zone/course/page                    专区课程分页
  PUT    /course/admin/zone/course/edit                    专区课程编辑
  PUT    /course/admin/zone/course/sort                    专区课程排序
  POST   /course/admin/zone/course/save                    专区课程新增
  DELETE /course/admin/zone/course/delete                  专区课程删除
  POST   /course/admin/zone/page                            专区分页
  PUT    /course/admin/zone/edit                            专区编辑
  PUT    /course/admin/zone/sort                            专区排序
  POST   /course/admin/zone/save                            专区新增
  DELETE /course/admin/zone/delete                          专区删除
  POST   /course/admin/category/list                       分类列表
  PUT    /course/admin/category/edit                       分类编辑
  POST   /course/admin/category/save                       分类新增
  DELETE /course/admin/category/delete                     分类删除
  PUT    /course/admin/category/sort                       分类排序
  POST   /course/admin/resource/page                       资源分页
  PUT    /course/admin/resource/edit                       资源编辑
  PUT    /course/admin/resource/sort                       资源排序
  PUT    /course/admin/resource/batch/edit                 资源批量移动
  POST   /course/admin/resource/save                       资源新增
  DELETE /course/admin/resource/delete                     资源删除
  PUT    /course/admin/resource/batch/delete               资源批量删除
  POST   /course/admin/course/chapter/period/list          课时列表
  PUT    /course/admin/course/chapter/period/edit          课时编辑
  POST   /course/admin/course/chapter/period/save          课时新增
  PUT    /course/admin/course/chapter/period/sort          课时排序
  DELETE /course/admin/course/chapter/period/delete        课时删除
  POST   /course/admin/course/chapter/list                 章节列表
  PUT    /course/admin/course/chapter/edit                 章节编辑
  PUT    /course/admin/course/chapter/sort                 章节排序
  POST   /course/admin/course/chapter/save                 章节新增
  DELETE /course/admin/course/chapter/delete               章节删除
  POST   /course/admin/course/page                         课程分页
  GET    /course/admin/course/view                         课程详情
  PUT    /course/admin/course/edit                         课程编辑
  PUT    /course/admin/course/sort                         课程排序
  POST   /course/admin/course/save                         课程新增
  DELETE /course/admin/course/delete                       课程删除
  POST   /course/admin/user/course/record                  用户学习记录
  GET    /course/admin/user/study/stat                     用户学习统计
  POST   /course/admin/user/study/page                     学习分页
  POST   /course/admin/user/course/comment/page            课程评论分页
  DELETE /course/admin/user/course/comment/delete          课程评论删除
  POST   /course/admin/user/course/collect/page            课程收藏分页
  GET    /course/admin/resource/preview                    素材预览

users.js（1 个，跨域调用）
  POST   /course/admin/user/course/page                    用户已购课程分页

upload.js（2 个）
  GET    /course/admin/resource/vod/config                 视频云配置
  POST   /course/admin/resource/save                       资源（视频云）保存
```

---

**文档结束**

*维护者：架构组 / 跨端协同 | 创建日期：2026-04-28（v1.0,基于实地代码勘察）*

---

## 11. 2026-05-01 数据校准补记（基于实地 axios 调用扫描）

> **维护原则**：本节是对 §3 / §A 数据的运行态校准，**不修改 §1-§10 任何治理规则与契约约定**。`src/api/*.js` 文件自 2026-04-28 §A 附录采集后已新增 22 个 axios 调用，本节给出 2026-05-01 实测真值与完整端点清单。

### 11.1 实地扫描方法

```powershell
# 统计 helper 调用（getRequest / postRequest / putRequest / deleteRequest / upload）
foreach ($f in Get-ChildItem 'src/api' -Filter '*.js') {
  $c = Get-Content $f.FullName -Raw
  $g = ([regex]::Matches($c, "getRequest\s*\(")).Count
  $p = ([regex]::Matches($c, "postRequest\s*\(")).Count
  $u = ([regex]::Matches($c, "putRequest\s*\(")).Count
  $d = ([regex]::Matches($c, "deleteRequest\s*\(")).Count
  $up = ([regex]::Matches($c, "(?<![A-Za-z])upload\s*\(")).Count
  ...
}
```

### 11.2 真实端点统计（2026-05-01）

| 文件 | 真实端点 | 30 号 §3.1 声明 | 偏差 |
|---|---|---|---|
| `src/api/login.js` | 4 | 4 | ✅ |
| `src/api/system.js` | 44 | 36 | ❌ +8 |
| `src/api/course.js` | 45 | 35 | ❌ +10 |
| `src/api/users.js` | 31 | 27 | ❌ +4 |
| `src/api/dashboard.js` | 3 | 3 | ✅ |
| `src/api/upload.js` | 5 | 5 | ✅ |
| **合计** | **132** | **110** | ❌ +22 |

### 11.3 按服务/面层分布（替代 §3.3）

| 服务 \ 面 | admin | legacy api | 合计 |
|---|---|---|---|
| service-system | 49 | 3 | **52** |
| service-user | 32 | 0 | **32** |
| service-course | 48 | 0 | **48** |
| **合计** | **129** | **3** | **132** |

**说明**：

- `service-system` admin 49 = `login.js`(2) + `system.js`(43) + `dashboard.js`(1, stat/vod) + `upload.js`(3, pic/doc/app)
- `service-user` admin 32 = `users.js`(31，含 1 跨域 `course/admin/user/course/page` 不计在 user 域，回归 30 后) + `dashboard.js`(2, stat/data + stat/login) - 1（跨域归 course）= 32
- `service-course` admin 48 = `course.js`(45) + `users.js`(1，跨域 `course/admin/user/course/page`) + `upload.js`(2, resource/save + resource/vod/config)
- legacy api 3 = `login.js`(2: `website` + `code`) + `system.js`(1: `enum`)

### 11.4 完整端点清单（132 项，2026-05-01 实测）

> **本节替代 §A 附录**——§A 附录已过期，新清单按服务+方法+路径排序。

#### 11.4.1 service-system / admin（49 个）

```
GET    /system/admin/stat/vod                            [dashboard.js]  点播用量统计
GET    /system/admin/sys/config/video/config             [system.js]     视频云配置
GET    /system/admin/sys/config/video/init               [system.js]     视频云初始化
GET    /system/admin/sys/user/current                    [login.js]      当前用户
POST   /system/admin/login/password                      [login.js]      密码登录
POST   /system/admin/sys/config/list                     [system.js]     系统配置列表
POST   /system/admin/sys/log/page                        [system.js]     系统日志分页
POST   /system/admin/sys/menu/list                       [system.js]     菜单列表
POST   /system/admin/sys/menu/role/list                  [system.js]     角色权限查询
POST   /system/admin/sys/menu/role/save                  [system.js]     分配菜单
POST   /system/admin/sys/menu/save                       [system.js]     菜单新增
POST   /system/admin/sys/role/page                       [system.js]     角色分页
POST   /system/admin/sys/role/save                       [system.js]     角色新增
POST   /system/admin/sys/role/user/list                  [system.js]     用户已分配角色
POST   /system/admin/sys/role/user/save                  [system.js]     用户分配角色
POST   /system/admin/sys/user/page                       [system.js]     系统用户分页
POST   /system/admin/sys/user/save                       [system.js]     系统用户新增
POST   /system/admin/upload/app                          [upload.js]     APP 包上传
POST   /system/admin/upload/doc                          [upload.js]     文档上传
POST   /system/admin/upload/pic                          [upload.js]     图片上传
POST   /system/admin/website/app/page                    [system.js]     APP 版本分页
POST   /system/admin/website/app/save                    [system.js]     APP 版本保存
POST   /system/admin/website/carousel/page               [system.js]     轮播分页
POST   /system/admin/website/carousel/save               [system.js]     轮播保存
POST   /system/admin/website/link/page                   [system.js]     友情链接分页
POST   /system/admin/website/link/save                   [system.js]     友情链接保存
POST   /system/admin/website/nav/page                    [system.js]     导航分页
POST   /system/admin/website/nav/save                    [system.js]     导航保存
PUT    /system/admin/sys/config/edit                     [system.js]     系统配置编辑
PUT    /system/admin/sys/menu/delete                     [system.js]     菜单软删
PUT    /system/admin/sys/menu/edit                       [system.js]     菜单编辑
PUT    /system/admin/sys/role/delete                     [system.js]     角色软删
PUT    /system/admin/sys/role/edit                       [system.js]     角色编辑
PUT    /system/admin/sys/role/sort                       [system.js]     角色排序
PUT    /system/admin/sys/user/delete                     [system.js]     系统用户软删
PUT    /system/admin/sys/user/edit                       [system.js]     系统用户编辑
PUT    /system/admin/sys/user/password                   [system.js]     系统用户改密
PUT    /system/admin/sys/user/sort                       [system.js]     系统用户排序
PUT    /system/admin/website/app/edit                    [system.js]     APP 版本修改
PUT    /system/admin/website/carousel/edit               [system.js]     轮播修改
PUT    /system/admin/website/carousel/sort               [system.js]     轮播排序
PUT    /system/admin/website/link/edit                   [system.js]     友情链接修改
PUT    /system/admin/website/link/sort                   [system.js]     友情链接排序
PUT    /system/admin/website/nav/edit                    [system.js]     导航修改
PUT    /system/admin/website/nav/sort                    [system.js]     导航排序
DELETE /system/admin/website/app/delete                  [system.js]     APP 版本删除
DELETE /system/admin/website/carousel/delete             [system.js]     轮播删除
DELETE /system/admin/website/link/delete                 [system.js]     友情链接删除
DELETE /system/admin/website/nav/delete                  [system.js]     导航删除
```

#### 11.4.2 service-user / admin（32 个）

```
GET    /user/admin/lecturer/view                         [users.js]      讲师详情
GET    /user/admin/msg/effect                            [users.js]      消息触达效果
GET    /user/admin/msg/view                              [users.js]      消息详情
GET    /user/admin/order/info/stat                       [users.js]      订单统计
GET    /user/admin/stat/data                             [dashboard.js]  数据统计
GET    /user/admin/stat/login                            [dashboard.js]  登录注册统计
GET    /user/admin/users/view                            [users.js]      学员详情
GET    /user/admin/wallet/recharge/reconcile/stats       [users.js]      充值对账统计
GET    /user/admin/wallet/withdraw/view                  [users.js]      提现详情
POST   /user/admin/lecturer/page                         [users.js]      讲师分页
POST   /user/admin/lecturer/save                         [users.js]      讲师新增
POST   /user/admin/msg/dispatch                          [users.js]      消息投放
POST   /user/admin/msg/page                              [users.js]      消息分页
POST   /user/admin/msg/save                              [users.js]      消息保存
POST   /user/admin/msg/user/page                         [users.js]      消息投放对象分页
POST   /user/admin/order/info/page                       [users.js]      订单分页
POST   /user/admin/users/account/consume/page            [users.js]      消费记录分页
POST   /user/admin/users/account/consume/save            [users.js]      消费记录保存
POST   /user/admin/users/log/page                        [users.js]      登录日志分页
POST   /user/admin/users/page                            [users.js]      学员分页
POST   /user/admin/wallet/recharge/reconcile/run         [users.js]      充值对账执行
POST   /user/admin/wallet/withdraw/page                  [users.js]      提现分页
PUT    /user/admin/lecturer/edit                         [users.js]      讲师编辑
PUT    /user/admin/lecturer/sort                         [users.js]      讲师排序
PUT    /user/admin/msg/edit                              [users.js]      消息编辑
PUT    /user/admin/order/info/edit                       [users.js]      订单编辑
PUT    /user/admin/users/edit                            [users.js]      学员编辑
PUT    /user/admin/wallet/withdraw/pass                  [users.js]      提现通过
PUT    /user/admin/wallet/withdraw/reject                [users.js]      提现驳回
DELETE /user/admin/lecturer/delete                       [users.js]      讲师删除
DELETE /user/admin/msg/delete                            [users.js]      消息删除
DELETE /user/admin/users/delete                          [users.js]      学员删除
```

#### 11.4.3 service-course / admin（48 个）

```
GET    /course/admin/course/view                         [course.js]     课程详情
GET    /course/admin/resource/preview                    [course.js]     素材预览
GET    /course/admin/resource/vod/config                 [upload.js]     视频云配置
GET    /course/admin/user/study/stat                     [course.js]     用户学习统计
POST   /course/admin/category/list                       [course.js]     分类列表
POST   /course/admin/category/save                       [course.js]     分类新增
POST   /course/admin/course/chapter/list                 [course.js]     章节列表
POST   /course/admin/course/chapter/period/list          [course.js]     课时列表
POST   /course/admin/course/chapter/period/save          [course.js]     课时新增
POST   /course/admin/course/chapter/save                 [course.js]     章节新增
POST   /course/admin/course/page                         [course.js]     课程分页
POST   /course/admin/course/save                         [course.js]     课程新增
POST   /course/admin/resource/page                       [course.js]     资源分页
POST   /course/admin/resource/save                       [course.js]     资源新增（基础）
POST   /course/admin/resource/save                       [upload.js]     资源新增（视频云）
POST   /course/admin/user/course/collect/page            [course.js]     课程收藏分页
POST   /course/admin/user/course/comment/page            [course.js]     课程评论分页
POST   /course/admin/user/course/page                    [users.js]      用户已购课程分页（跨域）
POST   /course/admin/user/course/record                  [course.js]     用户学习记录
POST   /course/admin/user/study/page                     [course.js]     学习分页
POST   /course/admin/zone/course/page                    [course.js]     专区课程分页
POST   /course/admin/zone/course/save                    [course.js]     专区课程新增
POST   /course/admin/zone/page                           [course.js]     专区分页
POST   /course/admin/zone/save                           [course.js]     专区新增
PUT    /course/admin/category/edit                       [course.js]     分类编辑
PUT    /course/admin/category/sort                       [course.js]     分类排序
PUT    /course/admin/course/chapter/edit                 [course.js]     章节编辑
PUT    /course/admin/course/chapter/period/edit          [course.js]     课时编辑
PUT    /course/admin/course/chapter/period/sort          [course.js]     课时排序
PUT    /course/admin/course/chapter/sort                 [course.js]     章节排序
PUT    /course/admin/course/edit                         [course.js]     课程编辑
PUT    /course/admin/course/sort                         [course.js]     课程排序
PUT    /course/admin/resource/batch/delete               [course.js]     资源批量删除
PUT    /course/admin/resource/batch/edit                 [course.js]     资源批量移动
PUT    /course/admin/resource/edit                       [course.js]     资源编辑
PUT    /course/admin/resource/sort                       [course.js]     资源排序
PUT    /course/admin/zone/course/edit                    [course.js]     专区课程编辑
PUT    /course/admin/zone/course/sort                    [course.js]     专区课程排序
PUT    /course/admin/zone/edit                           [course.js]     专区编辑
PUT    /course/admin/zone/sort                           [course.js]     专区排序
DELETE /course/admin/category/delete                     [course.js]     分类删除
DELETE /course/admin/course/chapter/delete               [course.js]     章节删除
DELETE /course/admin/course/chapter/period/delete        [course.js]     课时删除
DELETE /course/admin/course/delete                       [course.js]     课程删除
DELETE /course/admin/resource/delete                     [course.js]     资源删除
DELETE /course/admin/user/course/comment/delete          [course.js]     课程评论删除
DELETE /course/admin/zone/course/delete                  [course.js]     专区课程删除
DELETE /course/admin/zone/delete                         [course.js]     专区删除
```

#### 11.4.4 legacy api（3 个，**冻结**）

```
GET    /system/api/common/code                           [login.js]      图形验证码
GET    /system/api/sys/config/website                    [login.js]      站点配置
POST   /system/api/common/enum                           [system.js]     通用枚举字典
```

### 11.5 与 §A 附录的差异分析

§A 附录列出 110 个端点，本节列出 132 个，差 22 个。差异源于 §A 采集时（2026-04-28）后，`src/api/*.js` 在 W2-W3 期间新增了 22 个 axios 调用。**§A 附录保留作为历史快照，本节 §11.4 是 2026-05-01 实测真值**。

> **未来读者**：以本节 §11.4 为准；§A 附录仅供历史对照。

### 11.6 与后端 admin 端点基线（19 号）的对照

后端 19 号端点基线（2026-04-29）声明 admin 总数 = 203（W3 后 +3 = **206**）。Web 端调用 admin = 129。**差额 77 个 admin 端点是 Web 端尚未对接的后端能力**——这些是后端 admin 面"完整 CRUD"的产物（W2 service-course CRUD 完整化补齐了大量 sort/save/delete/edit）。Web 端按业务需要选择性对接，**不是偏差**。

**已确认的 Web 端待对接清单**（与上轮 §8 偏差 #6 一致）：

| 端点 | 后端 Controller | Web 端缺失页面 |
|---|---|---|
| `PUT /user/admin/order/pay/refund` | `AdminOrderPayController` | `views/users/record/Order/RefundDialog.vue`（待新建） |
| `GET /user/admin/order/pay/refund/query` | 同上 | 同上 |
| `PUT /user/admin/order/pay/close` | 同上 | `views/users/record/Order/index.vue`（待新增按钮） |

### 11.7 后续维护建议

1. **W4 启动前**：W4 阶段会引入 admin 102 端点回归任务；建议本文 §11.4 同步刷新一次（每次 `src/api/*.js` 改动 ±3 必须更新）
2. **新增 axios 调用**：必须同时更新本文 §11.4 + §3.1 表格
3. **删除 axios 调用**：本节保留历史，新条目标注 `(已废弃)`，不直接删除
4. **跨文档同步**：本文 §11.4 数据应向 10 号 §13.3 与 20 号 §10.3 反向同步引用

> **本节维护人**：架构组 / 跨端协同  
> **首次落盘日期**：2026-05-01  
> **下次预期更新**：W4 admin 端点回归任务完成时
