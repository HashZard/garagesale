# 数据模型

`supabase/migrations` 是数据库结构唯一事实来源；本文件说明边界和变更链路。

## `sales`

保存公开活动内容、位置、时间、来源和生命周期。完整地址按产品决定公开；卖家邮箱和访问 token 不在本表。

公开条件统一为 `status = 'published' AND end_at > now()`。`public_sales` 是匿名读取入口，只输出公开字段和经纬度。

## `sale_media`

保存图片 URL、R2 object key、排序、类型、尺寸和发布状态。`sales.photos` 暂时作为公开查询的兼容投影；触发器保证现有写入口与规范化记录同步，后续可在不改变 API 契约的情况下切换读取端。

## `sale_private_details`

保存自发布活动的 `contact_email` 与 `retain_until`。匿名和 authenticated 角色无访问权。活动删除时通过外键级联删除。

## `sale_access_tokens`

保存 `verification` 与 `manage` 两类 token 的 SHA-256 哈希、到期、使用和撤销时间。数据库不得保存原始 token；恢复流程生成新管理 token 并撤销旧 token。

## `email_outbox`

保存验证和恢复邮件任务、重试次数、下次投递时间和投递状态。活动创建与 outbox 写入由 `create_self_sale` 在同一事务完成。投递成功后清除不再需要的敏感 payload。

## `moderation_events`

记录管理员动作、活动、时间和非敏感元数据。不得写入管理 token、Turnstile token 或完整请求体。

## `suburbs`

保存规范化 suburb、州、postcode、slug 和 PostGIS 点位。`get_nearby_suburbs` 在 PostGIS 内排序；`get_indexable_suburbs` 只返回有活跃或最近 90 天活动的 suburb。

`suburb_directory` 是 `suburbs` 的公开只读 view，把 PostGIS 点位展开为经纬度，授予 anon 与 authenticated select，不输出额外字段。

## `rate_limits`

保存哈希后的访问者键、动作和原子时间窗口计数。客户端不能直接访问表或 `consume_rate_limit`。

## 数据库函数

- `create_self_sale`：原子创建活动、私密信息、两类 token 和验证邮件 outbox。
- `verify_sale_token`：校验哈希、用途、期限和状态后发布活动。
- `resolve_manage_sale_id`：把原始管理 token 解析为可管理活动 id。
- `issue_sale_recovery_tokens`：按邮箱轮换管理 token，并写入恢复邮件 outbox。
- `get_upcoming_sales_near`：PostGIS 半径查询和距离排序。
- `get_nearby_suburbs`：PostGIS suburb 距离排序。
- `get_indexable_suburbs`：目录和 sitemap 的内容质量集合查询。
- `consume_rate_limit`：原子计数并返回请求是否允许。

## 变更链路

系统只有一套共享数据库，没有本地实例，也不允许 reset（[ADR-0002](../adr/0002-single-shared-environment.md)）。Schema 变化必须按以下顺序完成：

新增 migration → **逻辑导出备份** → `pnpm db:push` → `pnpm db:types` → 模块 schema/mapper → 查询或命令 → UI/API → RLS/契约/E2E 测试 → 更新本文与架构基线。

备份是硬性门禁，未备份不得执行 `pnpm db:push`。migration 只追加、向后兼容；删除列或收紧约束单独成一次已备份的变更。
