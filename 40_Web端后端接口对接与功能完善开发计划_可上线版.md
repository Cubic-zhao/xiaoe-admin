<!-- markdownlint-disable MD013 MD024 MD032 MD040 -->
# 40 号 Web 端后端接口对接与功能完善开发计划（可上线版）

**文档版本**：v1.0  
**创建日期**：2026-05-05  
**适用项目**：`d:/MyProject/Program/XiaoE/Xiaoe-education-release/xiaoe-education-admin`

**对齐基准**：

- 后端端点基线 `xiaoe-education-master/docs/19_后端端点审计基线_2026-04-29.md`（admin 总数 206，含 W3 增量 +3）
- Web 端契约对齐 `30_Web端与后端v2.0治理对齐说明.md`（v1.0 + §11，2026-05-01 实测 132 axios：admin 129 + legacy api 3）
- 治理权威 `xiaoe-education-master/docs/12_后端接口分层治理与迁移开发方案.md`

> **本文与既有 Web 文档的关系**：  
> - **不替代** 10 号《Web 端项目全面完整信息文档》（项目全景）  
> - **不替代** 20 号《Web 端功能完善开发计划_上线运营版》（治理向 WEB-01~06）  
> - **不替代** 30 号《Web 端与后端 v2.0 治理对齐说明》（132 端点对应矩阵）  
> - **本文专攻**：以"逐模块 ↔ 已有页面 ↔ 已对接 axios ↔ 后端真实端点"为单元，登记 **真实可上线** 所需补齐的接口对接 / 字段完整 / 状态机 / 错误态 / 验收证据，**不引入项目本身没有的功能**

---

## 0. 文档定位与执行原则

### 0.0 关键决策（2026-05-06 用户明示，全文级联）

| 决策 | 内容 | 对 Web 端影响 |
|---|---|---|
| **U-5=C** | **本期不做视频功能** | 课时类型 `periodType` 仅启用图文（§6.3 D-3）；资源类型 `resourceType` 仅启用图片+文档（§6.4 D-4）；sys_config `video` 分组 polyv 配置本期不启用（§5.4 C-4）；`videoInit`/`videoConfig`/`getVodConfig` axios 保留但运营页面不调用 |
| **U-1/U-2/U-4** | 微信登录/推送 SDK/暗色模式本期不做 | 与 Web 端无直接关系（Web 无登录第三方 SDK / 无推送 / 默认明色） |
| **U-3=A** | Android 埋点本期纳入（自研端点） | 与 Web 端无直接对接，Web 自有 `sysLogPage` 操作日志体系，无需新增埋点 |

> **三端协调**：Android 26 号 §15.2、iOS（暂未接入）与 Web 40 号本节保持口径一致；任一端发现冲突 → 优先以本节为准。

### 0.1 唯一交付目标

让 **Web 管理端 132 个 axios 调用**全部满足：

1. **L5 curl 通过**：经 Gateway 真实路径返回 `code=200` + 关键字段非空
2. **L6 端侧通过**：Web 页面真实操作（增删改查 / 排序 / 启停 / 审核）能完成业务闭环
3. **错误态完整**：`code=301/302/303/304/305/306` 与各业务码均有页面级响应（重试 / 跳登录 / 提示）
4. **数据一致**：列表 / 详情 / 弹窗 / 排序 / 启停后页面与数据库状态同步

### 0.2 边界（不做的事）

1. **不新增**项目本身没有的功能（如统计大盘、AI 推荐——后端没有就不做）
2. **不调** mobile 面（移动端专属）/ feign 面（被网关拦截）
3. **不在** legacy `api/` 面新增端点（仅保留现有 `website` / `code` / `enum` 3 个）
4. **不**重构 `request.js` token 注入与 `301-306` 错误码处理（已与后端 `ResultEnum` 对齐）
5. **不**改动 `vite.config.js` / `nginx.conf` 代理（已稳定）
6. **不写** mock / TODO / 占位 / 伪成功（违反 `05_no_mock_todo.md` 红线）

### 0.3 与 20 号文档（运营治理 6 任务）的分工

| 文档 | 主线 | 范围 |
|---|---|---|
| 20 号 | WEB-01~06 治理（运营字段语义化 / Teacher 策略 / 提现复盘 / 订单异常治理 / 消息触达 / 发布门禁） | 偏"运营级" |
| **40 号（本文）** | **132 axios 全量对接验收 + 缺口补齐** | 偏"工程级" |

20 号 6 任务在本文按"完善任务"列在对应模块章节里；本文补齐余下 **15 个工程模块**的接口对接验收，与 20 号互补，不冲突。

### 0.4 命名约定

- **后端端点**：`[METHOD] /service/face/path`（出处：19 号端点基线）
- **前端调用**：`axios函数名` + 文件:行（出处：`src/api/*.js`）
- **页面**：`views/...` 路径
- **状态标记**：✅ 已对接闭环 / 🟡 已对接但有缺口 / ⏸ 未对接（后端能力未用）/ ❌ 缺失能力

---

## 1. Web 端真实代码基线

### 1.1 工程基线

- 包名 `roncoo-education-admin` v25.0.0-RELEASE
- Vue 3.4.21 + Vite 5.2.14 + Pinia 2.1.7 + Vue Router 4.3.0（Hash）
- Element Plus 2.6.3 + Axios 1.7.4（baseURL `/gateway`）+ wangEditor 5 + ECharts 5
- 上传：simple-uploader 0.6.0 + @polyv/vod-upload-js-sdk 1.6.0
- 加密：jsencrypt 3.2.1（密码 RSA）

