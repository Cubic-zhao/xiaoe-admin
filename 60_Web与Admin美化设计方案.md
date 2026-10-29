# 60 Web 与 Admin 美化设计方案（v1，已确认）

> 日期：2026-10-27　状态：**已确认**（用户同日回复「确认预览，按此开始美化」）。W1–W4、A1–A5 已实施，实施记录、与方案的偏差和证据见 §9；确认项 4（工作台「今日待办」与后端统计接口）已于同日第二轮实现。
> 范围：家教官网 `xiaoe-education-web`（mobile 面）与运营后台 `xiaoe-education-admin`（admin 面）的视觉与交互外观。
> 不在范围：接口契约、路由、权限键、状态机、业务流程；Android / iOS 视觉（见 `xiaoe-education-master/docs/22_全项目未完成功能与修复开发计划_20261027.md` E / F 批）。

---

## 0. 预览与确认

| 预览 | 规范稿（可交互） | 静态图 |
|---|---|---|
| 官网首页 | `xiaoe-education-web/docs/design/home-preview.html` | `home-preview-1440.png`（桌面）、`home-preview-390.png`（移动端 + 导航抽屉） |
| Admin 家教工作台 | `xiaoe-education-admin/docs/design/dashboard-preview.html` | `dashboard-preview-1440.png` |

- HTML 自包含（无外链字体、脚本、图片），双击即可在浏览器打开；官网把窗口缩到 900px 以下可看移动端与导航抽屉。
- PNG 由 Pillow 按 HTML 的尺寸绘制（本机无头浏览器无法启动），与浏览器渲染有细微差异时以 HTML 为准。
- 预览里的老师、课程、价格、课表、统计数字全部是**示例数据**。实现时一律来自现有接口；接口没有的内容不上线，也不用假数字占位。

确认结果（2026-10-27）：用户整体确认预览，按第 1、2、3、5 项实施；第 4 项在 §6.2 中标为可选，本轮未做，需单独确认。原确认项：

1. 品牌主色 `#2563EB`，官网与 Admin 共用一套 token（§2）。
2. 官网首页结构、文案与数据来源（§3）。
3. Admin 换肤范围：主题变量、顶栏、侧栏、工作台、登录页（§4）。
4. 工作台「今日待办」6 项是否本期做；做的话需新增 1 个后端统计接口与权限 SQL（§4.3）。
5. 品牌名保持现状：官网「小鹅教育」、后台「小鹅家教 · 运营管理平台」（§1.3）。

---

## 1. 现状问题（按源码核实）

### 1.1 官网

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| W-1 | 样式表混着两套设计。`:root` 只定义浅蓝 token，`.hero-band` 之后的规则引用 6 个**从未定义**的变量：`--ink` 26 处、`--orange` 33、`--mint` 8、`--line` 38、`--muted` 34、`--white` 29，共 168 处；另有 15 处 `DM Mono` 字体从未加载 | `src/styles.css`；`src/**` 中无任何 `--ink:` 等定义 | 引用未定义变量且无回退值的声明在计算值阶段失效：背景、边框退回初始值（透明 / 无），文字色取继承值。主按钮无底色，卡片无边框，hero 深色底失效；`.hero-text`、`.hero-proof` 写死半透明白字，落在浅色底上几乎看不见。此条为按 CSS 规范的静态推断，未做浏览器截图核验 |
| W-2 | `styles.css:1` 用 `@import` 引 Google Fonts | 同左 | 首屏渲染被外链阻塞，国内网络常超时 |
| W-3 | 主色按钮 `#3B82F6` 配白字对比度 3.68:1；`--text-muted #94A3B8` 用于小字，对比度 2.56:1 | 计算值 | 不满足 WCAG 2.1 AA 正文 4.5:1 |
| W-4 | 无移动端菜单：≤900px 时 5 个导航按钮只缩小内边距后横排 | `styles.css` 900 / 600 断点 | 小屏拥挤、点击区域过小 |
| W-5 | 没有 404 / 未知 hash 兜底，没有全局错误兜底；首页三个区块加载失败与没有数据都显示「正在同步」 | `src/App.vue` | 用户分不清是失败还是没有内容 |
| W-6 | `index.html` 没有 favicon；`theme-color #183b56` 是旧深色稿遗留 | `index.html:6` | 标签页无图标，地址栏颜色与品牌不一致 |
| W-7 | 首页讲师卡只把字段归一成 `name / avatar / title / introduction`，没有用接口已返回、找老师页已在用的 `teacherName / subjects / teachingYears / deliveryModes` | `App.vue:118-125`、`MobileTeacherDiscoveryResp` | 首页讲师信息比列表页少 |
| W-8 | `config.systemLogo` 已计算但模板未使用，品牌标固定为文字「鹅」 | `App.vue:38` | 后台配置的 Logo 不生效 |
| W-9 | `App.vue` 615 行承载 10 个视图 | `src/App.vue` | 改版冲突面大；本方案只改样式与首页结构，不强制拆组件 |

