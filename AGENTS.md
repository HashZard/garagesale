# GarageSale 开发代理指南

GarageSale 是面向澳大利亚用户的车库售卖活动目录与无账号发布工具。

## 开始前必读

- 产品范围：`docs/prd.md`
- 技术决定：`docs/decisions.md`
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
- `src/lib/db`：唯一数据库访问入口。
- `src/lib/{geo,email,seo,validation}`：对应领域逻辑。
- `src/config`：站点文案、分类和限制。
- `supabase/migrations`：只追加迁移，禁止修改已经应用的历史迁移。

## 强制规则

- 所有项目文档使用中文；面向最终用户的网站文案使用英文。
- 不超出 MVP PRD，不增加地址遮挡、多日活动、账号或浏览统计。
- Server Components 优先；只在需要交互或浏览器 API 时使用 Client Components。
- 不在页面或组件中直接查询 Supabase。
- 客户端和服务端共用 `src/lib/validation` 中的 Zod schema。
- 不提交任何真实密钥；外部人工配置及时更新备忘清单。
- 新依赖、PRD偏离或未规定选择追加到 `docs/decisions.md`。
- 每次 schema 变化都增加 migration、更新生成类型和 `docs/data-model.md`。
- 完成功能后运行与风险相匹配的测试；交付前运行 `pnpm check`。

## 常见任务

- 增加销售字段：migration → 数据库类型 → Zod → DB函数 → 表单 → 展示 → 测试 → 数据模型文档。
- 增加页面：路由装配 → metadata → loading/error/not-found → 业务组件 → 测试。
- 修改业务规则：先更新PRD或决策记录，再修改校验、数据库约束、查询和测试。