### 1.2 132 axios 端点真实分布（30 号 §11.4）

| 服务 \ 面 | admin | legacy api | 合计 |
|---|---|---|---|
| service-system | 49 | 3 | **52** |
| service-user | 32 | 0 | **32** |
| service-course | 48 | 0 | **48** |
| **合计** | **129** | **3** | **132** |

### 1.3 后端能力对照（19 号端点基线 + W3 增量）

| 服务 | 后端 admin 总数 | Web 已对接 | 差额（未对接） |
|---|---|---|---|
| service-system | 62 | 49 | **13** |
| service-user | 66（63 + W3 +3） | 32 | **34** |
| service-course | 78 | 48 | **30** |
| **合计** | **206** | **129** | **77** |

> **77 个未对接 = 后端"完整 CRUD"产物**：W2 service-course 完整化补齐了大量 `view/sort/save/delete` 系列。Web 按业务需要选择性对接，**不是偏差**。本文 §8 列"未对接"参考清单。

---

## 2. 总体阶段与排期

| 阶段 | 工期 | 内容 | 出口 |
|---|---|---|---|
| **P0 阻塞清零** | 1 周 | §3 登录 + §4 Dashboard + §7.6 退款 3 端点 | L5 全过 + 5 条核心路径可演示 |
| **P1 核心 CRUD** | 2 周 | §5-§7 全模块 admin 已对接端点 L5 验收 | 132 axios 全部 L5 ✅ + 主流程 L6 ✅ |
| **P2 治理 + 缺口补齐** | 1.5 周 | 20 号 WEB-01~06 闭环 + §7.6 退款 UI | 20 号阶段 A/B Gate 通过 |
| **P3 全链路回归 + 上线门禁** | 1 周 | §12 上线门禁 7 项 | `/release-readiness` 7 项全 ✅ |

**进入 P1 必要前置**（来自后端）：

| 前置 | 状态 | 解除条件 |
|---|---|---|
| MariaDB / Redis / Nacos 真启动 | ⏸ | `/start-local-backend` 4 服务 actuator UP |
| `xiaoe_education` 库基线 schema 执行 | ⏸ | `docs/sql/20260423_release_base_schema.sql` 已 source |
| W3 增量 SQL 已执行 | ⏸ | `docs/sql/20260501_admin_order_pay_refund_seed.sql` |
| Web 本地 `npm run dev` 代理到 gateway:7700 | ✅ | `vite.config.js` proxy `/gateway` 已配置 |

---

## 3. 模块 A：登录鉴权（4 端点）

### 3.1 端点矩阵

| axios | 路径 | 方法 | 后端 Controller | 状态 |
|---|---|---|---|---|
| `loginApi.getWebsite` | `/system/api/sys/config/website` | GET | `ApiSysConfigController` | ✅ |
| `loginApi.getCodeImg` | `/system/api/common/code` | GET | `ApiCommonController` | ✅ |
| `loginApi.login` | `/system/admin/login/password` | POST | `AdminLoginController` | ✅ |
| `loginApi.getUserInfo` | `/system/admin/sys/user/current` | GET | `AdminSysUserController` | ✅ |

### 3.2 完善任务

| # | 任务 | 文件 | 验收 |
|---|---|---|---|
| **A-1** | 登录密码 RSA 加密：`jsencrypt` 已在 package.json，确认 `views/login/index.vue` 提交前已对 `password` 加密 | `src/views/login/index.vue` | L5 抓包密文 + 后端 `AdminLoginBiz` decrypt 成功 |
| **A-2** | 验证码刷新：登录失败 → 自动 `getCodeImg()`；超时 60s 自动刷新 | 同上 | L6：连续输错 3 次密码后图变化 |
| **A-3** | `routerList.component` 不存在时降级（已有 `MissingRouteView`），补埋点 | `src/router/index.js:89-126` | L6：菜单元数据故意填错 → 跳 404View 而非白屏 |
| **A-4** | Token 过期跳登录后回跳：`history.fullPath` 写到登录跳转 query | `src/utils/request.js` + 登录页 | L6：详情页 token 失效 → 操作 → 跳登录 → 登录后回该详情 |
| **A-5** | `code=302~305` 异地登录 / 菜单过期文案统一 | `src/utils/request.js` | L6：模拟 302 → ElMessageBox → 用户登出 |

### 3.3 L1-L7

- L1-L2 ✅（4 端点代码已落地，`npm run build` 通过）
- L4 ⏸ 待 service-system 启动
- L5 ⏸ `curl http://localhost:7700/system/admin/login/password -H "Content-Type: application/json" -d '{"loginName":"admin","password":"<rsa>"}'` → `code=200` + `data.token` 非空
- L6 ⏸ 浏览器实操登录全流程
- L7 N/A

---

## 4. 模块 B：Dashboard 工作台（3 端点）

### 4.1 端点矩阵

| axios | 路径 | 方法 | Controller | 状态 |
|---|---|---|---|---|
| `statApi.data` | `/user/admin/stat/data` | GET | `AdminStatController` (user) | ✅ |
| `statApi.login` | `/user/admin/stat/login?dates=-14` | GET | 同上 | ✅ |
| `statApi.vod` | `/system/admin/stat/vod` | GET | `AdminStatController` (system) | ✅ |

### 4.2 完善任务