### 1.2 Admin

| # | 问题 | 证据 | 影响 |
|---|---|---|---|
| A-1 | 三套蓝色并存：侧栏 `#15213e`、登录页 `#2873f0 / #033c94`、Element Plus 默认 `#409EFF` | `layout/components/Sidebar/index.vue`、`views/login/index.vue`、`main.js` 引 `element-plus/dist/index.css` | 品牌不统一 |
| A-2 | 顶栏高度不一致：`el-header` 默认 60px，Logo 与文字行高 50px，内容区 `margin-top: 50px`，侧栏 `top: 60px` | `layout/index.vue:30`、`Sidebar/index.vue:127`、`Navbar/Logo.vue:14` | 内容区顶部约 10px 被顶栏遮住 |
| A-3 | 子菜单列宽 100px、菜单项 80px，「学员与老师账号」等 7 字菜单放不下 | `Sidebar/index.vue` 样式；`docs/sql/20261018_admin_navigation_alignment.sql` 菜单名 | 文字溢出 |
| A-4 | 顶栏仍有开源项目遗留外链「领课网络」（`https://www.roncoo.net/?from=os-admin`）；「个人信息」下拉项没有点击处理；`:focus-visible { outline: 0 }` 去掉了焦点框 | `layout/components/Navbar/User.vue:3、18、75` | 运营后台出现第三方站点入口；存在点了没反应的菜单项；键盘用户看不到焦点 |
| A-5 | 工作台只有 8 个 `el-statistic`、一张静态说明卡和登录趋势；50 号 §4.12 规划的 6 个家教运营指标没有接口（`AdminStatDataResp` 只有订单、收入、用户、课程合计） | `views/dashboard/*`、`AdminStatDataResp.java` | 运营打开工作台看不到待办 |
| A-6 | 全局样式只有 `index.scss`；其中 `.c-danger { color: gray }` 名不副实（全仓无使用） | `src/assets/styles/index.scss:11` | 维护误导 |
| A-7 | 登录页 `el-form` 没有 `:rules`；验证码图 `alt=""` 且只能鼠标点击刷新；版权用 `v-html` | `views/login/index.vue:12、22、30` | 校验提示不统一；键盘用户无法刷新验证码；`v-html` 见 22 号 P1-08 |
| A-8 | 会话恢复失败提示为英文 "Session restore failed, please log in again." | `src/main.js:39` | 与中文界面不一致 |
| A-9 | 列表「启用 / 禁用」直接提交，没有二次确认（删除已有确认） | `src/utils/table.js:92 handleStatus` | 误操作风险 |
| A-10 | `views/dashboard/StatVod.vue`、`views/system/config/ReleaseGatePanel.vue` 在代码与 SQL seed 中均无引用 | grep | 维护噪音；删除前需核对线上 `sys_menu.component` |

### 1.3 跨端

- 主色：官网 `--primary-dark #2563EB` 与 Android 产品预览 `docs/preview/preview-mock.css --brand #2563eb` 一致；Android 运行时主题 `lib_uibase/.../theme/Color.kt` 却是橙色 `#FF7F32`。是否统一由 22 号 E 批拍板，本方案不改 Android。
- 品牌名：官网默认 `systemName || '小鹅教育'`，Admin 登录页为「小鹅家教 · 运营管理平台」。本方案保持现状，不擅自改名。

---

## 2. 设计 Token（官网与 Admin 共用）

### 2.1 颜色

