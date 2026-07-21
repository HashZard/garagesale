# 产品需求文档：GarageSale.com.au MVP v1

## 1. 文档信息

- 产品：澳大利亚车库售卖活动目录与免费发布工具
- 域名：`garagesale.com.au`
- 版本：简化版 MVP v1
- 目标工期：两周完成可部署代码
- 维护对象：开发者与 AI 编码代理
- 开发原则：只实现本文档明确列入 MVP 的功能，不自行扩展范围

## 2. 产品概述

GarageSale 帮助澳大利亚用户：

1. 在手机上快速查找附近即将举行的 garage sale。
2. 无需注册账号，在三分钟内免费发布活动。
3. 通过邮件中的私人管理链接修改、取消或删除活动。

网站以目录为核心，数据来自用户自行发布和外部聚合数据。抓取程序属于独立项目，不在本仓库范围内；本项目只需要支持聚合记录的数据结构和展示。

核心承诺：用户周五晚上打开网站，就能在地图上看到本周末附近的活动并规划行程。

### 2.1 MVP 成功标准

- 移动端用户能在十秒内通过 suburb 或 postcode 找到附近活动。
- 卖家无需账号即可完成发布、邮件验证、修改、取消和删除。
- 有活动记录的澳大利亚 suburb 拥有可被搜索引擎索引的页面。
- 已结束、已取消或已删除活动自动从所有公开页面消失。

## 3. 范围

### 3.1 MVP 包含

- 首页：地图、列表、suburb/postcode 搜索和基础筛选
- 活动详情页
- 无账号发布表单
- 邮件验证和私人管理链接
- 管理链接恢复
- suburb 和 state SEO 页面
- 自动隐藏过期活动
- 最小后台管理
- 移动端优先的响应式网站

### 3.2 MVP 不包含

- 普通用户账号、密码、OAuth 和个人资料
- 评论、评分、收藏、聊天和消息
- 单件商品发布或商品搜索
- 支付
- 原生移动应用
- 抓取程序
- 多语言
- 多日或重复活动
- 重复活动检测
- 地址隐藏、延迟公开或地图坐标偏移
- 浏览统计和复杂数据分析

### 3.3 简化原则

- 优先采用单一、直接、可测试的行为。
- 不增加运行时功能开关、后台任务、备用流程或推测性抽象。
- 需求存在歧义时，选择满足验收清单的最小实现，并记录到 `docs/decisions.md`。
- 可以简化产品行为，但不得省略输入校验、权限隔离、密钥保护和数据完整性。

## 4. 用户

1. 买家：周五晚或周六早使用手机查找附近活动，不登录。
2. 卖家：偶尔发布活动，不愿注册账号，希望快速发布并能通过邮件管理。
3. 管理员：站点所有者，负责修正数据和移除垃圾内容。

## 5. 固定技术栈

| 层级           | 选型                                | 规则                                       |
| -------------- | ----------------------------------- | ------------------------------------------ |
| Web 框架       | Next.js App Router + TypeScript     | Server Components 优先，SEO 内容服务端渲染 |
| 数据库         | Supabase Postgres + PostGIS         | 距离查询必须使用 PostGIS                   |
| 托管           | Vercel                              | Preview 与 Production 分离                 |
| 地图与地理编码 | Mapbox GL JS + Mapbox Geocoding API | 仅允许澳大利亚结果                         |
| 邮件           | Resend                              | 发送验证和恢复邮件                         |
| 样式           | Tailwind CSS v4                     | 移动端优先                                 |
| 组件           | shadcn/ui + Radix                   | 组件源码保存在仓库内                       |
| 图标           | lucide-react                        | 不引入第二套图标库                         |
| 表单           | react-hook-form + Zod               | 客户端和服务端共用校验规则                 |
| 图片           | Supabase Storage                    | 最多六张，客户端缩放至最长边 1600px        |
| 包管理         | pnpm                                | 提交 `pnpm-lock.yaml`                      |
| Node.js        | Node.js 24 LTS                      | `.nvmrc` 与 `package.json` 固定版本        |

所需环境变量统一记录在 `.env.example` 和 `docs/external-setup-checklist.md`。真实密钥不得提交到仓库。

## 6. 工程规则

### 6.1 目录边界

```text
src/app/                 路由、布局和数据装配
src/components/ui/       通用 UI 原语
src/components/map/      地图组件
src/components/sale/     活动业务组件
src/components/forms/    表单组件
src/lib/db/              唯一数据库访问入口
src/lib/geo/             地理编码、距离和时区
src/lib/email/           邮件发送和模板
src/lib/seo/             metadata、JSON-LD 和 sitemap
src/lib/validation/      客户端与服务端共享 Zod schema
src/config/              品牌信息、分类和限制常量
src/types/               共享类型和生成的数据库类型
supabase/migrations/     只追加的 SQL 迁移
tests/                   单元、集成和端到端测试
```