| # | 任务 | 验收 |
|---|---|---|
| **B-1** | `statApi.login` 时间硬编码 `-14`，改为下拉切换 7/14/30/60/90 | L6：切换 30 天 → ECharts 重绘 30 个数据点 |
| **B-2** | 接口失败时 → 卡片显示"暂无数据"占位（不空白也不报错弹窗） | L6：模拟接口 500 → 卡片显示降级文案 |
| **B-3** | 卡片数据 5 分钟自动刷新 | L6：F12 看 5min 后再次发出三个 stat 请求 |

### 4.3 L1-L7

- L1-L2 ✅
- L4 ⏸ 待 service-user + service-system 启动
- L5 ⏸ 三接口分别 curl 返回 `code=200`
- L6 ⏸ 工作台首屏 3 卡片均有真实数字

---

## 5. 模块 C：System 系统管理（49 端点）

### 5.1 sys-user 系统用户（7 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `sysUserPage` | `POST /system/admin/sys/user/page` | ✅ |
| `sysUserSave` | `POST /system/admin/sys/user/save` | ✅ |
| `sysUserEdit` | `PUT /system/admin/sys/user/edit` | ✅ |
| `sysUserDelete` | `PUT /system/admin/sys/user/delete` | ✅ |
| `sysUserSort` | `PUT /system/admin/sys/user/sort` | ✅ |
| `sysUserPassword` | `PUT /system/admin/sys/user/password` | ✅ |
| `sysRoleUserSave` / `sysRoleUserList` | `POST /system/admin/sys/role/user/{save,list}` | ✅ |

**完善**：

- **C1-1** 改密：新密码 RSA 加密后再 PUT（与登录一致）
- **C1-2** 删除（PUT 软删 status_id=0）确认弹窗文案明确"软删除可恢复"
- **C1-3** 系统用户分配角色后 → 当前用户若是被改对象则提示 force-logout

### 5.2 sys-role 角色（6 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `sysRolePage` / `sysRoleSave` / `sysRoleEdit` / `sysRoleDelete` / `sysRoleSort` | 5 个 | ✅ |
| `sysMenuRoleList` / `sysMenuRoleSave` | `POST /system/admin/sys/menu/role/{list,save}` | ✅ |

**完善**：

- **C2-1** 删除前后端校验绑定用户数；前端展示"绑定 N 个用户"二次确认
- **C2-2** 分配菜单弹窗：树形勾选 + 半选；提交支持"全选/反选/清空"

### 5.3 sys-menu 菜单（4 已对接 + 1 缺）

| axios | 路径 | 状态 |
|---|---|---|
| `sysMenuList` / `sysMenuSave` / `sysMenuEdit` / `sysMenuDelete` | 4 个 | ✅ |
| （未对接） | `PUT /system/admin/sys/menu/sort` | ⏸ |

**完善**：

- **C3-1** 补 axios `sysMenuSort` + 列表行内上下移按钮
- **C3-2** `path` / `component` 字符串前端预校验"不以 / 结尾"等
- **C3-3** 删除前提示：删除菜单 = 立即对所有角色生效，二次确认

### 5.4 sys-config 系统配置（4 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `sysConfigList` | `POST /system/admin/sys/config/list` | ✅ |
| `sysConfigEdit` | `PUT /system/admin/sys/config/edit` | ✅ |
| `videoInit` | `GET /system/admin/sys/config/video/init` | ✅ |
| `videoConfig` | `GET /system/admin/sys/config/video/config` | ✅ |

**未对接**：`page/save/delete/view` 4 个（运营基本不需要，OK）

**完善**：

- **C4-1** 按 `group_code` 分组。原五大组本期实际只启用 `payment`/`wechat`/`sms`/`oss` 四组；**`video` 组（polyv 凭证）本期不启用**（Android U-5=C 本期不做视频功能）——运营面板上可隐藏 `video` 分组 tab 或展示但标记"下期开启"
- **C4-2** 敏感字段（`*_secret_key`/`*_password`）显示 `******`，编辑强制重新输入
- **C4-3** ~~`videoInit` 失败 → 引导"先在 sys_config 配置 polyv"~~ — **（U-5=C 撤销）** `videoInit` / `videoConfig` axios 保留但本期不调用；资源库页面（§6.4）不出现视频上传按钮
- **C4-4**（20 号 WEB-06）发布门禁面板复用 sys_config 中 `release_gate_*`（已有 `releaseGateTemplate.js`）

### 5.5 sys-log 系统日志（1 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `sysLogPage` | `POST /system/admin/sys/log/page` | ✅ |

**完善**：

- **C5-1** 列表筛选：操作人 / 时间 / 类型 / 模块（后端已支持）
- **C5-2** `request_body` 过长截断 + 详情弹窗

### 5.6 website 运营位（21 端点：app/nav/carousel/link 各 5-6 端点）

| 业务 | axios | 后端 | 状态 |
|---|---|---|---|
| `website/app` | 4 | 6 | 🟡 缺 sort/view |
| `website/nav` | 5 | 6 | 🟡 缺 view |
| `website/carousel` | 5 | 6 | 🟡 缺 view |
| `website/link` | 5 | 6 | 🟡 缺 view |

**完善**：

- **C6-1**（20 号 WEB-01）轮播 + 导航字段语义化：`utils/mobileOpsFieldAdapter.js` 已就绪，需在 `views/common/carousel/edit.vue` 与 `views/common/nav/edit.vue` 接入：
  - 表单：`targetType` 下拉（外链/课程/讲师/活动/H5）+ `targetId` 选择器（按 type 联动）+ `link`（外链/H5 用）+ `action` + `sort` + `status`
  - 提交前 `validateMobileOpsForm()`
  - 列表 `describeMobileOps(rawLink)` 中文标签