对比度为按 WCAG 相对亮度公式计算的值。

| Token | 值 | 用途 | 对比度 |
|---|---|---|---|
| `--brand-600` | `#2563EB` | 主按钮、链接、选中态 | 白字 5.17:1；白底文字 5.17:1 |
| `--brand-700` | `#1D4ED8` | 悬停 / 按下、浅底上的品牌文字、深色色带起色 | 白字 6.70:1；`#EFF6FF` 底 6.16:1 |
| `--brand-800` | `#1E40AF` | 深色色带止色 | 白字 8.72:1 |
| `--brand-500` | `#3B82F6` | 仅图形与装饰 | 白字 3.68:1，不得用于正文按钮 |
| `--brand-200` | `#BFDBFE` | 深色色带上的眉题 | `#1D4ED8` 底 4.72:1 |
| `--brand-100` | `#DBEAFE` | 标签底、深色色带正文 | `#1D4ED8` 底 5.49:1 |
| `--brand-50` | `#EFF6FF` | 选中底、hero 渐变起色 | — |
| `--ink-900` | `#0F172A` | 标题；页脚、侧栏深色底 | `#F8FAFC` 底 17.06:1 |
| `--ink-700` | `#334155` | 正文 | — |
| `--ink-600` | `#475569` | 灰底（`#F1F5F9`）上的次要文字 | 6.92:1 |
| `--ink-500` | `#64748B` | 白底上的次要文字 | 4.76:1；灰底上 4.34:1，不得使用 |
| `--ink-400` | `#94A3B8` | 图标、禁用态、深色底文字 | 白底 2.56:1 不得作文字；`#0F172A` 底 6.96:1 |
| `--ink-300 / 200 / 100 / 50` | `#CBD5E1 / #E2E8F0 / #F1F5F9 / #F8FAFC` | 描边、分割线、Admin 页面底、官网页面底 | — |
| `--success-700 / 50` | `#047857 / #ECFDF5` | 已完成、已通过、免费 | 5.21:1 |
| `--warning-700 / 50` | `#B45309 / #FFFBEB` | 待上课、待审核、◆ 标记 | 4.84:1 |
| `--danger-700 / 50` | `#B91C1C / #FEF2F2` | 支付异常、驳回 | 5.91:1 |

规则：

- 状态标签一律「700 字 + 50 底」。
- 实心按钮只用 brand-600 与 danger-600（`#DC2626`，白字 4.83:1）；success / warning 只用 plain 样式（实心白字分别为 3.77:1、3.19:1，不达标）。
- 无封面图时的兜底封面渐变只用 `#2563EB / #1D4ED8 / #0369A1 / #4F46E5`，白字对比度均 ≥ 5.17:1。

### 2.2 字体与字号

