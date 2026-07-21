# 部署与外部服务接入

本文档描述代码完成后的人工接入顺序。任何真实 key 只写入本地 `.env.local` 或部署平台的加密环境变量，不写入仓库、Issue、截图或聊天记录。

## 1. 前置条件

1. 安装并切换到 Node.js 24 LTS、pnpm 10。
2. 安装并启动 Docker Desktop，运行 `pnpm db:start` 和 `pnpm db:reset`。
3. 运行 `pnpm db:lint`，再用 `pnpm db:types` 生成数据库类型。
4. 运行 `pnpm check` 和 `pnpm test:e2e`，确认演示模式基线通过。

## 2. 环境变量

### 浏览器可见

| 变量                            | 说明                               |
| ------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | 当前环境完整站点地址，不带末尾斜杠 |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase项目URL                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 只受RLS和列授权保护的公开key       |
| `NEXT_PUBLIC_MAPBOX_TOKEN`      | 地图与地址建议使用的公开token      |

### 仅服务端

| 变量                        | 说明                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | 绕过RLS的服务端key，绝不能进入客户端                                                              |
| `MAPBOX_SERVER_TOKEN`       | 服务端永久地理编码使用；使用独立的最小权限 `pk` token，但不能带 `NEXT_PUBLIC_` 前缀或暴露给浏览器 |
| `RESEND_API_KEY`            | Resend发送key                                                                                     |
| `RESEND_FROM_EMAIL`         | 已验证域名的完整发件人                                                                            |
| `ADMIN_SECRET`              | 至少32字符的随机后台密钥                                                                          |

### 模式开关

- 本地无外部服务：`APP_DATA_MODE=demo`、`EMAIL_DELIVERY_MODE=preview`。
- 真实联调与生产：`APP_DATA_MODE=supabase`、`EMAIL_DELIVERY_MODE=resend`。

### 共用生产外部服务

数据库和 Mapbox 不按开发、Preview、Production 分别创建资源。三种部署均复用同一套生产 Supabase 项目，以及同一组 Mapbox 浏览器和服务端 token；只有 `NEXT_PUBLIC_SITE_URL` 随实际站点 URL 改变。真实 key 的值在本地 `.env.local`、Vercel Preview 与 Vercel Production 中保持一致。

## 3. Supabase

1. 本项目的开发、Preview 与 Production 共用同一个 Supabase 项目；所有数据库迁移须先在本地验证，再按发布流程应用，避免将开发数据或 seed 写入该共享数据库。
2. 选择尽量靠近 Vercel 执行区域和主要澳大利亚用户的数据库区域。
3. 将仓库 `supabase/migrations` 按顺序应用到远端；seed只用于本地 Supabase 数据库，绝不导入共享的远端生产数据库。
4. 运行数据库 lint，并重新生成远端对应的 TypeScript 类型进行差异检查。
5. 用匿名key验证：只能读取尚未结束的 published 活动和 suburb，不能读取邮箱、管理 token、限流表或执行内部函数。
6. 用发布流程验证 Storage 签名上传；确认对象公开读、匿名直接写失败、大小和MIME限制生效。
7. 配置数据库备份，并单独决定 Storage 备份及孤立图片清理策略。

## 4. Mapbox

1. 创建一枚浏览器公开 token，供所有环境的地图和临时地址建议共用。
2. 创建一枚独立的最小权限公开范围 token，作为所有环境的服务端永久地理编码 token。Geocoding API 不要求 secret scope，因此无需为了生成 `sk` token 勾选无关的 secret scope；即使值以 `pk` 开头，也只能存入服务端变量 `MAPBOX_SERVER_TOKEN`。
3. 浏览器 token 限制为正式域名、`http://localhost:3000` 和实际需要的 Preview 域名；不要把相同限制误加到服务端 token。
4. 向 Mapbox确认当前套餐和数据许可允许保存最终完整地址与经纬度。
5. 设置账单与额度告警，分别观察地址建议、服务端复核和地图加载请求。

## 5. Resend与域名

1. 添加发送域名，完成 SPF、DKIM，建议同时配置DMARC。
2. 创建最小权限 API key，设置 `RESEND_FROM_EMAIL`。
3. 分别测试新活动验证邮件和管理链接恢复邮件。
4. 检查主流邮箱的送达、垃圾邮件分类、移动端链接和过期/取消活动行为。

## 6. Vercel

1. 连接Git仓库，框架保持 Next.js，安装命令使用 `pnpm install --frozen-lockfile`。
2. 为 Preview 和 Production 分别录入环境变量；两处的 Supabase 与 Mapbox 值使用同一套生产服务，只有 `NEXT_PUBLIC_SITE_URL` 使用各自的站点 URL。
3. 首次 Preview 先保持真实服务模式完成联调，不直接把未验证配置提升到生产。
4. 在项目控制台启用 Web Analytics。统计组件只在 Vercel 构建中加载，并已排除后台、验证、恢复和私人管理路径。
5. 绑定正式域名，设置主域和 `www` 规范跳转，确认HTTPS和DNS。

## 7. 上线验收

1. 运行 `pnpm check`、`pnpm test:e2e` 和 `pnpm audit`。
2. 执行一次真实发布→邮件验证→修改→取消→恢复链接→删除闭环。
3. 检查首页、州页、suburb页、活动详情的服务端HTML、canonical、JSON-LD、robots和sitemap。
4. 在桌面和375px移动宽度逐页检查键盘操作、焦点、表单错误、空状态和横向溢出。
5. 检查响应安全头，确认私人页面为 `noindex`、`no-referrer` 和 `private, no-store`。
6. 验证后台错误密钥限流、短期HttpOnly会话、搜索、编辑和移除。

## 8. 回滚原则

- Vercel代码异常：回滚到上一成功部署，不修改或清空生产数据库。
- 新迁移异常：使用新的向前修复迁移，禁止改写已经应用的迁移或执行破坏性重置。
- 邮件或地图异常：先停止真实入口或恢复 Preview模式进行诊断，不在生产客户端暴露服务端key。
- 数据泄露疑虑：立即轮换相关key，禁用受影响功能并检查访问日志，再决定数据通知和恢复步骤。