- **C6-2** 排序：`sort` 越小越靠前，列表按 `sort asc` 默认排序
- **C6-3** APP 版本 `appType+versionCode` 唯一性校验

### 5.7 upload 文件上传（3 端点）

| axios | 路径 | 用途 | 状态 |
|---|---|---|---|
| `uploadApi.pic` | `POST /system/admin/upload/pic` | 图片 | ✅ |
| `uploadApi.doc` | `POST /system/admin/upload/doc` | 文档 | ✅ |
| `uploadApi.app` | `POST /system/admin/upload/app` | APK/IPA | ✅ |

**完善**：

- **C7-1** 上传进度回调（`onUploadProgress`）真实绑定 ElProgress
- **C7-2** 失败 3 次自动重试 + 保留 file 不重选
- **C7-3** 大文件分片：`apk/ipa` >50MB 走 simple-uploader 分片
- **C7-4** 类型与大小校验：图片 ≤2MB / 文档 ≤20MB / APK ≤200MB

### 5.8 模块 C 验收

- L5 全过：49 端点 curl `code=200`
- L6 全过：菜单/角色/用户/配置/日志/运营位/上传 7 子模块 CRUD
- L7 N/A（仅 video init 涉及 polyv 第三方）

---

## 6. 模块 D：Course 课程管理（48 端点）

### 6.1 course 课程主表（6 已对接 + 1 缺）

| 页面 | axios | 路径 | 状态 |
|---|---|---|---|
| `views/course/list/index.vue` | `coursePage` | `POST /course/admin/course/page` | ✅ |
| 编辑弹窗 | `courseView` | `GET /course/admin/course/view` | ✅ |
| 同上 | `courseSave` | `POST /course/admin/course/save` | ✅ |
| 同上 | `courseEdit` | `PUT /course/admin/course/edit` | ✅ |
| 列表行 | `courseSort` | `PUT /course/admin/course/sort` | ✅ |
| 同上 | `courseDelete` | `DELETE /course/admin/course/delete` | ✅ |
| （缺口） | （未对接） | `GET /course/admin/course/sync-es` | ⏸ |

**完善**：

- **D1-1** 课程编辑字段（按 `course` 表）：`courseName` / `courseImg` / `coursePrice` / `originalPrice` / `subjectId` / `subSubjectId` / `lecturerId` / `courseDescription`（富文本）/ `chargeType` / `isFree` / `isShelf`（上下架）/ `sort`
- **D1-2** wangEditor 富文本插入图片：调 `uploadApi.pic` 自动上传 + 返回 url
- **D1-3** 上下架状态切换：列表行"上架/下架"按钮直接 `courseEdit({id, isShelf:1/0})`
- **D1-4** 删除前置：若该课程下有学习记录 / 订单 → 提示"含 N 笔订单，仅允许下架不可删除"
- **D1-5**（缺口）补"手动同步 ES"按钮 → `getRequest('/course/admin/course/sync-es?id=xxx')`
- **D1-6** ES 同步失败不应阻断保存（后端已实现降级），前端橙色 toast"已保存到 DB，ES 同步异常请稍后重试"

### 6.2 category 分类（5 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `categoryList` / `categorySave` / `categoryEdit` / `categoryDelete` / `categorySort` | 5 个 | ✅ |

**未对接**：`page/view`（树形结构无需分页与 view，OK）

**完善**：

- **D2-1** 树形结构（`parent_id` + `level`），列表用树形展示
- **D2-2** 删除前校验：分类下有子分类 / 课程 → 拦截
- **D2-3** Web 改动后移动端首页"学科"应实时变化（后端清缓存 / 设短 TTL）

### 6.3 course/chapter + course/chapter/period（11 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `courseChapterList/Save/Edit/Sort/Delete` | 5 个 | ✅ |
| `courseChapterPeriodList/Save/Edit/Sort/Delete` | 5 个 | ✅ |
| （未对接） | `page` / `view` | ⏸ |

**完善**：

- **D3-1** 章节-课时嵌套（一对多），用 `el-tree` 或两级表格
- **D3-2** 课时类型 `periodType`：**本期仅启用 3=图文**；1=视频（U-5=C 本期不做视频）与 2=直播（后端 live 未对接）在课时表单 `periodType` 下拉选项中置灰不可选中 + 提示"课时仅支持图文类型，视频/直播下期上线"
- **D3-3** ~~视频课时保存前校验 `resourceId`~~ — **（U-5=C 撤销）** 本期不产生视频课时
- **D3-4** 图文课时表单：标题 + wangEditor 富文本内容 + 附件（调 `uploadApi.doc/pic`）
- **D3-5** 双层排序：章节内课时 + 课程内章节

### 6.4 resource 资源库（10 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `resourcePage/Save/Edit/Sort/Delete/BatchEdit/BatchDelete/Preview` | 8 个 | ✅ |
| `uploadApi.getVodConfig` | `GET /course/admin/resource/vod/config` | ✅ |
| `uploadApi.saveResource` | `POST /course/admin/resource/save` | ✅ |

**完善**：

