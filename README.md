# GarageSale.com.au

面向澳大利亚用户的 garage sale 搜索目录与无账号免费发布工具。

## 当前状态

项目正在按新的生产架构重构：Next.js 通过 OpenNext 运行于 Cloudflare Workers，Postgres/PostGIS 使用 Supabase，图片与独立备份使用 Cloudflare R2。公开活动、卖家邮箱、哈希 token 和邮件 outbox 已分层。本地、staging 与 production 必须使用独立资源，详见[架构基线](docs/architecture/garage-sale-architecture.md)。

## 环境要求

- Node.js 24 LTS
- pnpm 10
- Supabase CLI（执行本地数据库和迁移时需要）
- Docker Desktop或兼容运行时（本地Supabase需要）

## 本地运行

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:3000`。

本地开发使用 Supabase CLI 启动真实 Postgres/PostGIS、RLS、Storage 兼容服务和 seed 数据。不存在文件型 demo 数据路径。`EMAIL_DELIVERY_MODE=preview` 时验证与管理链接直接显示在页面；图片由 Wrangler 的本地 R2 binding 保存。

## 运行模式

| 配置                  | 可选值                             | 用途                           |
| --------------------- | ---------------------------------- | ------------------------------ |
| `DEPLOYMENT_ENV`      | `local` / `staging` / `production` | 环境隔离和外部服务强制规则     |
| `EMAIL_DELIVERY_MODE` | `preview` / `resend`               | 页面显示测试链接或发送真实邮件 |

staging 与 production 会强制检查 Supabase、Mapbox 和 Turnstile 配置；切换到 `resend` 时会检查 Resend key 与发件人。

## 本地数据库

Docker可用后执行：

```bash
pnpm db:start
pnpm db:reset
pnpm db:lint
pnpm db:types
```

`db:types` 会用本地数据库生成结果覆盖临时的 `src/types/database.generated.ts`。停止容器使用 `pnpm db:stop`。

## 常用命令

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
pnpm audit
pnpm build
pnpm build:worker
pnpm preview
pnpm check
```

`pnpm check` 包含格式、Lint、类型、单元测试和生产构建；E2E在本地单独运行，并在GitHub Actions中安装 Chromium 后执行。

## 文档

- [产品需求](docs/prd.md)
- [技术决策](docs/decisions.md)
- [数据模型](docs/data-model.md)
- [外部服务配置备忘](docs/external-setup-checklist.md)
- [部署与外部服务接入](docs/deployment.md)

## 部署

部署目标为 Cloudflare Workers + Supabase。`pnpm deploy` 会修改外部环境，只能在获得部署授权并完成 [部署与外部服务接入](docs/deployment.md) 的账户、secret、R2 bucket 和生产验收后执行。