- 字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`。不加载任何 Web 字体。
- 官网：H1 48/1.2（移动端 30）、H2 32/1.25（移动端 24）、卡片标题 18、正文 16/1.6、辅助 14、说明 13、最小 12。
- Admin：页面标题 22、区块标题 15、正文 14、辅助 13、最小 12；指标数值 24–30 粗体。

### 2.3 间距、圆角、阴影、断点

| 项 | 取值 |
|---|---|
| 间距（4 的倍数） | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 88 / 96 |
| 圆角 | 8 按钮 / 输入框，12 卡片，16 大卡片，20 色带，999 胶囊 |
| 阴影 | sm `0 1px 2px rgba(15,23,42,.06)`；md `0 6px 16px rgba(15,23,42,.08)`；lg `0 16px 40px rgba(37,99,235,.14)` |
| 焦点 | `0 0 0 3px rgba(37,99,235,.35)`，所有可交互元素 `:focus-visible` 可见 |
| 官网断点 | >900 桌面：容器 1200、左右内边距 24；≤900 移动：单列 / 双列 + 抽屉菜单 |
| Admin | 只适配 ≥1280 桌面（与现状一致） |

---

## 3. 官网首页（对应 `home-preview.html`）

### 3.1 区块与数据来源

| 区块 | 内容 | 数据来源（现有接口，不新增） | 相对现状 |
|---|---|---|---|
| 顶部导航 | 品牌标、名称、副标；首页 / 课程 / 找老师 / 我的排课 / 帮助中心；下载 App；登录 / 注册 | `GET /system/mobile/api/v1/config`（`systemName`、`systemLogo`、`versionInfo.downloadUrl`） | 白底吸顶、选中下划线；`systemLogo` 有值时显示图片（W-8）；`downloadUrl` 为空时不显示下载入口（现状如此） |
| Hero 左 | 胶囊标签、H1、说明、「寻找家教 / 浏览辅导课程」、3 个卖点 | 文案沿用现有 | 浅蓝渐变底，修复 W-1 |
| Hero 右「本周课表」 | 已登录：最近 3 节排课（时间、课程、老师、线上 / 上门、第 x/y 课时、状态） | `GET /user/mobile/api/v1/schedule/list`，字段 `startAt / courseName / teacherName / deliveryMode / periodIndex / periodTotal / status`（「我的排课」页已在用） | 新增。未登录显示「登录后查看本周课表」与登录按钮，**不放示例数据** |
| 课后记录浮卡 | 最近一节已完成课的记录摘要 | 已登录且有已完成排课时调 `GET /user/mobile/api/v1/schedule/{id}/record` | 新增、可选；无数据不显示 |
| 学科分类 | 6 个学科卡：名称、课程数 | `GET /home/mobile/api/v1/subject/list` | 卡片化、加图标位；点击带 `categoryId` 进课程页（现有逻辑） |
| 精选课程 | 3 张课程卡：封面、分类、标题、简介、老师、价格 | `GET /course/mobile/api/v1/course/recommend?limit=6` | 无封面时用品牌渐变兜底封面 |
| 学习闭环 | 4 步说明 +「开始学习 / 查看我的学习」 | 静态文案（沿用） | 深蓝色带 |
| 认识你的讲师 | 4 张讲师卡：头像、姓名、学科 · 教龄、授课方式 | `POST /teacher/mobile/api/v1/teacher/list`，字段 `teacherName / avatar / subjects / teachingYears / deliveryModes` | 修复 W-7 |
| 页脚 | 品牌、快速链接、联系方式、版权 | config 的 `copyright / servicePhone / serviceEmail` | 深色页脚 |

### 3.2 状态规范（全站）

| 状态 | 表现 |
|---|---|
| 加载 | 区块内骨架（与卡片同尺寸的浅灰块，`aria-busy="true"`），不整页转圈 |
| 空 | 图标 + 一句说明 + 可选动作（如「浏览课程」） |
| 失败 | `role="alert"` + 后端 `msg` +「重新加载」；与「空」分开显示 |
| 未登录 | 需要登录的区块显示登录引导，不发请求 |
| 404 | 未知 hash 进入 404 视图：一句说明 +「返回首页」 |

### 3.3 移动端（≤900px）

- 顶栏 56px：品牌 + 汉堡按钮（`aria-expanded`、`aria-controls`）。抽屉从右侧滑出，宽 `min(300px, 86vw)`，含 5 个导航、下载 App、登录 / 注册；Esc 或点遮罩关闭，焦点回到汉堡按钮；打开时焦点圈定在抽屉内。
- Hero 单列、按钮通栏；课表卡只显示 2 节；学科、讲师双列；课程单列；4 步 2×2。

### 3.4 其余页面

首页定稿后按同一套 token 改：课程列表 / 详情、找老师 / 老师详情、我的排课、帮助中心、登录注册、个人中心、订单详情、支付弹窗。只换样式与状态展示，不改流程和接口。

---

## 4. Admin（对应 `dashboard-preview.html`）

### 4.1 Element Plus 主题

推荐做法：不改 `main.js` 的引入方式，新增 `src/assets/styles/theme.scss` 并在 `index.scss` 顶部引入。`main.js` 先引入 `element-plus/dist/index.css` 再引入 `index.scss`，同优先级下后者覆盖。色阶按 Element Plus 的混色规则算出（light-N 与白色按 N×10% 混合，dark-2 与黑色按 20% 混合）：

```scss
:root {
  --el-color-primary: #2563EB;
  --el-color-primary-light-3: #6692F1;
  --el-color-primary-light-5: #92B1F5;
  --el-color-primary-light-7: #BED0F9;
  --el-color-primary-light-8: #D3E0FB;
  --el-color-primary-light-9: #E9EFFD;
  --el-color-primary-dark-2: #1E4FBC;
  --el-color-success: #059669;
  --el-color-success-light-3: #50B696;
  --el-color-success-light-5: #82CAB4;
  --el-color-success-light-7: #B4E0D2;
  --el-color-success-light-8: #CDEAE1;
  --el-color-success-light-9: #E6F4F0;
  --el-color-success-dark-2: #047854;
  --el-color-warning: #D97706;
  --el-color-warning-light-3: #E4A051;
  --el-color-warning-light-5: #ECBB82;
  --el-color-warning-light-7: #F4D6B4;
  --el-color-warning-light-8: #F7E4CD;
  --el-color-warning-light-9: #FBF1E6;
  --el-color-warning-dark-2: #AE5F05;
  --el-color-danger: #DC2626;
  --el-color-danger-light-3: #E66767;
  --el-color-danger-light-5: #EE9292;
  --el-color-danger-light-7: #F4BEBE;
  --el-color-danger-light-8: #F8D4D4;
  --el-color-danger-light-9: #FCE9E9;
  --el-color-danger-dark-2: #B01E1E;
  --el-color-error: #DC2626; /* 其余 error 色阶与 danger 相同 */
  --el-color-info: #64748B;
  --el-color-info-light-3: #929EAE;
  --el-color-info-light-5: #B2BAC5;
  --el-color-info-light-7: #D0D5DC;
  --el-color-info-light-8: #E0E3E8;
  --el-color-info-light-9: #F0F1F3;
  --el-color-info-dark-2: #505D6F;
  --el-border-radius-base: 8px;
  --el-bg-color-page: #F1F5F9;
  --el-text-color-primary: #0F172A;
  --el-text-color-regular: #334155;
  --el-text-color-secondary: #64748B;
  --el-border-color: #E2E8F0;
  --el-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --el-header-height: 56px;
}
```

备选：用 `@forward 'element-plus/theme-chalk/src/common/var.scss' with ($colors: …)` 由 SCSS 自动生成色阶。本机已确认 `element-plus 2.6.3` 自带 theme-chalk 源码、`sass 1.75.0` 已在依赖中；但要把 `main.js` 的 `element-plus/dist/index.css` 换成自定义 SCSS 入口，属慎改文件，默认不用。

### 4.2 布局

| 部位 | 现状 | 方案 |
|---|---|---|
| 顶栏 | 60 / 50px 混用；Logo 区 80×50 深色块；「领课网络」「首页」两个外链；用户名下拉 | 统一 56px；Logo 区 88 宽、与主菜单列对齐；产品名 + 面包屑；右侧只留头像 + 姓名下拉（「个人信息」接到现有资料页或移除），**删除「领课网络」外链**（A-4） |
| 主菜单列 | 90px，`#15213e`，选中白底黑字 | 88px，`#0F172A`；图标在上、文字在下；选中 `#1E293B` 底 + 左侧 3px 品牌色条 |
| 子菜单列 | 100px，菜单项 80px | 168px；分组标题 + 菜单项；选中 `#EFF6FF` 底 + `#1D4ED8` 粗体 |
| 内容区 | `#f2f3f5` 底，内容整体套白底容器 | `#F1F5F9` 底；页面直接放卡片（12 圆角、1px `#E2E8F0` 描边），不再整块套白底 |
| 表格 / 表单 | Element Plus 默认 | 只靠主题变量换色；表头底 `#F8FAFC`；状态列统一用 §2.1 标签 |