- **D4-1** 资源类型 `resourceType`：**本期仅启用 2=文档 / 3=图片**；1=视频（polyv VOD）—— **U-5=C 撤销**，表单下拉选项中置灰不可选，提示"视频资源下期上线"
- **D4-2** ~~视频上传链路~~ — **（U-5=C 撤销）** `uploadApi.getVodConfig` / polyv SDK 不调用；`@polyv/vod-upload-js-sdk` 依赖保留不卸载（后期复用）但不 import
- **D4-3** ~~polyv 转码状态轮询~~ — **（U-5=C 撤销）**
- **D4-4** 批量移动：勾选多行 → 输入目标分类 → `resourceBatchEdit({ids:[...], categoryId:xxx})`（仅限文档+图片资源）
- **D4-5** 批量删除：勾选 → 二次确认 → `resourceBatchDelete({ids:[...]})`
- **D4-6** 预览：图片用图片预览组件；文档新窗口 `getRequest('/course/admin/resource/preview?id=xxx')`；**视频本期不预览**

### 6.5 zone 专区 + zone/course（10 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `zonePage/Save/Edit/Sort/Delete` | 5 个 | ✅ |
| `zoneCoursePage/Save/Edit/Sort/Delete` | 5 个 | ✅ |

**完善**：

- **D5-1** 专区编辑：`zoneName` / `zoneImg` / `zoneDescription` / `sort` / `status`
- **D5-2** 专区课程绑定：弹窗调 `coursePage` 模糊搜索 + 多选 + 批量提交
- **D5-3** 专区课程内 `zone_course.sort` 独立于 `course.sort`

### 6.6 user/course 学员课程关系（5 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `userCoursePage` | `POST /course/admin/user/course/page` | ✅ |
| `userCourseRecord` | `POST /course/admin/user/course/record` | ✅ |
| `courseCommentDelete` | `DELETE /course/admin/user/course/comment/delete` | ✅ |
| `userCourseComment` | `POST /course/admin/user/course/comment/page` | ✅ |
| `userCourseCollect` | `POST /course/admin/user/course/collect/page` | ✅ |

**完善**：

- **D6-1** `views/course/record/*.vue` 5 子页对接 5 axios（已对接），表格补字段：`userMobile` / `courseName` / `studyProgress` / `lastStudyTime`
- **D6-2** 评论删除 = 逻辑删除，禁止重复删除
- **D6-3** 收藏列表只读（不允许 admin 删除用户收藏）

### 6.7 user/study 学习进度（2 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `userStudyPage` | `POST /course/admin/user/study/page` | ✅ |
| `userStudyStat` | `GET /course/admin/user/study/stat?userId=xxx` | ✅ |

**完善**：

- **D7-1** 学员维度：进入学员详情 → `userStudyStat?userId=xxx` → 已学课程数 / 学习时长 / 完成率 卡片
- **D7-2** 课程维度：`userStudyPage({courseId})` → 该课程下学员进度列表

### 6.8 模块 D 验收

- L5 全过：48 端点 curl 通过（含 `videoInit`/`videoConfig`/`getVodConfig` 3 端点在后端仍可返回 200，但 Web 本期不从运营页面调用）
- L6 全过：课程 + 章节（仅图文课时）+ 资源（仅图片+文档）+ 专区 + 评论 + 收藏 + 进度统计 完整 CRUD
- L7 N/A（U-5=C 本期不做视频，polyv 凭证本期不需配置）

---

## 7. 模块 E：User（学员/讲师/订单/钱包/消息，32 + W3 增量 3）

### 7.1 users 学员（4 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `usersPage` / `usersView` / `usersEdit` / `usersDelete` | 4 个 | ✅ |

**未对接**：`save`（admin 不应手动建学员，OK）

**完善**：

- **E1-1** 列表筛选：手机号 / 注册时间 / 状态 / 是否绑定微信
- **E1-2** 编辑允许：`status_id`（启停）/ `realName` / `nickName`；**禁止**改手机号 / 密码
- **E1-3** 推荐用 `usersEdit({id, status_id:0})` "封号"，物理删留为后端清理
- **E1-4** 详情页：基本信息 + 已购课程数 + 订单数 + 钱包余额 + 登录日志（联调 `userCoursePage` / `orderInfoPage` / `logLoginPage`）

### 7.2 users/log 登录日志（1 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `logLoginPage` | `POST /user/admin/users/log/page` | ✅ |

**完善**：

- **E2-1** 字段：`userMobile` / `loginTime` / `loginIp` / `loginCity` / `loginDevice` / `loginType`（密码/短信/微信）
- **E2-2** 异常登录标记：同 IP 1h 内 ≥5 次失败 → 行高亮红色

### 7.3 users/account/consume 账户消费（2 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `usersAccountConsumePage` | `POST /user/admin/users/account/consume/page` | ✅ |
| `usersAccountConsumeSave` | `POST /user/admin/users/account/consume/save` | ✅ |

**完善**：

- **E3-1** 仅"运营加/扣余额"用：表单 `userId` / `amount`（正/负）/ `reason`（必填，≥10 字）
- **E3-2** 二次确认：明确金额 + 操作人 + 原因
- **E3-3** 操作日志：`AspectSysLog` 自动记录，前端无需写

### 7.4 lecturer 讲师（6 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `lecturerPage/View/Save/Edit/Sort/Delete` | 6 个 | ✅ |
| （未对接） | `GET /user/admin/lecturer/es` | ⏸ |

**完善**：

- **E4-1**（20 号 WEB-02）讲师策略：`sys_config.mobile_teacher_strategy`（`deliver`/`offline`）控制移动端讲师 Tab 是否展示
- **E4-2** 讲师详情展示该讲师关联的课程数 + Top5
- **E4-3**（缺口）补 `lecturerEs` axios + 列表行"重建索引"按钮

### 7.5 order/info 订单（3 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `orderInfoPage` | `POST /user/admin/order/info/page` | ✅ |
| `orderEdit` | `PUT /user/admin/order/info/edit` | ✅ |
| `orderInfoStat` | `GET /user/admin/order/info/stat?userId=xxx` | ✅ |

