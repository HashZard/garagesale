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
pnpm dev            # 本地开发
pnpm lint           # ESLint
pnpm typecheck      # TypeScript
pnpm test           # 单元测试
pnpm test:e2e       # Playwright 端到端测试
pnpm build          # 生产构建
pnpm check          # 完整质量检查
```

## 目录规则

- `src/app`：路由、布局和数据装配，页面保持轻量。
- `src/components/ui`：通用 UI 原语。
- `src/components/{map,sale,forms}`：业务组件。
- `src/modules`：按业务能力组织 schema、查询、命令、映射与组件。
- `src/platform`：Supabase、R2、Mapbox、Resend、限流与可观测性适配。
- `src/shared`：不包含业务规则的 UI、配置与工具。
- `supabase/migrations`：只追加迁移，禁止修改已经应用的历史迁移。

## 强制规则

- 所有项目文档使用中文；面向最终用户的网站文案使用英文。
- 不超出 MVP PRD，不增加地址遮挡、多日活动、账号或浏览统计。
- Server Components 优先；只在需要交互或浏览器 API 时使用 Client Components。
- 不在页面或组件中直接查询 Supabase；数据库访问只进入 `src/modules/*/queries.ts`、`commands.ts` 与 `src/platform/database`。
- 客户端和服务端共用所属业务模块中的 Zod schema。
- 公开活动、卖家联系方式和访问 token 必须分表；token 只保存 SHA-256 哈希。
- 开发与部署使用同一套 Supabase、R2 及外部服务配置；禁止向该共享项目导入开发 seed 或执行破坏性 reset。
- 任意写链路必须可重试；数据库写入和邮件 outbox 必须在同一事务完成。
- 不提交任何真实密钥；外部人工配置及时更新备忘清单。
- 新决策域写入 `adr/`；只追溯旧实现时查看 `docs/decisions.md`。
- 每次 schema 变化都增加 migration、更新生成类型和 `docs/data-model.md`。
- 完成功能后运行与风险相匹配的测试；交付前运行 `pnpm check`。

## 常见任务

- 增加销售字段：migration → 数据库类型 → 模块 schema → DB函数 → 表单 → 展示 → 测试 → 数据模型文档。
- 增加页面：路由装配 → metadata → loading/error/not-found → 业务组件 → 测试。
- 修改业务规则：先更新PRD或决策记录，再修改校验、数据库约束、查询和测试。