侧栏的悬停展开、子菜单切换逻辑不变，只改模板结构与样式。

### 4.3 家教工作台

| 区块 | 内容 | 数据来源 | 说明 |
|---|---|---|---|
| 页头 | 标题、副标题、刷新 | — | 刷新 = 重新请求下列接口 |
| 今日待办（6 卡） | 待审核资质、今日约课、今日排课、待处理反馈、支付异常、提现待审；每卡跳到对应页面 | **新增** `GET /user/admin/stat/o2o`（service-user，`AdminStatController` + `AdminStatBiz`；数据在本服务的 `qualification_item`、`booking_order`、`lesson_schedule`、`feedback_ticket`、`order_pay`、提现记录表） | 需后端。新增按钮级权限 `stat:o2o` 绑定该 API（SQL 增量 + 回滚）；页面按 `hasPermission('stat:o2o')` 显示。未接通前整块不渲染，不显示 0 或示例数 |
| 经营数据（8 格） | 今日 / 昨日订单与收入、用户 / 课程 / 订单总数、累计收入 | 现有 `GET /user/admin/stat/data`，权限 `stat:data` | 换样式 |
| 近 14 天注册与登录 | 折线图（登录 / 注册两条线） | 现有 `GET /user/admin/stat/login?dates=-14`，权限 `stat:login`；`echarts 5.5.0` 已在依赖中 | 换配色 |
| 快捷入口 | 资质审核、约课订单、排课管理、上课记录、反馈工单、提现审核 | 现有页面：`views/users/{tutor/audit,booking,schedule,lessonRecord,feedback,withdraw}`；按菜单权限显示 | 替换静态说明卡 |