**完善（20 号 WEB-04 异常治理）**：

- **E5-1** 列表筛选状态：`success/failed/cancelled/paying/timeout`，展示 `failureReason` / `lastCallbackTime` / `queryStatus`
- **E5-2** 订单编辑只允许 `remark` 备注；**禁止**改金额/用户/课程
- **E5-3** 用户详情联动：`orderInfoStat` 卡片展示总数/已支付/已退款

### 7.6 order/pay 退款（W3 新增 3 端点，**Web 必须对接**）⚠️ P0

| 后端端点 | 用途 | Web 状态 |
|---|---|---|
| `PUT /user/admin/order/pay/refund` | 发起退款 | ❌ 未对接 |
| `GET /user/admin/order/pay/refund/query` | 查询退款 | ❌ 未对接 |
| `PUT /user/admin/order/pay/close` | 关闭交易 | ❌ 未对接 |

**完善（P2 阶段必落，对应 30 号 §11.6）**：

- **E6-1** `src/api/users.js` 新增 3 axios：`orderPayRefund` / `orderPayRefundQuery` / `orderPayClose`
- **E6-2** `views/users/record/Order/index.vue` 列表行操作列按状态显示按钮：
  - `paid` → "退款"按钮 → 弹 `RefundDialog.vue`（金额 / 原因 / 二次确认）
  - `paying` → "关闭交易"按钮
  - `refunding` → "查询退款状态" → `orderPayRefundQuery`
- **E6-3** 退款金额校验：`refundAmount ≤ paidAmount - alreadyRefundedAmount`
- **E6-4** 退款原因必填且 ≥10 字符
- **E6-5** 退款回调异步通知，前端不强等结果；列表 30s 自动刷新

### 7.7 wallet/withdraw 提现审核（4 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `withdrawPage/View/Pass/Reject` | 4 个 | ✅ |

**完善（20 号 WEB-03 复盘）**：

- **E7-1** 列表筛选：`status` 待审核/处理中/成功/失败/已取消
- **E7-2** 详情面板：账户变更前后字段（余额/冻结/手续费/实到金额）+ 操作日志
- **E7-3** 通过弹窗：必填"审核备注"+ 二次确认金额
- **E7-4** 驳回弹窗：必填"驳回原因"（用户可见）
- **E7-5** 审核后立刻 `withdrawView` 刷新当前行（不刷整张表）

### 7.8 wallet/recharge 充值对账（2 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `rechargeReconcileStats` | `GET /user/admin/wallet/recharge/reconcile/stats` | ✅ |
| `rechargeReconcileRun` | `POST /user/admin/wallet/recharge/reconcile/run` | ✅ |

**完善**：

- **E8-1** 卡片显示近 24h 对账结果：成功数 / 失败数 / 待补单数
- **E8-2** "立即对账"调 `rechargeReconcileRun({timeoutMinutes:30})` → 异步任务 + 前端轮询 stats
- **E8-3** 失败明细列表：从 stats 的 `failedDetails` 字段展示

### 7.9 msg 消息中心（8 端点）

| axios | 路径 | 状态 |
|---|---|---|
| `msgPage/View/Effect/Save/Dispatch/Edit/Delete` | 7 个 | ✅ |
| `msgUserPage` | `POST /user/admin/msg/user/page` | ✅ |

**完善（20 号 WEB-05 触达）**：

- **E9-1** 类型：系统通知 / 课程提醒 / 营销活动 / 直播提醒
- **E9-2** 投放对象：全员 / 按分类 / 按 userId 列表（用 `msgUserPage` 选）
- **E9-3** 流程：先 `msgSave` 草稿 → 编辑预览 → `msgDispatch` 投放（不可撤回）
- **E9-4** 触达效果：`msgEffect?id=xxx` → 已发送/已读/失败/触达率%
- **E9-5** 草稿删除（`msgDelete`）只能删未投放消息；已投放只能编辑标题不能删

### 7.10 模块 E 验收

- L5 全过：32 + 3（退款）共 35 端点
- L6 全过：学员 / 讲师 / 订单（含退款）/ 提现 / 充值对账 / 消息 6 子模块完整闭环
- L7 ⏸ 退款实际打款需支付宝/微信沙箱凭证

---

## 8. 模块 F：未对接的 77 个 admin 端点（参考清单）

### 8.1 service-system 未对接 13 个

| 类别 | 端点 | 是否需对接 |
|---|---|---|
| 配置 | `config/page/save/view`、`DELETE config/delete` | ⏸ list 已够 |
| 运营位 | `app/sort`、`{app,nav,carousel,link}/view`（4 view） | ⏸ 列表已足够 |
| 菜单 | `PUT sys/menu/sort` | 🟡 §5.3 C3-1 |

### 8.2 service-user 未对接 34 个

主要是 `users/save`、`lecturer/es`、`order/info/{save,delete,view}`、`order/pay/{page,save,edit,delete,view}`。**除 §7.6 的 3 个退款端点必对接外，其余按需。**

### 8.3 service-course 未对接 30 个

主要是 `live/*`（直播 6 个）+ 各业务的 `view`/`save`/`edit` 完整 CRUD 中 Web 没用的部分。

### 8.4 直播 live（**项目已有但 Web 缺面**）

