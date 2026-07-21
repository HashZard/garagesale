# GarageSale.com.au

面向澳大利亚用户的 garage sale 搜索目录与无账号免费发布工具。

## 当前状态

MVP 代码已覆盖搜索、地图、详情、发布、邮件验证、私人管理、链接找回、SEO 页面和最小后台。Supabase 已配置为开发、Preview 与 Production 共用的生产项目；Mapbox、Resend、Vercel 和正式域名仍待配置，详见[外部服务配置备忘](docs/external-setup-checklist.md)。本地开发使用 `.env.local`，不得提交真实密钥。

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

默认配置为 `APP_DATA_MODE=demo` 和 `EMAIL_DELIVERY_MODE=preview`：使用本机临时演示数据，邮件验证链接直接显示在页面，不依赖任何外部服务。演示活动只写入操作系统临时目录，可能随系统清理而消失，不能视为生产持久化。

## 运行模式

| 配置                  | 可选值               | 用途                                  |
| --------------------- | -------------------- | ------------------------------------- |
| `APP_DATA_MODE`       | `demo` / `supabase`  | 本机临时演示数据或真实数据库与Storage |
| `EMAIL_DELIVERY_MODE` | `preview` / `resend` | 页面显示测试链接或发送真实邮件        |

切换到 `supabase` 时，服务端会强制检查 Supabase 和两类 Mapbox token；切换到 `resend` 时会强制检查 Resend key 与发件人。

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

部署目标为 Vercel + Supabase。当前不执行真实部署；完成外部配置后，按照 [部署与外部服务接入](docs/deployment.md) 和备忘清单逐项接入并执行生产验收。
