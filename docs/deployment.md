# 部署与外部服务接入

架构基线见 [`docs/architecture/garage-sale-architecture.md`](architecture/garage-sale-architecture.md)。本文只记录可执行部署流程，不保存任何凭据值。

## 1. 环境

系统只有一套环境，见 [ADR-0002](../adr/0002-single-shared-environment.md)。

| 运行位置        | Cloudflare               | Supabase | 数据         |
| --------------- | ------------------------ | -------- | ------------ |
| 本地 `pnpm dev` | Wrangler 本地 binding    | 共享项目 | 线上真实数据 |
| 已部署 Worker   | 正式 Worker、正式 bucket | 同一项目 | 线上真实数据 |

本地开发直接读写线上数据库与正式 R2 bucket，没有沙箱。`DEPLOYMENT_ENV=local` 只放宽 Mapbox、Turnstile 与管理员密钥的缺省并保持 `noindex`，不切换数据源。service role key 只写入 Worker secret 与本地 `.env.local`，不进入仓库。

## 2. 本地验证

```bash
cp .env.example .env.local   # 填入共享 Supabase 项目的 URL 与 key
pnpm install --frozen-lockfile
pnpm db:lint
pnpm db:types
pnpm check
```

`db:lint` 与 `db:types` 作用于共享数据库，都是只读操作。写入共享数据库只有 `pnpm db:push` 一条路径，见第 4 节。

Windows 本机的 OpenNext bundle 可能因 symlink 权限失败；Linux CI 中的 `pnpm build:worker` 是强制门禁。本地需要验证 Worker 时使用 WSL2/Linux 或 `pnpm preview`。

## 3. Cloudflare

1. 由项目所有者账户创建 `garagesale-opennext-cache`、`garagesale-photos`、`garagesale-backups`，各只有一个，不配置 preview bucket。
2. 连接 GitHub 仓库，构建命令为 `pnpm build:worker`。
3. 按 `.env.example` 写入唯一一组 Worker secret；不得把 secret 写入 `wrangler.jsonc`。
4. 为正式 Worker 绑定自定义域名，DNS 由项目所有者持有。
5. 启用 Workers Logs、Cloudflare Web Analytics、用量告警和消费上限。
6. 使用 `pnpm deploy` 前必须取得明确部署授权；正常生产发布由 CI 完成。

## 4. Supabase

1. 只有一个项目，使用不会自动暂停且有自动备份的计划，区域选 `ap-southeast-2`。
2. 本机执行 `supabase link` 绑定该项目；CI 使用 `SUPABASE_ACCESS_TOKEN` 与 `SUPABASE_PROJECT_ID`。
3. 应用 migration 的顺序固定为：逻辑导出备份 → `pnpm db:lint` → `pnpm db:push` → `pnpm db:types` 并提交类型漂移。未备份不得 push。
4. migration 只追加、向后兼容。删除列、收紧约束或改写数据各自作为一次独立且已备份的变更。
5. 不存在种子数据流程；共享数据库只接受 migration 写入结构。
6. 匿名角色只能读取 `suburbs`、`public_sales` 和明确授权的公开 RPC。
7. `sale_private_details`、`sale_access_tokens`、`email_outbox`、`moderation_events` 与 `rate_limits` 不授予匿名读取。

## 5. 外部服务

- Mapbox 只有一组 token。浏览器 token 只允许正式域名与本地开发地址；服务端 token 不进入浏览器包。
- Resend webhook、发件域名、DKIM/SPF/DMARC 和告警由项目所有者账户管理。
- Turnstile 只创建一个 widget，允许域名包含正式域名与 `localhost`；secret 只写入 Worker secret 与本地 `.env.local`。
- R2 图片通过站内 `/media/*` 返回，不公开对象管理端点或签名凭据。

## 6. 发布和回滚

发布顺序：数据库备份 → migration → CI 门禁（含集成与 E2E）→ 部署 Worker → 生产闭环抽查。没有 staging 预演位，备份和向前修复 migration 是唯一的数据保护手段。

代码异常回滚到上一成功 Worker 版本。数据库 migration 不通过删除列或重写历史 migration 回滚；使用预先准备的向前修复 migration。涉及数据变换时，发布前必须记录恢复 SQL 和备份对象 key。

## 7. 生产验收

- 搜索、州、suburb、活动详情和 sitemap 返回正确公开数据。
- 发布写入私密表、两类哈希 token 和 outbox；数据库中不存在可直接使用的 token。
- Turnstile、honeypot 和限流生效。
- 验证、管理、恢复和管理员页面为 `noindex`、`no-store`，URL 不进入分析事件。
- R2 上传拒绝伪造 MIME，公开图片带长期缓存和 `nosniff`。
- 取消、删除和过期活动从公开查询与 sitemap 消失。
- 每日数据库导出、R2 清单和恢复演练已配置；恢复演练使用一次性临时 Supabase 项目，演练后删除。
