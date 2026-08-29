# GarageSale 技术架构

> 状态：重构目标基线
>
> 决策日期：2026-08-20
>
> 关联决定：[ADR-0001](../../adr/0001-platform-and-runtime.md)、[ADR-0002](../../adr/0002-shared-external-services.md)

## 1. 目标与边界

GarageSale 是面向澳大利亚用户的活动目录和无账号发布工具。公开页面必须适合搜索引擎抓取，卖家必须能通过邮件完成验证、管理和恢复，管理员必须能审核活动。系统不实现普通用户账号、支付、聊天、收藏或原生应用。

架构目标：

- 公开 HTML 在边缘缓存，数据库故障时已缓存页面仍可访问。
- 距离、时间、状态和数据完整性由 Postgres/PostGIS 约束，不在组件里维护第二套规则。
- 卖家 PII 不进入公开 DTO、缓存、分析事件或普通应用日志。
- 写入、邮件和媒体清理可重试，失败不会生成无法恢复的半完成状态。
- 平台费用有明确基线、额度和升级触发条件。

## 2. 系统组成

| 层级       | 选型                        | 责任                                            |
| ---------- | --------------------------- | ----------------------------------------------- |
| Web        | Next.js App Router          | SSR、SSG/ISR、Route Handlers、Server Components |
| 运行与 CDN | Cloudflare Workers          | OpenNext 运行、边缘缓存与静态资产               |
| 数据       | Supabase Postgres + PostGIS | 活动、位置、状态机、私密数据、outbox、限流      |
| 媒体       | Cloudflare R2               | 活动图片、临时上传、独立备份                    |
| 地图       | Mapbox                      | 交互地图、地址建议、服务端地址验证              |
| 邮件       | Resend                      | 验证、管理链接恢复和投递事件                    |
| 防机器人   | Cloudflare Turnstile        | 公开写入口挑战                                  |
| 分析       | Cloudflare Web Analytics    | 无 cookie 的公开流量统计                        |
| CI/CD      | GitHub Actions              | 代码、数据库、浏览器和 workerd 门禁             |

## 3. 渲染与缓存

| 页面             | 策略                    | 索引                               |
| ---------------- | ----------------------- | ---------------------------------- |
| 首页默认视图     | SSR + 短缓存            | index                              |
| 任意搜索参数     | SSR，不共享精确坐标缓存 | noindex，canonical 到首页或 suburb |
| 州页面           | 构建生成 + ISR          | index                              |
| suburb 页面      | 按需 ISR + tag 失效     | 满足内容质量阈值时 index           |
| 活动详情         | 短缓存 + 状态变更失效   | 仅 published 且未过期时 index      |
| 静态信息页       | SSG                     | index                              |
| 发布、恢复       | SSG shell + 动态提交    | noindex                            |
| 管理、验证、后台 | 动态、`no-store`        | noindex                            |

发布、更新、取消、删除和管理员审核必须失效活动、suburb、state 与 sitemap 标签。固定 ISR 时间不能成为唯一失效机制。

## 4. 数据边界

- `sales` 只保存公开活动和生命周期字段。
- `sale_private_details` 保存联系邮箱及保留周期字段。
- `sale_access_tokens` 保存 token 哈希、用途、到期和使用时间。
- `sale_media` 保存 R2 key、排序、类型、尺寸和发布状态；`sales.photos` 仅保留为兼容投影，由数据库触发器同步。
- `email_outbox` 保存可重试的投递任务；成功后清除不再需要的敏感 payload。
- `moderation_events` 保存管理员动作审计，不保存管理 token。
- `suburbs` 是地址规范化和 SEO 路由的权威数据集。

所有状态变化通过数据库函数完成。应用不得跨多个独立请求手工拼接需要原子性的写入。

## 5. Token 与私密会话

验证 token 和管理 token 分开生成，使用至少 256 bit 随机值。数据库只保存 SHA-256 哈希。

验证 token 单次使用并设置短期有效期。管理 token 可撤销；恢复管理链接时生成新 token，并撤销旧 token。访问带 token 的入口后，服务端换取 HttpOnly、Secure、SameSite=Lax 的卖家会话，再重定向到不含 token 的 URL。

私密入口设置 `Referrer-Policy: no-referrer`、`Cache-Control: private, no-store`，并从分析、访问日志和错误上下文中删除 token。

## 6. 查询规则

- 所有附近活动和附近 suburb 查询在 PostGIS 内完成。
- State 页面只列出有活动、近期有活动或人工选定的 suburb，不输出全州完整数据集。
- Sitemap 使用集合查询，不允许按每条活动再次查询 suburb。
- 列表查询必须分页，不使用无边界 `.limit(5000)` 作为页面数据接口。
- 公开 DTO 由数据库 view/RPC 产生，应用只在一个 mapper 中转换字段命名。

## 7. 媒体链路

上传前创建与活动草稿关联的媒体记录。服务端验证文件大小、实际 MIME、像素尺寸和对象归属；不得信任浏览器提供的扩展名或 content type。未绑定活动或超过保留期的临时对象由定时任务删除。

公开页面只使用固定尺寸的优化图片，不直接输出原始上传。图片 URL 不包含卖家 token 或邮箱。

## 8. 环境

开发、预览与正式实例共用同一个 Supabase 项目、R2 bucket、Mapbox、Turnstile、Resend 及站点 URL。应用没有环境模式、demo store、邮件预览或安全绕过；每次开发操作均按真实服务路径执行。

共享项目不得导入 `supabase/seed.sql` 或执行任何 reset。migration 必须先审查 dry run 并确认备份可用后再应用。

## 9. SEO 基线

- HTML 语言为 `en-AU`。
- 每个可索引页面包含唯一 title、description、canonical、Open Graph、语义标题与内链。
- 活动输出 `Event`，目录输出 `ItemList`，层级页面输出 `BreadcrumbList`。
- Sitemap 使用索引和分片；只包含 canonical、可索引、当前有效 URL。
- 空白或重复 suburb 页面保持可访问，但在达到内容质量阈值前 `noindex,follow`。
- 地图不是主要内容；服务端活动列表必须在不执行客户端 JavaScript 时存在。

## 10. 备份与恢复

- Supabase 自动备份不是唯一恢复路径。
- 每日执行逻辑数据库导出并写入独立 R2 backup bucket。
- 每日导出 R2 媒体清单；bucket 开启适合的对象版本或保留策略。
- 每月抽查备份，每季度在隔离环境完成数据库和媒体恢复演练。
- migration、恢复脚本和恢复说明必须跟随 schema 变更更新。

## 11. 质量门禁

合并前必须通过：

1. Prettier、ESLint、TypeScript 和单元测试。
2. Supabase reset、DB lint、生成类型无漂移。
3. RLS、公开 DTO、token 哈希和数据库状态机集成测试。
4. Next.js production build 与 OpenNext/workerd smoke test。
5. Playwright 桌面和移动端核心闭环。
6. Sitemap、canonical、JSON-LD、noindex 和缓存头测试。
