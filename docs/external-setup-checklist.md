# 外部服务配置清单

> 本清单只记录必须由项目所有者或平台账户完成的工作。系统只有一套环境（[ADR-0002](../adr/0002-single-shared-environment.md)），每项外部资源只创建一份，本地开发与线上部署共用。

## 本地开发机

- [x] Node.js 24、pnpm 10 与 Supabase CLI 可用。
- [ ] `supabase link` 绑定唯一的 Supabase 项目。
- [ ] `.env.local` 填入共享项目的 URL、anon key 与 service-role key；文件不得提交。
- [ ] 知悉本地运行直接读写线上数据：`EMAIL_DELIVERY_MODE=preview` 避免误发邮件，调试不得对真实活动执行删除或状态变更。

## Supabase

- [ ] 创建唯一的 Supabase 项目，区域选 `ap-southeast-2`，使用不会自动暂停且有自动备份的计划。
- [ ] 迁移只通过 `pnpm db:push` 应用，且每次 push 前已完成逻辑导出备份。
- [ ] 保存项目 URL、anon key 和 service-role key 到 Worker secret 与本地 `.env.local`。
- [ ] 启用 PITR 或计划备份，并定期把独立逻辑备份写入专用 R2 backup bucket。
- [ ] 使用匿名 key 验收邮箱、token、outbox 与审核记录均不可读取。

## Cloudflare Workers 与 R2

- [ ] 创建唯一的 Worker，配置自定义域名与 `NEXT_PUBLIC_SITE_URL`。
- [ ] 创建 cache、photo、backup 三个 R2 bucket，各一份，不配置 preview bucket。
- [ ] 配置 Worker secrets；service-role、Resend、Turnstile secret 和后台 secret 不得使用 `NEXT_PUBLIC_` 前缀。
- [ ] 开启 Workers Logs、错误告警、用量告警和可接受的消费上限。
- [ ] 启用 Cloudflare Web Analytics，将 token 写入 `NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`；确认私人路径不加载 beacon。
- [ ] 配置未引用上传清理和图片生命周期规则，并验证 R2 恢复演练。

## Mapbox

- [ ] 创建一组浏览器 token 与服务端 token，浏览器 token 允许域名包含正式域名与 `localhost`。
- [ ] 确认套餐允许永久保存最终地址与坐标，并配置额度告警。
- [ ] 设置 `NEXT_PUBLIC_MAPBOX_TOKEN` 与 `MAPBOX_SERVER_TOKEN`，不得混用。

## Turnstile、Resend 与域名

- [ ] 创建一个 Turnstile widget，允许域名包含正式域名与 `localhost`，配置两枚对应 key。
- [ ] 验证 Resend 发送域名的 SPF、DKIM，建议同时配置 DMARC。
- [ ] 确定正式发件人并验收发布、验证、恢复、重试与失败 outbox 流程。
- [ ] 确认 `garagesale.com.au` 所有权、DNS、HTTPS、`www` 重定向和联系邮箱。

## 数据与合规

- [ ] 选择可合法使用的澳大利亚 suburb/postcode 数据集，保存许可证与署名要求。
- [ ] 聚合任何第三方来源前，书面确认抓取、缓存、链接和图片使用符合条款。
- [ ] 审阅完整地址公开提示、卖家邮箱和图片保留期限、删除与恢复政策。
- [ ] 定稿 Privacy、Terms、About、Contact、Logo 和社交分享图片。

## 上线放行

- [ ] Worker 的 `DEPLOYMENT_ENV=production`，robots、canonical、sitemap 与结构化数据指向正式域名。
- [ ] migration、数据库边界测试、单元测试、生产构建、OpenNext Worker 构建和 E2E 全部通过，且测试数据已从共享数据库清除。
- [ ] 后台使用唯一的 32 字符以上 secret；轮换、保管与应急撤销流程已记录。
- [ ] 备份恢复、邮件退信、R2 清理、速率限制、日志脱敏和告警均完成演练。
- [ ] 桌面和移动端进行一次真实地图、真实邮件、真实域名人工验收。