| 后端端点 | 用途 | 状态 |
|---|---|---|
| `POST /course/admin/live/page` | 直播分页 | ⏸ |
| `POST /course/admin/live/save` | 创建直播 | ⏸ |
| `PUT /course/admin/live/edit` | 编辑 | ⏸ |
| `DELETE /course/admin/live/delete` | 删除 | ⏸ |
| `GET /course/admin/live/view` | 详情 | ⏸ |
| `POST /course/admin/live/broadcast` | 推流操作 | ⏸ |

**结论**：直播是后端已实现的能力，Web 缺管理页面。**判定为"项目已有功能但 Web 端缺面"**——需补但需用户决策是否本期纳入：

- 若纳入 → 新增 `views/course/live/index.vue` + `live/edit.vue`，`src/api/course.js` 增 6 axios
- 若不纳入 → 登记为下一期任务，本期忽略

直播 callback（`PolyvCallbackController` 路径 `/course/callback/polyv/live/*`）由后端处理，Web 无关。

---

## 9. 模块 G：发布门禁（对应 20 号 WEB-06）

### 9.1 现有工具

- `src/utils/releaseGateTemplate.js` 21 行（5 字段模板 + `validateReleaseGate()`）
- `src/components/ReleaseGatePanel.vue`（已有面板）

### 9.2 完善任务

| # | 任务 |
|---|---|
| **G-1** | 模板落库：`sys_config` 中按版本号建多条 `release_gate_v25.x.x_*` 配置项 |
| **G-2** | 历史追溯：列表展示历次发布的门禁记录（按版本/时间/签核人） |
| **G-3** | 发布前硬校验：5 字段任一为空 → ElMessageBox 拦截 |
| **G-4** | 至少 1 次完整灰度 + 回滚演练归档 |
| **G-5** | 与 `sys_log` 打通：发布动作 → AspectSysLog 自动记录 |

---

## 10. 错误态与异常处理统一规范

### 10.1 全局拦截器（`src/utils/request.js` 已实现）

| code | 行为 |
|---|---|
| 200 | 返回 `data` |
| 301 | 清 cookie + 跳 `/login?redirect=<from>` + Toast"登录已过期" |
| 302 | ElMessageBox.confirm "登录异常" → 用户确认 → 登出 |
| 303-305 | 同 302（登录/异地登录/菜单过期） |
| 306 | 跳 `/403` + Toast"权限不足" |
| 其他 | `ElMessage.error(res.msg)` |

### 10.2 业务码补充规范（页面级）

```javascript
courseSave(form).then(res => {
  ElMessage.success('保存成功')
  refresh()
}).catch(err => {
  ElMessage.error('网络异常，请稍后重试')
})
```

### 10.3 加载与防重复提交

- 表单提交按钮 `loading` 真值绑定 axios pending
- `request.js` pending 队列 + cancel token 已实现，防止短时间重复提交

---

## 11. 端到端测试清单（最低）

### 11.1 P0 主流程（5 条，必过）

| # | 路径 | 涉及 axios | 验收 |
|---|---|---|---|
| **T-WEB-01** | 登录 → 工作台 → 退出 | login + getUserInfo + logout | 跳转无白屏，cookie 清除 |
| **T-WEB-02** | 课程新增 → 资源上传 → 课时绑定 → 上架 | coursePage + courseSave + uploadApi.* + courseChapterSave + courseChapterPeriodSave + courseEdit | 上架后 `MobileCourseController` 可查 |
| **T-WEB-03** | 学员查询 → 详情 → 编辑封号 → 解封 | usersPage + usersView + usersEdit | 封号后该用户登录被拒（status_id=0） |
| **T-WEB-04** | 提现：列表 → 详情 → 通过/驳回 | withdrawPage + withdrawView + withdrawPass + withdrawReject | 审核后 `wallet_withdraw.status` 变更，账户余额对账 |
| **T-WEB-05** | 消息：创建 → 投放 → 触达观测 | msgSave + msgDispatch + msgEffect | 投放后 `MobileMessageController.list` 收到 |

### 11.2 P1 全模块 CRUD

每个 axios 至少跑一次，验证：

- 请求 URL 正确（F12 Network 抓包）
- 请求 token Header 已注入
- 响应 code=200 + data 合法
- 页面状态对应更新

### 11.3 P2 异常态

| 异常 | 触发 | 期望 |
|---|---|---|
| Token 过期 | 等 31min 或后端清 Redis token | 跳登录 + 回跳源页面 |
| 网络断开 | 浏览器离线模式 | Toast"网络异常"，按钮 loading 解除 |
| 后端 500 | 后端故意抛异常 | Toast `res.msg`，列表保持原状 |
| 权限不足 | 低权限角色操作高权限按钮 | 按钮被 `v-permission` 移除 / 调用被 306 拦截 |

---

## 12. 部署与发布（对接后端 `/release-readiness` 7 项门禁）

### 12.1 Web 端发布前自检

```powershell
# 1. 红线扫描
Get-ChildItem -Recurse -Include *.vue,*.js -Path src `
  | Select-String -Pattern 'TODO|FIXME|mock_|console\.log|debugger' -SimpleMatch

# 2. 构建
npm run lint
npm run build

# 3. 验证 dist/
Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum

