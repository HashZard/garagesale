# 技术决策记录

> 本文件保留 2026-08-20 之前的历史决定。当前有效跨层决定迁移到 `adr/`，与新架构冲突的历史条目不再生效。

## 2026-08-23

- ADR-0002 替代 ADR-0001 中关于隔离 local、staging、production 数据环境的决定；开发、预览和部署共用一套外部服务配置。

## 2026-08-20

- ADR-0001 替代 Vercel 固定托管、共用生产 Supabase、运行时 demo store、明文管理 token、Supabase Storage 固定图片层和同步邮件发送决定。
- 新目标为 Next.js + Cloudflare Workers + Supabase Postgres/PostGIS + Cloudflare R2；完整边界见 `docs/architecture/garage-sale-architecture.md`。

本文件按日期追加重要实现选择。已经合并的历史决定不修改；如果决定变化，新增一条说明替代关系。

## 2026-07-19

- 采用简化 MVP：完整地址立即公开，不实现地址遮挡、延迟公开和坐标偏移。
- 只支持单日活动；多日活动每天单独发布。
- 取消、删除和过期活动的公开详情统一返回 404，不建立归档状态和 410 分支。
- 不实现重复活动检测和浏览量统计。
- 使用 Node.js 24 LTS、Next.js App Router、Tailwind CSS v4、shadcn/ui 和 pnpm。
- 外部服务尚未开通；开发阶段优先完成本地代码，所有人工配置持续记录到 `docs/external-setup-checklist.md`。
- 限流优先使用 Supabase/Postgres 中的原子时间窗口计数，避免为 MVP 增加独立限流供应商。
- 所有项目文档使用中文；产品面向澳大利亚用户，因此网站界面文案保持英文。
- 将 Supabase CLI 作为开发依赖固定在仓库内，所有开发者使用相同版本执行本地迁移、seed、数据库检查和类型生成。
- 公开数据库访问采用RLS、列级授权和 `security_invoker` view/RPC组合；邮箱和管理 token 不进入任何公开DTO。
- 外部服务未准备期间使用 `APP_DATA_MODE=demo` 和 `EMAIL_DELIVERY_MODE=preview` 完成本地开发；生产必须分别切换为 `supabase` 和 `resend`，业务组件不感知供应商模式。
- 增加 `date-fns` 与 `date-fns-tz`，用于可靠地把各州当地输入转换成 `timestamptz` 并保证展示不受访问者时区影响。
- 使用 Vercel Web Analytics 的官方 Next.js 组件，不建立分析供应商抽象；只在 Vercel 构建中加载，管理、验证、恢复等私人路径在发送前统一丢弃，防止管理 token 或后台路径进入分析数据。
- 浏览器公开 Mapbox token 只用于交互地图和地址建议，服务端永久地理编码使用独立的 `MAPBOX_SERVER_TOKEN`。
- 使用 Playwright 覆盖桌面端、移动端和无账号发布管理闭环；Vitest只运行单元测试，CI分别执行两套测试。
- 演示活动以操作系统临时目录中的追加日志保存，使 Next.js 开发 worker 能共享发布与验证状态；该机制不提供生产持久化保证，生产必须使用Supabase模式。

## 2026-07-21

- Supabase 已完成接入。开发、Preview 与 Production 共用同一个 Supabase 数据库，替代原先为 Preview/开发和 Production 分别创建项目的计划；共享数据库不导入开发 seed，所有迁移必须先在本地验证后再按发布流程应用。
- Mapbox 同样采用一套生产账号及一组浏览器、服务端 token，供本地、Preview 与 Production 共用；浏览器 token 必须将正式域名、本地地址和实际需要的 Preview 域名加入允许来源，服务端 token 保持仅服务端可用。
- Mapbox Geocoding API 不要求 secret scope；`MAPBOX_SERVER_TOKEN` 使用独立的最小权限 `pk` token 并仅存于服务端，不为获得 `sk` 前缀而授予无关的账户级 secret scope。