### 6.2 编码规则

- 页面保持轻量，业务逻辑进入 `lib`，UI 进入 `components`。
- 数据库查询只能写在 `src/lib/db`。
- TypeScript 开启 `strict` 和 `noUncheckedIndexedAccess`。
- 禁止无理由使用 `any`、`@ts-ignore` 或整文件关闭规则。
- 使用 `@/` 别名，避免多层相对路径。
- 校验规则、分类、限制数字和品牌文案各自保持单一来源。
- 一个组件一个文件；文件接近 250 行时优先拆分。
- 非显然业务规则的注释说明原因并引用 PRD 章节。
- schema 改动必须增加 migration、重新生成类型并更新 `docs/data-model.md`。
- 新运行时依赖或偏离 PRD 的决定记录到 `docs/decisions.md`。

### 6.3 UI 规则

- 只使用 shadcn/ui 体系，不增加 MUI、Chakra、Ant 等第二套组件库。
- 业务组件通过 `components/ui` 使用 Radix，不直接散落 Radix 导入。
- 颜色使用语义 token，组件内不写原始十六进制颜色。
- 使用 Tailwind 标准间距和断点，以 375px 为第一设计宽度。
- Server Components 默认；只有交互、浏览器 API 或 hooks 才使用 Client Components。
- 自由文本始终转义，不渲染用户 HTML。
- `dangerouslySetInnerHTML` 只允许在共享 JSON-LD 组件中使用，并安全转义 `<`。
- 所有交互元素必须有可访问名称、键盘焦点和禁用状态。

## 7. 数据模型

### 7.1 `sales`

| 字段              | 类型                  | 说明                                                               |
| ----------------- | --------------------- | ------------------------------------------------------------------ |
| id                | uuid 主键             | 自动生成                                                           |
| title             | text                  | 必填，最多 80 字符                                                 |
| description       | text                  | 可选，最多 2000 字符                                               |
| address           | text                  | 自发布记录为完整地址；聚合记录为来源提供的地址；按保存内容公开展示 |
| suburb            | text                  | 标准化 suburb 名称                                                 |
| state             | text                  | WA、NSW、VIC、QLD、SA、TAS、ACT、NT                                |
| postcode          | text                  | 四位数字                                                           |
| location          | geography(Point,4326) | 地图位置                                                           |
| start_at          | timestamptz           | 开始时间                                                           |
| end_at            | timestamptz           | 结束时间，必须晚于开始时间                                         |
| photos            | text[]                | Storage 对象地址，最多六张                                         |
| categories        | text[]                | 固定分类，可选                                                     |
| source            | text                  | self、gumtree、facebook、manual、other                             |
| source_url        | text                  | 外部来源必填                                                       |
| contact_email     | text                  | self 来源必填，永不公开                                            |
| manage_token      | uuid                  | self 来源必填且唯一，永不公开                                      |
| status            | text                  | pending_verification、published、cancelled、removed                |
| email_verified_at | timestamptz           | 验证时间                                                           |
| created_at        | timestamptz           | 创建时间                                                           |
| updated_at        | timestamptz           | 更新时间                                                           |

索引：`location` 使用 GIST；`state/suburb`、`start_at` 和 `status` 使用 btree。

公开匿名访问只能读取 `status = published AND end_at > now()` 的安全字段，不能读取邮箱和管理 token。所有写操作通过服务器端代码使用 service role 执行。

### 7.2 `suburbs`

字段：`id、name、state、postcode、slug、location`。数据来自允许使用的澳大利亚 postcode/suburb 数据集，来源和署名写入 README。

## 8. 页面与路由

| 路由                                       | 用途                 | 渲染规则                    |
| ------------------------------------------ | -------------------- | --------------------------- |
| `/`                                        | 搜索、地图和活动列表 | SSR                         |
| `/sale/[id]`                               | 活动详情             | SSR；非公开或已过期返回 404 |
| `/garage-sales/[state]`                    | state 索引           | ISR                         |
| `/garage-sales/[state]/[suburb-slug]`      | suburb SEO 页面      | SSR/ISR                     |
| `/publish`                                 | 发布表单             | 客户端交互，服务端提交      |
| `/manage/[token]`                          | 私人管理页           | SSR、noindex                |
| `/recover`                                 | 恢复管理链接         | 客户端表单                  |
| `/verify/[token]`                          | 邮件验证             | 服务端处理                  |
| `/admin`                                   | 最小后台             | 受保护、noindex             |
| `/about`、`/contact`、`/privacy`、`/terms` | 静态页面             | SSG                         |
| `/sitemap.xml`、`/robots.txt`              | SEO                  | 动态生成                    |

## 9. 功能需求

### 9.1 首页

