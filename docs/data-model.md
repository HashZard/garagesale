# 数据模型

当前结构由 `supabase/migrations` 中按时间顺序追加的迁移定义。迁移是唯一事实来源，本文件用于快速理解业务结构。

## `sales`

保存用户发布和外部聚合的 garage sale。

### 核心字段

- 标识与内容：`id、title、description、photos、categories`
- 地址：`address、suburb、state、postcode、location`
- 时间：`start_at、end_at`
- 来源：`source、source_url`
- 私密管理：`contact_email、manage_token`
- 生命周期：`status、email_verified_at、created_at、updated_at`

### 数据库约束

- 标题1至80字符，描述最多2000字符。
- 州和来源只能使用PRD固定值，postcode必须为四位数字。
- 结束时间晚于开始时间，并且在活动当地处于同一个日历日。
- 图片最多六张且只能使用HTTPS链接；分类必须来自固定分类列表。
- self 来源必须有邮箱和管理 token，不能有来源URL。
- 外部来源必须有来源URL，不能有邮箱和管理 token。
- 外部来源URL只能使用HTTPS协议。

### 索引

- `location`：GIST，用于半径查询。
- `state/suburb`：suburb SEO 和筛选。
- `start_at`、`status/end_at`：未来和有效活动查询。
- 非空邮箱的lower表达式索引：恢复和后台搜索。

## `suburbs`

保存标准 suburb、州、postcode、slug 和中心点。名称、州、postcode组合唯一，slug唯一；名称、postcode和位置均有搜索索引。

## `rate_limits`

保存哈希后的访问者键、动作、时间窗口和次数。`consume_rate_limit` 通过单次原子 upsert 判断是否允许请求；客户端不能直接访问此表或函数。

## 公开访问

- `sales` 和 `suburbs` 均启用RLS。
- 匿名用户只可读取 published 且尚未结束的活动安全字段。
- `contact_email` 和 `manage_token` 不授予匿名或authenticated角色读取权限。
- `public_sales` 是 `security_invoker` 安全视图，输出经纬度和公开字段。
- `get_upcoming_sales_near` 使用PostGIS执行半径、时间和分类查询，并返回距离。
- 所有写入由服务器端service role完成。

## 本地数据

`supabase/seed.sql` 创建五个Perth suburb和二十条未来演示活动，其中每五条包含一条外部来源记录。
