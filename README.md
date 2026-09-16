# GarageSale.com.au

面向澳大利亚用户的 garage sale 搜索目录与无账号免费发布工具。

## 当前状态

项目正在按新的生产架构重构：Next.js 通过 OpenNext 运行于 Cloudflare Workers，Postgres/PostGIS 使用 Supabase，图片与独立备份使用 Cloudflare R2。公开活动、卖家邮箱、哈希 token 和邮件 outbox 已分层。系统只维护一套共享环境，本地开发与线上部署使用同一个数据库和同一组 R2 bucket，详见[架构基线](docs/architecture/garage-sale-architecture.md)与 [ADR-0002](adr/0002-single-shared-environment.md)。

## 环境要求

- Node.js 24 LTS
- pnpm 10
- Supabase CLI（执行迁移、lint 和类型生成时需要）
- 共享 Supabase 项目的访问凭据

## 本地运行

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

浏览器访问 `http://localhost:3000`。

本地开发直接连接唯一的共享 Supabase 项目，没有本地数据库、demo 数据路径或 seed 流程。**本地的写入就是线上数据**：调试时不要删除或改动真实活动，测试数据用完自行清理。`EMAIL_DELIVERY_MODE=preview` 时验证与管理链接直接显示在页面，不会发送真实邮件。

## 运行模式

| 配置                  | 可选值                 | 用途                           |
| --------------------- | ---------------------- | ------------------------------ |
| `DEPLOYMENT_ENV`      | `local` / `production` | 代码运行位置，不区分数据源     |
| `EMAIL_DELIVERY_MODE` | `preview` / `resend`   | 页面显示测试链接或发送真实邮件 |

两种取值连接的都是同一个数据库。`production` 会强制检查 Mapbox 与 Turnstile 配置并允许搜索引擎索引，`local` 允许省略这些外部凭据并保持 `noindex`；切换到 `resend` 时会检查 Resend key 与发件人。

## 数据库

只有一个 Supabase 项目。首次使用先 `pnpm exec supabase link` 绑定该项目，然后：

```bash
pnpm db:lint     # 只读检查
pnpm db:types    # 重新生成 src/types/database.generated.ts
pnpm db:push     # 应用未执行的 migration，执行前必须已完成逻辑导出备份
```

`db:push` 直接作用于线上数据库且没有预演位。migration 只追加、向后兼容；删除列或收紧约束单独成一次已备份的变更。项目没有种子数据。

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