# 4. nginx 配置检查
nginx -t -c nginx.conf
```

### 12.2 后端 7 项硬门禁

| # | 门禁 | Web 关联 |
|---|---|---|
| 1 | 4 服务 actuator 全 UP | `/login` 能拿到 token |
| 2 | Nacos 4 服务实例 healthy | 路由动态加载成功 |
| 3 | DB schema 已执行（基线 + 增量） | 各 page 接口非空 |
| 4 | 真实第三方配置已落 sys_config | 在 sys/config 编辑生效 |
| 5 | Web `dist/` 经 nginx 反代 `/api/**` → gateway:7700 | 生产可访问 |
| 6 | Android signed APK 三路径通过 | （Android） |
| 7 | iOS（接入后） | （iOS） |

### 12.3 灰度策略

1. 内网：全员可访问，3 天观察
2. 预发布：1 个真实运营账号，1 天观察
3. 生产：低峰期 22:00-06:00 切流

### 12.4 回滚

- nginx 回滚：保留 `dist-prev/`，`mv dist dist-bad && mv dist-prev dist && nginx -s reload`
- DB 无需回滚（Web 改动不涉及 schema）

---

## 13. 完成判定（DoD）

满足以下全部条件，Web 端方可声明"功能完善 + 可立即投入使用"：

1. **132 个 axios 调用**全部 L5 ✅（curl 真实 200 + data 非空）
2. **30 号 §11.6 待对接 3 端点**（订单退款）已落地 §7.6 的 5 项任务
3. **核心 5 流程**（§11.1）全部 L6 ✅
4. **20 号 WEB-01~06** 6 治理任务全部完成或登记到下期
5. **错误态完整**（§10）：301-306 + 网络断开 + 5xx 各场景均有页面级响应
6. **红线 0 hits**：`TODO/FIXME/mock_/console.log/debugger/暂未开放/待补充/伪成功` 全仓扫描归零
7. **`npm run build` exit code 0** 且 `dist/` 体积合理（<5MB gzip）
8. **`npm run lint` exit code 0** 无 ESLint 错误
9. **后端 4 服务 actuator UP** 且 Web 经 nginx 能拉取数据
10. **20 号 §10.6 仍需复验项 5 条**全部清零或登记到下期

---

## 14. 风险与回滚

### 14.1 关键风险

| # | 风险 | 影响 | 应对 |
|---|---|---|---|
| 1 | 后端启动阻塞（MariaDB/Redis/Nacos） | P1 整阶段无法启动 | 与后端协同 `/start-local-backend` 优先 |
| 2 | RSA 加密前后端密钥不一致 | 登录全部失败 | 部署前用 `getWebsite()` 返回的 publicKey 校验 |
| 3 | 动态菜单元数据漂移 | 整个左侧导航失效 | 上线前脚本预校验 `routerList[*].component` 文件存在 |
| 4 | ~~polyv 凭证未配置~~ | **U-5=C 本期不做视频功能** | 风险撤销；课程课时仅图文，资源仅图片+文档；登记下期 |
| 5 | 退款依赖支付宝/微信沙箱 | E-6 退款不可用 | 沙箱 OK 后再放量；当前先做 UI + 联调返回错误码 7001 |

### 14.2 回滚

| 场景 | 回滚 |
|---|---|
| Web 编译失败 | git revert 当前提交 |
| 部署后白屏 | nginx 切 `dist-prev/`，1 分钟内恢复 |
| 后端 schema 不匹配导致 page 接口 500 | 后端 SQL 增量回滚，Web 不动 |
| 动态菜单导致登录后无路由 | 紧急下发 sys_menu 修复 SQL |

---

## 15. 文档关系与维护

### 15.1 与既有 Web 文档的关系

| 文档 | 主线 | 与本文关系 |
|---|---|---|
| 10 号 | 项目全景 | 入口，不重复 |
| 20 号 | 6 治理任务 | 互补：本文 §5-§7 提到的任务在 20 号有更细的运营落地 |
| 30 号 | 132 端点对应矩阵 + §11 校准 | 数据基础 |
| **40 号（本文）** | **132 端点对接验收 + 工程级完善** | **可执行清单** |

### 15.2 维护纪律

1. `src/api/*.js` 新增 axios → 必须更新本文 §3-§7 + 30 号 §11.4
2. `views/**` 新增页面 → 在对应模块章节追加一行
3. 后端 admin 端点变化 → 重新核对差额（§1.3）
4. 完成阶段（P0/P1/P2/P3）后立即更新 §2 表格状态
5. 与 20 号文档配合更新：本文 §5-§7 的"WEB-XX"标记任务完成时同步 20 号 §10.6 复验项

### 15.3 关联文档导航

- **后端权威**：`xiaoe-education-master/docs/12_后端接口分层治理与迁移开发方案.md`
- **后端 admin 控制器索引**：`xiaoe-education-master/docs/05_service模块.md` v2.0
- **后端端点基线**：`xiaoe-education-master/docs/19_后端端点审计基线_2026-04-29.md`
- **后端 W3 退款 SQL**：`xiaoe-education-master/docs/sql/20260501_admin_order_pay_refund_seed.sql`
- **Android 端对接计划（姐妹文档）**：`xiaoe-education-android/docs/26_Android端后端接口对接与功能完善开发计划_可上线版.md`
- **工作区根**：`AGENTS.md` + `.windsurf/rules/` + `.windsurf/workflows/`

---

## 16. 落地执行顺序（一句话）

**P0**：先打通 §3 登录 / §4 工作台 / §7.6 退款 3 端点 → 5 条 P0 流程跑通；  
**P1**：按 §5/§6/§7 顺序逐子模块对齐 axios + L5 + L6；  
**P2**：闭环 20 号 WEB-01~06 + §7.6 退款 UI；  
**P3**：跑 `/release-readiness` 工作流 7 项 + §13 DoD 10 项 → **可上线**。

---

**文档结束**

*维护者：架构组 / Web 端 | 创建日期：2026-05-05（v1.0，基于 30 号 §11 校准 + 19 号 W3 基线）*

