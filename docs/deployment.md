# 部署与外部服务接入

架构基线见 [`docs/architecture/garage-sale-architecture.md`](architecture/garage-sale-architecture.md)。本文只记录可执行部署流程，不保存任何凭据值。

## 1. 环境

| 环境            | Cloudflare                     | Supabase             | 数据                |
| --------------- | ------------------------------ | -------------------- | ------------------- |
| Local/Test      | Wrangler 本地 binding          | Supabase CLI         | `seed.sql` 虚构数据 |
| Staging/Preview | Preview Worker、独立 R2 bucket | 独立 staging 项目    | 仅虚构数据          |
| Production      | 正式 Worker、正式 R2 bucket    | 独立 production 项目 | 获授权的真实数据    |

不得把 production URL、service role key、R2 bucket 或 Mapbox 服务端 token 写入 Local 和 Preview。Preview 必须发送 `X-Robots-Tag: noindex`，且站点级 metadata 不允许索引。

## 2. 本地验证

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm db:start
pnpm db:reset
pnpm db:types
pnpm db:lint
pnpm check
```

Windows 本机的 OpenNext bundle 可能因 symlink 权限失败；Linux CI 中的 `pnpm build:worker` 是强制门禁。本地需要验证 Worker 时使用 WSL2/Linux 或 `pnpm preview`。

## 3. Cloudflare

1. 由项目所有者账户创建 `garagesale-opennext-cache`、`garagesale-photos`、`garagesale-backups` 及对应 Preview bucket。
2. 连接 GitHub 仓库，构建命令为 `pnpm build:worker`。
3. 按 `.env.example` 写入 staging 或 production secret；不得把 secret 写入 `wrangler.jsonc`。
4. 为正式 Worker 绑定自定义域名，DNS 由项目所有者持有。
5. 启用 Workers Logs、Cloudflare Web Analytics、用量告警和消费上限。
6. 使用 `pnpm deploy` 前必须取得明确部署授权；正常生产发布由 CI 完成。

## 4. Supabase

1. Staging 与 Production 创建独立项目，Production 使用不会自动暂停且有自动备份的计划。
2. migration 先在本地 reset、lint 和集成测试，再按顺序应用到 staging。
3. staging smoke test 通过后才应用到 production；不得向远端执行 `seed.sql`。
4. 匿名角色只能读取 `suburbs`、`public_sales` 和明确授权的公开 RPC。
5. `sale_private_details`、`sale_access_tokens`、`email_outbox`、`moderation_events` 与 `rate_limits` 不授予匿名读取。

## 5. 外部服务

- Mapbox 浏览器 token 只允许正式域名、必要的 Preview 域名和本地开发地址；服务端 token 不进入浏览器包。
- Resend webhook、发件域名、DKIM/SPF/DMARC 和告警由项目所有者账户管理。
- Turnstile 为 staging、production 分别创建 widget；secret 只写入 Worker secret。
- R2 图片通过站内 `/media/*` 返回，不公开对象管理端点或签名凭据。

## 6. 发布和回滚

发布顺序：数据库备份 → migration → staging Worker → smoke/E2E → production Worker → 生产闭环抽查。

代码异常回滚到上一成功 Worker 版本。数据库 migration 不通过删除列或重写历史 migration 回滚；使用预先准备的向前修复 migration。涉及数据变换时，发布前必须记录恢复 SQL 和备份对象 key。

## 7. 生产验收

- 搜索、州、suburb、活动详情和 sitemap 返回正确公开数据。
- 发布写入私密表、两类哈希 token 和 outbox；数据库中不存在可直接使用的 token。
- Turnstile、honeypot 和限流生效。
- 验证、管理、恢复和管理员页面为 `noindex`、`no-store`，URL 不进入分析事件。
- R2 上传拒绝伪造 MIME，公开图片带长期缓存和 `nosniff`。
- 取消、删除和过期活动从公开查询与 sitemap 消失。
- 每日数据库导出、R2 清单和恢复演练已配置。