「支付异常」口径待定：当前移动端退款申请会把订单置为 `FAIL(3)`，与支付失败共用同一状态（22 号 P0-03）。B 批修正退款状态后再定义该指标；在此之前该卡不上线。

不推荐的替代做法：不加接口，用 6 个列表页 `page` 接口的 `totalCount` 拼数。需要 6 次请求、受角色权限限制，还要逐个核对筛选字段是否生效（已知 `AdminOrderPayBiz.page()` 忽略全部筛选，22 号 P1-05）。

### 4.4 登录页

- 保留左右分栏：左侧 `#1D4ED8 → #1E40AF` 渐变品牌区（沿用现有产品名与简介），右侧白色登录卡。
- 表单加 `:rules`（用户名、密码、验证码必填），错误提示显示在字段下方。
- 验证码图包进 `<button type="button" aria-label="看不清，换一张">`，支持键盘刷新；图片 `alt="图形验证码"`。
- 版权改纯文本插值，去掉 `v-html`（与 22 号 P1-08 一并处理）。
- `main.js:39` 提示改为「登录已失效，请重新登录」。

### 4.5 交互细节

- 启用 / 禁用统一二次确认（`ElMessageBox.confirm`），文案写明对象与后果（A-9）。
- 删除无引用的 `.c-danger`，或改为 `var(--el-color-danger)` 后再使用（A-6）。
- 恢复焦点框：去掉 `User.vue` 的 `outline: 0`，统一用 §2.3 焦点样式。

---

## 5. 可访问性要求

- 文字对比度 ≥ 4.5:1，大字（≥ 24px 或 ≥ 18.66px 粗体）≥ 3:1，以 §2.1 计算值为准。
- 所有交互元素可用 Tab 到达，焦点可见；抽屉与弹窗圈定焦点，Esc 关闭。
- 有意义的图片写 `alt`，装饰图 `aria-hidden="true"`；图表提供 `aria-label` 或等价数据表。
- `prefers-reduced-motion: reduce` 时关闭过渡动画。
- 以上只覆盖设计层。完整 WCAG 符合性需要用读屏软件（NVDA / VoiceOver）实测，并由无障碍专家评审。

---

## 6. 实施清单（确认后执行）

### 6.1 官网 `xiaoe-education-web`

| 步骤 | 文件 | 内容 |
|---|---|---|
| W1 | `src/styles.css` | 删除 Google Fonts `@import`；按 §2 重写 `:root`；替换 168 处未定义变量与 15 处 `DM Mono`；补焦点样式与减少动效 |
| W2 | `src/App.vue` | 顶栏与抽屉、首页区块结构、讲师卡字段（W-7）、`systemLogo`（W-8）、三态与 404 视图 |
| W3 | `index.html`、`public/` | `theme-color #2563EB`；favicon 复用 Admin `src/assets/images/goose-app-icon-108.png`（复制为 `public/favicon.png`） |
| W4 | `src/components/{BookingPanel,LessonSchedule,TutorDirectory}.vue` | 按 token 调整类名与状态展示，不改接口调用 |
| 验收 | — | `npm run build` 退出码 0；浏览器 1440 / 390 两档与预览一致；未登录、已登录、接口失败三种情况截图 |

