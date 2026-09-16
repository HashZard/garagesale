---
id: ADR-0002
title: 单一共享运行环境
status: accepted
date: 2026-09-16
supersedes: ADR-0001（环境隔离部分）
---

# ADR-0002：单一共享运行环境

## 决策

GarageSale 只维护一套运行环境。数据库、R2 bucket、Mapbox token、Turnstile widget 和 Resend 发件域各只有一份，本地开发与线上部署共用。

- Supabase 只有一个项目，是所有环境唯一的数据权威。不存在本地 Postgres、staging 项目或 preview 数据库。
- R2 只有 `garagesale-opennext-cache`、`garagesale-photos`、`garagesale-backups` 三个 bucket，不配置 preview bucket。
- 迁移通过 `pnpm db:push` 直接应用到这个共享数据库。种子数据流程随本地实例一并取消，`supabase/seed.sql` 已删除。
- `DEPLOYMENT_ENV` 只保留 `local` 与 `production`，表示代码运行在开发机还是已部署的 Worker，不再表示数据边界。`local` 仅用于放宽 Mapbox、Turnstile 和管理员密钥的本地缺省，不切换数据源。
- 只有 `production` 允许被搜索引擎索引；本地运行保持 `noindex`。
- 自动化测试与共享数据库连通，必须自行清理写入的数据，且不得依赖种子数据。

## 背景

ADR-0001 要求 local、staging、production 使用独立数据环境。该要求从未落地：`docs/decisions.md` 记录开发、Preview 与 Production 实际共用同一个 Supabase 项目和同一组 Mapbox token，文档与运行事实长期背离。

这是个人项目、低并发，实际只有一个使用者和一个部署目标。维持三套数据库、三组 bucket 和三份 secret 的成本与心智负担超过它在本项目规模下能提供的保护，也让每次外部配置变更需要重复三遍。与其保留一份无人执行的隔离规范，不如把唯一环境的真实约束写清楚。

## 影响

- 迁移没有预演位。应用 migration 前必须先执行逻辑导出备份，这是硬性门禁，不是建议。
- 破坏性 migration 直接作用于线上数据。schema 变更优先采用只追加、向后兼容的写法；删除列或约束收紧需要单独一次已备份的变更。
- CI 不再启动本地 Supabase，改为使用指向共享数据库的仓库 secret 运行 `db:lint`、类型漂移检查与集成测试。
- 集成测试和端到端测试会在共享数据库产生真实行。用例必须在 `afterAll` 删除自己创建的数据，且只使用明显可识别的测试内容。
- 本地开发会读写线上数据。调试时对 `sales` 的删除、状态变更和管理员操作等同于生产操作。
- 备份与恢复演练是这套架构唯一的数据恢复路径，其优先级高于 ADR-0001 时期的设定。

## 未采用

- 保留 staging：需要第二套数据库、bucket 与 secret，与本项目规模不匹配。
- 用 Supabase 分支或独立 schema 模拟隔离：仍需维护两套迁移应用路径和两组连接配置，复杂度与收益不成正比。
