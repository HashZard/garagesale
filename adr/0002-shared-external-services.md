---
id: ADR-0002
title: 共享外部服务配置
status: accepted
date: 2026-08-23
---

# ADR-0002：共享外部服务配置

## 决策

开发、预览和部署实例共用同一套 Supabase 项目、Cloudflare R2 bucket、Mapbox token、Turnstile widget、Resend 配置及站点 URL。应用不再使用 `DEPLOYMENT_ENV`、本地默认管理员口令、Mapbox/Turnstile 绕过或邮件预览模式。

所有运行实例均必须提供完整的真实服务配置；邮件验证、地址验证、反机器人校验和管理认证在开发与部署时执行同一条路径。

## 影响

- 开发写入会进入共享数据集，操作前必须确认目标；不得导入 `supabase/seed.sql`、执行 `db reset --linked` 或使用测试邮箱批量造数。
- 数据库 migration 必须先以 `db push --dry-run` 审查，再对共享项目执行 `db push`；发布前维持备份与恢复流程。
- R2 的 preview binding 与独立 preview bucket 被移除，所有 Worker 构建使用同一组 bucket binding。
- 自动化端到端测试不再绕过 Turnstile 或公开验证链接；涉及写入的完整闭环在受控人工验收中执行。