- Header 包含 GarageSale 品牌、查找入口和主要发布按钮。
- 支持 suburb 或 postcode 自动完成搜索。
- 支持浏览器定位；拒绝定位后仍能手动搜索。
- 默认查询搜索点 25km 内、未来 14 天且尚未结束的活动，按日期和距离排序。
- 无位置时展示各州最近活动。
- 筛选：本周末、下周末、全部；分类多选；5/10/25/50km 半径。
- 桌面显示地图与列表分栏；移动端支持 Map/List 切换。
- 地图标记聚合，且不得劫持移动页面滚动。
- 卡片展示标题、suburb/state、当地日期时间、距离、首图、分类和来源。
- 无结果时显示发布引导。

### 9.2 活动详情

- 展示标题、当地日期时间、描述、图片、分类、保存的地址和地图位置。
- self 来源显示完整街道地址和准确位置。
- 提供 Google Maps 导航链接和服务器生成的 `.ics` 文件。
- 外部来源显示原始链接和来源免责声明，不显示管理或联系信息。
- 输出 Event JSON-LD、唯一 metadata 和社交分享信息。
- 过期、取消、删除或未验证记录返回 404。

### 9.3 发布

- What：标题、描述、分类和零至六张图片。
- Where：Mapbox 澳大利亚地址自动完成，保存完整地址和准确经纬度。
- 明确提示：发布后完整地址和准确地图位置将公开。
- When：一个日期、开始时间、结束时间；只允许同一当地日期，且开始时间必须在未来。
- Contact：必填邮箱，永不公开。
- 提交后创建 pending_verification 记录、生成管理 token、发送验证邮件。
- 使用 honeypot 和每 IP 每小时最多三次发布的服务端限流。

### 9.4 验证、管理与恢复

- 验证链接将记录幂等地改为 published，然后跳转管理页。
- MVP 允许管理 token 同时用于验证和管理。
- 管理页允许修改所有公开字段；地址改变时重新地理编码。
- 取消将状态改为 cancelled，并从公开页面移除。
- 删除将状态改为 removed，之后管理页和公开页均返回 404。
- 恢复页始终显示相同确认文案；有匹配时通过邮件发送仍有效活动的管理链接。

### 9.5 SEO 页面

- suburb 页展示该 suburb 和 10km 内的活动、附近 suburb 链接和发布入口。
- 零活动页仍提供有用内容和内部链接，不成为死路页面。
- sitemap 只包含有活跃或最近 90 天记录的 suburb、全部 state、静态页和活跃活动。
- `robots.txt` 禁止 `/manage`、`/verify`、`/recover`、`/admin` 和 `/api`。

### 9.6 后台

- `/admin` 使用 `ADMIN_SECRET` 登录，并使用安全的 httpOnly cookie 保存短期会话。
- 展示所有状态活动，支持按 suburb、邮箱和来源搜索。
- 支持查看、编辑和移除。
- 不实现用户管理或分析仪表盘。

## 10. 业务规则

1. 公开活动必须为 published 且 `end_at > now()`；无需 cron。
2. 活动时间存储为 timestamptz，并按活动州对应的澳大利亚时区显示，不使用访问者时区。
3. 开始和结束时间必须处于活动当地的同一日；多日活动每天单独发布。
4. 发布记录按数据库中的地址和位置原样公开，不进行隐私遮挡或延迟公开。
5. 聚合记录不含邮箱或管理 token，始终链接来源，只展示来源提供的合规摘要内容。

## 11. 非功能需求

- 375px 宽度下完整可用，无横向滚动。
- 语义化 HTML、完整表单标签、键盘可操作和清晰焦点状态。
- 所有服务端操作再次执行 Zod 校验，不能信任客户端地理编码数据。
- 使用 Vercel Analytics，不建立分析供应商抽象。
- 所有数据请求具有 loading、empty 和 error 状态。
- 发布失败后保留表单输入。
- 首页和 suburb 页移动端 Lighthouse 目标不低于 90。
- 所有秘密只存在于服务端环境变量。

## 12. 验收清单

- [ ] 真实邮件完成发布、验证、编辑、取消和删除闭环。
- [ ] 搜索 `6160` 和 suburb 名称得到正确结果，浏览器定位可用。
- [ ] 已结束活动不出现在公开列表，详情返回 404。
- [ ] Perth 的上午八点在任何访问者时区都显示为当地上午八点。
- [ ] 跨当地日期的发布被明确拒绝。
- [ ] self 活动在所有相关位置显示完整地址和准确地图点。
- [ ] 聚合记录显示来源链接，不显示邮箱或管理功能。
- [ ] 零活动 suburb 页面仍有内容、附近链接和发布入口。
- [ ] 首页和 suburb 页源代码包含服务端渲染内容。
- [ ] honeypot 和限流能阻止脚本化提交。
- [ ] 匿名 Supabase key 无法读取邮箱和管理 token。
- [ ] lint、格式、类型检查、测试和生产构建全部通过。
