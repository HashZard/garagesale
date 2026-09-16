# GarageSale 开发代理指南

GarageSale 是面向澳大利亚用户的车库售卖活动目录与无账号发布工具。

## 开始前必读

- 产品范围：`docs/prd.md`
- 架构基线：`docs/architecture/garage-sale-architecture.md`
- 架构决定：`adr/README.md`
- 历史技术决定：`docs/decisions.md`
- 数据模型：`docs/data-model.md`
- 外部配置：`docs/external-setup-checklist.md`

当前 Next.js 版本包含可能不同于旧版本的 API 和约定。修改 Next.js 代码前，先阅读 `node_modules/next/dist/docs/` 中与任务相关的文档，并遵守弃用提示。

## 关键命令

```bash
pnpm dev            # 本地开发（直接连共享数据库）
pnpm db:lint        # 对共享数据库执行 lint，只读
pnpm db:push        # 应用未执行的 migration 到共享数据库，执行前必须已备份
pnpm db:types       # 重新生成 src/types/database.generated.ts
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm format         # Prettier 写入（check 会校验格式，先跑这个）
pnpm test           # Vitest 单元测试
pnpm test:e2e       # Playwright 端到端测试
pnpm check          # lint + format:check + typecheck + test + build
pnpm build:worker   # OpenNext/Cloudflare Workers 构建，CI 单独门禁
```

系统只有一套环境，不存在本地数据库（[ADR-0002](adr/0002-single-shared-environment.md)）。`pnpm dev`、
`pnpm test` 与 `pnpm check` 都连接同一个共享 Supabase 项目，需要 `.env.local` 中的 `SUPABASE_URL`、
`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SECRET_KEY`。

因此本地与测试的写入都是真实数据：集成和 E2E 用例必须使用可识别的测试内容，并在结束时删除自己创建的行；
不得依赖种子数据，不得对真实活动执行删除或状态变更。

## 目录规则

- `src/app`：路由、布局和数据装配，页面保持轻量。
- `src/components/ui`：通用 UI 原语；`src/components/{map,sale,forms}`：业务组件。
- `src/modules/{sales,locations,admin}`：查询、命令、映射，所有 Supabase 访问的唯一落点。
- `src/lib/db/*`：面向 `src/app` 的稳定再导出层，本身不写查询逻辑，只从 `src/modules` 转出。
- `src/platform/{database,security}`：Supabase 客户端与 Turnstile 适配。
- `src/lib`：校验 schema（`validation/`）、邮件、地理、限流、会话等尚未收敛到 module 的能力。
- `src/config`、`src/types`：常量、站点配置与类型（`database.generated.ts` 由 `pnpm db:types` 生成，勿手改）。
- `tests`：Vitest 用例与 `tests/e2e` Playwright 用例。
- `supabase/migrations`：只追加迁移，禁止修改已经应用的历史迁移。

## 强制规则

- 个人项目、低并发：按当前需求的最简实现交付，不为假想的规模、扩展点或极端场景提前抽象；高可用、分片、多级缓存等议题不在讨论范围，确有必要的权衡写进 `adr/`。
- 所有项目文档使用中文；面向最终用户的网站文案使用英文。
- 不超出 MVP PRD，不增加地址遮挡、多日活动、账号或浏览统计。
- Server Components 优先；只在需要交互或浏览器 API 时使用 Client Components。
- 不在页面或组件中直接查询 Supabase；数据库访问只写在 `src/modules/*/queries.ts`、`commands.ts` 与 `src/platform/database`，页面经由 `src/lib/db/*` 引用。
- 客户端和服务端共用同一份 Zod schema（当前位于 `src/lib/validation`）。
- 公开活动、卖家联系方式和访问 token 必须分表；token 只保存 SHA-256 哈希。
- 系统只有一套环境：一个 Supabase 项目、一组 R2 bucket、一组外部服务凭据，本地与线上共用。不新增 staging、preview 或本地数据实例。
- `DEPLOYMENT_ENV` 只有 `local` 与 `production`，表示代码运行位置，不表示数据边界；不得用它切换数据源。
- 应用 migration 前必须先完成逻辑导出备份。migration 只追加、向后兼容；删除列或收紧约束单独成一次已备份的变更。
- 所有运行位置使用完整真实服务配置，不提供本地认证绕过或邮件预览。
- 任意写链路必须可重试；数据库写入和邮件 outbox 必须在同一事务完成。
- 不提交任何真实密钥；外部人工配置及时更新备忘清单。
- 新决策域写入 `adr/`；只追溯旧实现时查看 `docs/decisions.md`。
- 每次 schema 变化都增加 migration、更新生成类型和 `docs/data-model.md`。
- 完成功能后运行与风险相匹配的测试；交付前运行 `pnpm check`。

## 常见任务

- 增加销售字段：migration → 备份 → `pnpm db:push` → `pnpm db:types` → 校验 schema → 模块查询/命令 → 表单 → 展示 → 测试 → 数据模型文档。
- 增加页面：路由装配 → metadata → loading/error/not-found → 业务组件 → 测试。
- 修改业务规则：先更新PRD或决策记录，再修改校验、数据库约束、查询和测试。