### 6.2 Admin `xiaoe-education-admin`

| 步骤 | 文件 | 内容 |
|---|---|---|
| A1 | `src/assets/styles/theme.scss`（新增）、`src/assets/styles/index.scss` | 主题变量、全局卡片与表格样式、`.c-danger` 处理 |
| A2 | `src/layout/index.vue`、`src/layout/components/Navbar/{index,Logo,User,Breadcrumb}.vue`、`src/layout/components/Sidebar/index.vue`、`src/layout/components/Mains.vue` | 顶栏 56px、侧栏两列宽度与配色、删除外链、焦点样式；菜单逻辑不动 |
| A3 | `src/views/dashboard/{index,StatData,StatLogin}.vue`、新增 `TodoPanel.vue` 与 `QuickLinks.vue`、`src/api/dashboard.js` | 工作台；`TodoPanel` 依赖 §4.3 后端，未接通前不渲染 |
| A4 | `src/views/login/index.vue`、`src/main.js`（仅第 39 行文案） | 登录页样式与校验、验证码可访问、中文提示 |
| A5 | `src/utils/table.js` | `handleStatus` 二次确认 |
| 后端（可选，对应确认项 4） | service-user `AdminStatController`、`AdminStatBiz`、新增 `AdminStatO2oResp`；`docs/sql/{YYYYMMDD}_admin_stat_o2o_permission.sql`（含回滚段） | §4.3 统计接口与权限 seed；按 `/new-admin-endpoint` 执行 |
| 验收 | — | `npm run build` 退出码 0；后端改动时跑 19 项治理测试；浏览器逐页检查现有 29 页无样式错乱；超级管理员与受限角色各登录一次，确认待办区块与快捷入口按权限显隐 |

---

## 7. 边界与回滚

- 不新增 npm 依赖，不升级 Element Plus / Vue；不改 `src/api/*.js` 现有路径（工作台新增 1 个函数除外）、`src/utils/request.js`、路由与权限键。
- 每个步骤单独提交，回滚用 `git revert` 对应提交。主题变量集中在 `theme.scss`，删掉 `index.scss` 中的引入行即恢复 Element Plus 默认色。
- 后端统计接口与权限 SQL 独立提交；SQL 增量自带回滚段。

## 8. 本次证据

- L1：预览 HTML / PNG 已落盘；§1 每条问题都有文件与行号。
- L2–L6：本次不改代码，未执行；确认后按 §6 验收逐项补齐。

---

## 9. 实施记录（2026-10-27）

### 9.1 官网（W1–W4）

| 步骤 | 实际改动 |
|---|---|
| W1 | `src/styles.css` 全部重写，只用 §2 的 token；`var(--ink / orange / mint / line / muted / white)`、`DM Mono`、Google Fonts 外链均为 0；补 `:focus-visible` 与 `prefers-reduced-motion` |
| W2 | `src/App.vue`：吸顶顶栏 + ≤900px 抽屉（Esc / 遮罩关闭、焦点圈定、关闭后焦点回到汉堡按钮）；`systemLogo` 有值时显示图片；首页学科、课程、讲师三块分「骨架 / 失败可重试 / 空」三态；本周课表卡（已登录读 `schedule/list`，未登录只显示登录引导，不放示例）；课后记录浮卡（读 `schedule/{id}/record`，没有记录或读取失败时不显示）；讲师卡改用 `teacherName / subjects / teachingYears / deliveryModes`；未知 hash 进 404 视图；支付二维码前景色改为 `#0F172A`。下单、支付、登录流程与接口调用未改 |
| W3 | `index.html`：`theme-color #2563EB`，加 `<link rel="icon" href="/favicon.png">`；`public/favicon.png` 由 Admin 小鹅图标复制 |
| W4 | 三个组件：眉题改中文；找老师、我的排课加载态改骨架；排课状态、资质状态改用 §2.1 状态标签（新增 `tag-danger`）；预约面板的加载与「无可约老师」提示加样式。接口调用未改 |

### 9.2 Admin（A1–A5）

