# GarageSale.com.au

面向澳大利亚用户的 garage sale 搜索目录与无账号免费发布工具。

## 当前状态

项目通过 Next.js 与 OpenNext 运行于 Cloudflare Workers，Postgres/PostGIS 使用 Supabase，图片与独立备份使用 Cloudflare R2。公开活动、卖家邮箱、哈希 token 和邮件 outbox 已分层。开发与部署共用一套外部服务配置，详见[架构基线](docs/architecture/garage-sale-architecture.md)。

## 环境要求

- Node.js 24 LTS
- pnpm 10
- Supabase CLI（执行远端 migration 时需要）

## 本地运行

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:3000`。

开发服务器与部署实例都连接 `.env.local` 中的同一套 Supabase、R2、Mapbox、Turnstile 和 Resend 配置。发布测试会写入共享数据并发送真实邮件；仅在已获得授权时执行。测试必须使用可识别内容并清理自己创建的行，不得修改真实活动。

## 数据库迁移

链接唯一共享项目后，先完成逻辑导出备份，再审查并执行迁移：

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push --dry-run
pnpm db:push  # 已完成逻辑导出备份后执行
```

不得对共享项目使用 `db reset --linked` 或 `--include-seed`。

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
