---
id: ADR-0001
title: 平台与运行架构
status: partially superseded
date: 2026-08-20
superseded_by: ADR-0002（环境隔离部分）
---

# ADR-0001：平台与运行架构

> 环境隔离部分已由 [ADR-0002](0002-single-shared-environment.md) 替代：系统只维护一套共享环境。本文其余选型仍然有效。

## 决策

GarageSale 采用 Next.js App Router + Cloudflare Workers + Supabase Postgres/PostGIS 的动静混合架构。

- Next.js 继续负责公开页面、卖家流程、管理后台和 Route Handlers。
- Cloudflare Workers 通过 OpenNext 运行 Next.js；静态资源由 Cloudflare 边缘分发。
- Supabase Postgres/PostGIS 是活动、位置、状态机和限流数据的唯一权威。
- Cloudflare R2 保存用户图片和独立数据库导出；数据库只保存对象 key 与元数据。
- Resend 发送验证、管理链接恢复和通知邮件；所有待发邮件先写入数据库 outbox。
- Cloudflare Turnstile、数据库原子限流与 honeypot 共同保护公开写入口。
- 公开活动、卖家私密联系方式、访问 token 和邮件投递记录分表保存。访问 token 只保存哈希。

不采用 Astro 纯静态输出、Sanity、Cloudflare D1 或用户账号系统。公开目录依赖频繁变化的活动、PostGIS 距离查询和事务型写入；D1 不替代 PostGIS。卖家继续通过无账号邮件流程管理活动。

## 背景

原实现选择 Next.js + Vercel + Supabase，但开发、Preview 与 Production 共用一个生产 Supabase 项目，运行时还维护独立 demo 数据路径。活动公开字段、卖家邮箱和明文管理 token 保存在同一行；数据库提交与邮件发送不是可靠事务。上述设计会扩大生产数据风险，并使测试通过不代表生产路径可用。

## 影响

- 生产基础费用按 Cloudflare Workers Paid 与 Supabase Pro 预算，不把会暂停且无自动备份的数据库免费计划作为生产 SLA。
- Next.js 本地开发运行在 Node.js，部署运行在 `workerd`；CI 必须执行 OpenNext 预览构建和部署运行时 smoke test。
- 所有内容变更、取消和过期都必须定义缓存失效行为。
- R2、数据库、Resend、Mapbox 与 Cloudflare 账户和凭据必须由项目所有者持有。
