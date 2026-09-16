# 部署与外部服务接入

本文只记录**反复执行的流程**：本地验证、发布、回滚和每次发布的验收。

一次性的账户与外部服务配置见 [`external-setup-checklist.md`](external-setup-checklist.md)；
设计与运维基线见 [架构基线](architecture/garage-sale-architecture.md)。本文不保存任何凭据值。

## 1. 环境

本地开发与正式 Worker 共用同一套外部服务，不存在 staging 或 preview 实例，也不得用环境变量
切换 demo、邮件预览或反机器人绕过（[ADR-0002](../adr/0002-single-shared-environment.md)）。

**每次写入共享数据库前必须先完成逻辑导出备份**，规则见[架构基线 §10](architecture/garage-sale-architecture.md#10-备份与恢复)。

## 2. 本地验证

```bash
cp .env.example .env.local   # 填入共享 Supabase 项目的 URL 与 key
pnpm install --frozen-lockfile
pnpm exec supabase link --project-ref <project-ref>
pnpm db:lint
pnpm db:types
pnpm check
```

`db:lint` 与 `db:types` 是只读操作。写入共享数据库只有 `pnpm db:push` 一条路径，见第 3 节。

Windows 本机的 OpenNext bundle 可能因 symlink 权限失败，而 `pnpm preview` 内部同样先执行
`opennextjs-cloudflare build`，因此在 Windows 上不是绕过方案。需要本地验证 Worker 时在 WSL2 或
Linux 中执行 `pnpm preview`，否则以 CI 的 `pnpm build:worker` 结果为准。

## 3. 发布与回滚

发布顺序：**逻辑导出备份 → `supabase db push --dry-run` 审查 → `pnpm db:push` → Worker → smoke/E2E → 线上闭环抽查**。

- 正常生产发布由 CI 完成；手动执行 `pnpm deploy` 前必须取得明确部署授权。
- 不得对共享项目执行 `supabase/seed.sql`、`db reset --linked` 或任何会清空数据的命令。
- 代码异常回滚到上一成功 Worker 版本。
- 数据库**不通过删除列或重写历史 migration 回滚**，使用预先准备的向前修复 migration。
- 涉及数据变换时，发布前必须记录恢复 SQL 和备份对象 key。

## 4. 每次发布的验收

- 搜索、州、suburb、活动详情和 sitemap 返回正确公开数据。
- 发布写入私密表、两类哈希 token 和 outbox；数据库中不存在可直接使用的 token。
- 匿名角色的可读范围未扩大，边界见 [`data-model.md`](data-model.md)。
- Turnstile、honeypot 和限流生效。
- 验证、管理、恢复和管理员页面为 `noindex`、`no-store`，URL 不进入分析事件。
- R2 上传拒绝伪造 MIME，公开图片带长期缓存和 `nosniff`。
- 取消、删除和过期活动从公开查询与 sitemap 消失。
