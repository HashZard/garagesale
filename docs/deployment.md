# 部署与外部服务接入

架构基线见 [`docs/architecture/garage-sale-architecture.md`](architecture/garage-sale-architecture.md)。本文只记录可执行部署流程，不保存任何凭据值。

## 1. 环境

开发、预览与正式 Worker 共用同一套 Cloudflare R2 bucket、Supabase 项目、Mapbox、Turnstile、Resend 和站点 URL。所有实例都使用相同的真实服务路径；不得用环境变量切换 demo、邮件预览或反机器人绕过。

## 2. 本地验证

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
pnpm check
```

Windows 本机的 OpenNext bundle 可能因 symlink 权限失败；Linux CI 中的 `pnpm build:worker` 是强制门禁。本地需要验证 Worker 时使用 WSL2/Linux 或 `pnpm preview`。

## 3. Cloudflare

1. 由项目所有者账户创建 `garagesale-opennext-cache`、`garagesale-photos` 与 `garagesale-backups`。
2. 连接 GitHub 仓库，构建命令为 `pnpm build:worker`。
3. 按 `.env.example` 写入共享 secret；不得把 secret 写入 `wrangler.jsonc`。
4. 为正式 Worker 绑定自定义域名，DNS 由项目所有者持有。
5. 启用 Workers Logs、Cloudflare Web Analytics、用量告警和消费上限。
6. 使用 `pnpm deploy` 前必须取得明确部署授权；正常生产发布由 CI 完成。

## 4. Supabase

1. 创建一个不会自动暂停、已开启备份的 Supabase 项目。
2. 每次 migration 先执行 `supabase db push --dry-run`，确认后再执行 `supabase db push`。
3. 不得向共享项目执行 `supabase/seed.sql`、`db reset --linked` 或其他会清空数据的命令。
4. 匿名角色只能读取 `suburbs`、`public_sales` 和明确授权的公开 RPC。
5. `sale_private_details`、`sale_access_tokens`、`email_outbox`、`moderation_events` 与 `rate_limits` 不授予匿名读取。

## 5. 外部服务

- Mapbox 浏览器 token 只允许正式域名与本地开发地址；服务端 token 不进入浏览器包。
- Resend webhook、发件域名、DKIM/SPF/DMARC 和告警由项目所有者账户管理。
- Turnstile 使用一个同时允许正式域名与本地开发地址的 widget；secret 只写入 Worker secret。
- R2 图片通过站内 `/media/*` 返回，不公开对象管理端点或签名凭据。

## 6. 发布和回滚

发布顺序：数据库备份 → migration 审查与应用 → Worker → smoke/E2E → 线上闭环抽查。

代码异常回滚到上一成功 Worker 版本。数据库 migration 不通过删除列或重写历史 migration 回滚；使用预先准备的向前修复 migration。涉及数据变换时，发布前必须记录恢复 SQL 和备份对象 key。

## 7. 生产验收

- 搜索、州、suburb、活动详情和 sitemap 返回正确公开数据。
- 发布写入私密表、两类哈希 token 和 outbox；数据库中不存在可直接使用的 token。
- Turnstile、honeypot 和限流生效。
- 验证、管理、恢复和管理员页面为 `noindex`、`no-store`，URL 不进入分析事件。
- R2 上传拒绝伪造 MIME，公开图片带长期缓存和 `nosniff`。
- 取消、删除和过期活动从公开查询与 sitemap 消失。
- 每日数据库导出、R2 清单和恢复演练已配置。
