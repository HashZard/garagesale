# 外部服务配置清单

> 本清单只记录必须由项目所有者或平台账户完成的工作。任何环境都不得复用 production 数据库、R2 bucket 或 secret。

## Local

- [x] Node.js 24、pnpm 10、Docker Desktop 与 Supabase CLI 可用。
- [x] 本地迁移、seed、PostGIS 查询、RLS、生成类型和浏览器闭环可运行。
- [ ] 如需真实地图或邮件，在 `.env.local` 填入只用于本地的 Mapbox 与 Resend 凭据；文件不得提交。

## Supabase

- [ ] 分别创建 staging 与 production 项目，区域尽量靠近 Cloudflare 主要访问区域。
- [ ] 各环境单独执行迁移；禁止向 staging/production 导入 `supabase/seed.sql`。
- [ ] 保存项目 URL、anon key 和 service-role key 到对应 Cloudflare 环境。
- [ ] 启用 PITR 或计划备份，并定期把独立逻辑备份写入专用 R2 backup bucket。
- [ ] 使用匿名 key 验收邮箱、token、outbox 与审核记录均不可读取。

## Cloudflare Workers 与 R2

- [ ] 创建 staging/production Worker，并分别配置自定义域名与 `NEXT_PUBLIC_SITE_URL`。
- [ ] 为每个环境创建独立的 cache、photo、backup R2 bucket，更新 `wrangler.jsonc` binding。
- [ ] 配置 Worker secrets；service-role、Resend、Turnstile secret 和后台 secret 不得使用 `NEXT_PUBLIC_` 前缀。
- [ ] 开启 Workers Logs、错误告警、用量告警和可接受的消费上限。
- [ ] 启用 Cloudflare Web Analytics，将 token 写入 `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`；确认私人路径不加载 beacon。
- [ ] 配置未引用上传清理和图片生命周期规则，并验证 R2 恢复演练。

## Mapbox

- [ ] 每个环境创建浏览器 token 与服务端 token，限制浏览器 token 的允许域名。
- [ ] 确认套餐允许永久保存最终地址与坐标，并配置额度告警。
- [ ] 设置 `NEXT_PUBLIC_MAPBOX_TOKEN` 与 `MAPBOX_SERVER_TOKEN`，不得混用。

## Turnstile、Resend 与域名

- [ ] 每个环境创建独立 Turnstile widget，配置允许域名与两枚对应 key。
- [ ] 验证 Resend 发送域名的 SPF、DKIM，建议同时配置 DMARC。
- [ ] 确定正式发件人并验收发布、验证、恢复、重试与失败 outbox 流程。
- [ ] 确认 `garagesale.com.au` 所有权、DNS、HTTPS、`www` 重定向和联系邮箱。

## 数据与合规

- [ ] 选择可合法使用的澳大利亚 suburb/postcode 数据集，保存许可证与署名要求。
- [ ] 聚合任何第三方来源前，书面确认抓取、缓存、链接和图片使用符合条款。
- [ ] 审阅完整地址公开提示、卖家邮箱和图片保留期限、删除与恢复政策。
- [ ] 定稿 Privacy、Terms、About、Contact、Logo 和社交分享图片。

## Production 放行

- [ ] `DEPLOYMENT_ENV=production`，robots、canonical、sitemap 与结构化数据指向正式域名。
- [ ] migration、数据库边界测试、单元测试、生产构建、OpenNext Worker 构建和 E2E 全部通过。
- [ ] 后台使用唯一的 32 字符以上 secret；轮换、保管与应急撤销流程已记录。
- [ ] 备份恢复、邮件退信、R2 清理、速率限制、日志脱敏和告警均完成演练。
- [ ] 桌面和移动端进行一次真实地图、真实邮件、真实域名人工验收。
