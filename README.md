# GarageSale.com.au

面向澳大利亚用户的 garage sale 搜索目录与无账号免费发布工具。

## 当前状态

Next.js + OpenNext 运行于 Cloudflare Workers，数据在 Supabase Postgres/PostGIS，图片与备份在 Cloudflare R2。

**本地开发直接读写线上共享数据库**，不存在本地实例或 staging（[ADR-0002](adr/0002-single-shared-environment.md)）。设计全貌见[架构基线](docs/architecture/garage-sale-architecture.md)。

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

迁移直接作用于线上数据。**必须先完成逻辑导出备份**，且不得执行 `db reset --linked` 或导入 seed。
完整流程见[部署与外部服务接入](docs/deployment.md)。

## 常用命令

```bash
pnpm check     # 格式 + Lint + 类型 + 单元测试 + 生产构建，交付前必跑
pnpm test:e2e  # 首次需先 pnpm exec playwright install chromium
```

全部脚本见 `package.json`；各命令的适用场景见 [AGENTS.md](AGENTS.md)。`pnpm build:worker` 由 CI 单独门禁。

## 数据来源

`suburbs` 表的 suburb / postcode / 坐标数据来自第三方澳大利亚地名数据集。

| 项目           | 值         |
| -------------- | ---------- |
| 数据集         | **待确定** |
| 许可证         | **待确定** |
| 要求的署名文本 | **待确定** |

该表在数据集选定并确认许可证前保持未决。上线前必须填写本表，并把要求的署名文本同时呈现在
About 页面；确认项见 [`docs/external-setup-checklist.md`](docs/external-setup-checklist.md)「数据与合规」。

用户自行发布的活动数据由卖家提供，聚合活动记录始终链接原始来源。

## 文档

- [产品需求](docs/prd.md)
- [技术决策](docs/decisions.md)
- [数据模型](docs/data-model.md)
- [外部服务配置备忘](docs/external-setup-checklist.md)
- [部署与外部服务接入](docs/deployment.md)

## 部署

部署目标为 Cloudflare Workers + Supabase。`pnpm deploy` 会修改外部环境，只能在获得部署授权并完成 [部署与外部服务接入](docs/deployment.md) 的账户、secret、R2 bucket 和生产验收后执行。