| 步骤 | 实际改动 |
|---|---|
| A1 | 新增 `src/assets/styles/theme.scss`（§4.1 变量 + `--xe-*` 布局 token），`index.scss` 顶部 `@use`；body 用 §2.2 字体栈、14px；`el-card` 12 圆角、描边、轻阴影；表头 `#F8FAFC`；删除无引用的 `.c-danger`；`.c-special` 由纯红改为 `#B91C1C` |
| A2 | 顶栏 56px：Logo 区 88 宽深色块、产品名、面包屑（`/` 分隔，末项加粗）、头像 + 姓名下拉；删除「领课网络」「首页」外链和没有处理函数的「个人信息」（Admin 没有现成的个人资料页）；下拉触发器用焦点环恢复键盘可见。侧栏主菜单 88px、图标在上、选中左侧 3px 色条；子菜单 168px、加分组标题。内容区 `#F1F5F9`；普通页保留白色卡片容器（12 圆角 + 描边），只有工作台直接放在灰底。菜单展开与切换逻辑未改 |
| A3 | 工作台：页头 + 刷新；经营数据 8 格（骨架、失败可重试，字段与跳转沿用原实现）；近 14 天注册与登录折线图（`aria-label` 写入日期范围与合计）；新增 `QuickLinks.vue`，6 个入口只在当前账号路由表中存在时显示，路径与 `docs/sql` 中的 `sys_menu` 种子一致。同日第二轮按确认项 4 新增 `TodoPanel.vue`（`GET /user/admin/stat/o2o`，权限 `stat:o2o`）与 `api/dashboard.js#o2o` |
| A4 | 登录页：浅灰底、左侧 `#1D4ED8 → #1E40AF` 品牌区、右侧白色登录卡；`:rules` 必填校验，错误显示在字段下方；验证码图放进 `<button type="button" aria-label="看不清，换一张">`，`alt="图形验证码"`；输入框补 `aria-label` 与 `autocomplete`；版权改文本插值；`main.js` 提示改为「登录已失效，请重新登录」 |
| A5 | `useTable().handleStatus` 先 `ElMessageBox.confirm`，写明启用 / 禁用的后果；新增可选参数 `label` 用于写对象名；15 个页面 18 处调用均为按钮 / 下拉项点击触发（无 `el-switch` 绑定），调用代码不变 |

### 9.3 与方案的偏差

- §4.1 把 `--el-header-height: 56px` 写在 `:root`，但 Element Plus 2.6.3 在 `.el-header` 上自带该变量，写在 `:root` 不生效。实际写在 `Navbar/index.vue` 的 `.el-header` 上。
- §4.3 预览中注册线为 `#F59E0B`，对白底只有 2.15:1；实际用主题 warning 色 `#D97706`（3.19:1）。
- §4.2「不再整块套白底」只对工作台生效；其余 28 页仍放在白色卡片容器里，避免逐页改布局。
- 原 `StatLogin.vue` 的 ECharts 实例存在模块级变量里，离开工作台再回来时仍指向已移除的容器，图表空白，「刷新」也无效。改为组件内实例，卸载时 `dispose`，并用 `ResizeObserver` 跟随容器宽度。
- 原 Logo 图 `src/assets/images/logo.png` 是开源项目的图标，改为与预览一致的「鹅」字标；图片文件未删除，当前已无引用。
- 确认项 4 已于同日第二轮实现（用户确认「新增工作台待办统计接口」）。与 §4.3 的差异：「支付异常」卡改为「待审退款」（22 号 P0-03 修复后退款有独立状态，原口径不成立）；「提现待审」统计 pending + processing，改名「提现待处理」。

### 9.4 证据

- L2：官网 `vite build` 退出码 0；Admin `vite build` 退出码 0（仍有原有的大 chunk 警告）。均输出到临时目录，未改动仓库内 `dist/`。
- 静态核对：官网所有 `var(--x)` 均有定义；模板静态类名与样式表的差集只剩页面挂钩类（`home-page` 等）；Admin 改动文件跑 ESLint（不带 `--fix`），只剩 2 条 HEAD 中已有的格式问题（`src/utils/table.js:141`、`src/views/login/index.vue:6`）。
- L4–L6 未做：本机不能启动服务与浏览器。1440 / 390 两档截图、未登录 / 已登录 / 接口失败三种状态、Admin 29 页逐页检查、超级管理员与受限角色各登录一次，均待补。
