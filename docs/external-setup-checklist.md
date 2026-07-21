# 外部服务配置备忘清单

> 本清单持续更新。代码开发期间不要求立即完成；标记为“上线前”的项目只阻塞真实联调或生产发布，不阻塞本地编码。

## 状态说明

- `待处理`：需要项目所有者后续人工操作。
- `代码待接入`：外部资源准备好后仍需在代码或环境中接入。
- `已完成`：已经验证可用。

## 本地开发环境

- [ ] 待处理｜下次本地开发前：当前终端是 Node.js 23.5.0，请通过 nvm 或其他版本管理器安装并切换到项目固定的 Node.js 24 LTS。
- [ ] 待处理｜数据库联调前：安装并启动 Docker Desktop（或兼容Docker运行时）；当前 `docker info` 不可用，Supabase本地容器尚未启动。
- [ ] 待处理｜Docker可用后：依次执行 `pnpm db:start`、`pnpm db:reset`、`pnpm db:lint` 和 `pnpm db:types`，确认迁移、RLS、PostGIS查询和生成类型。
- [x] 已完成：已安装项目对应的 Playwright Chromium；最终端到端测试为11项通过、3项按设备去重规则跳过，覆盖桌面端、移动端和无账号发布管理闭环。
- [x] 已完成：`pnpm check` 已通过格式、Lint、类型、19项单元测试和生产构建；`pnpm audit --audit-level=high` 未发现已知漏洞。
- [x] 已完成：本地生产构建的移动端 Lighthouse 验收通过；首页为97/100/100/100，Fremantle suburb页为95/100/100/100（性能/可访问性/最佳实践/SEO）。
- [ ] 待处理｜上线验收前：当前环境未提供可控制的应用内浏览器，仍需按真实品牌素材逐页完成桌面端与移动端人工视觉检查。
- [x] 已完成：pnpm 10 已可用，项目通过 `packageManager` 固定具体版本。

## Supabase

- [x] 已完成：已创建 Supabase 项目；开发、Preview 与 Production 共用同一个数据库。
- [x] 已完成：已提供项目 URL、publishable key 和仅服务端使用的 secret key。
- [x] 已完成：已在远端项目应用仓库内 migrations；不向该共享的生产数据库导入开发 seed。
- [ ] 待处理｜上线前：确认数据库备份方案。
- [ ] 待处理｜上线前：确认 Storage 图片是否需要额外备份；数据库备份不等同于图片备份。
- [ ] 待处理｜上线前：建立定期清理规则，删除超过24小时仍未被任何活动引用的上传图片，避免用户中途退出留下孤立文件。
- [ ] 代码待接入：将同一套生产 Supabase 值写入本地 `.env.local`、Vercel Preview 与 Production 环境变量，禁止提交。

## Mapbox

- [ ] 待处理｜联调前：创建一套生产 Mapbox 账号、一枚浏览器公开 token 和一枚独立的服务端专用 `pk` token，供本地、Preview 和 Production 共用；Geocoding 无需 secret scope，不创建带无关高权限的 `sk` token。
- [ ] 待处理｜上线前：限制这枚共用浏览器 token 的允许域名为正式域名、`http://localhost:3000` 和必要的 Vercel Preview 域名。
- [ ] 待处理｜上线前：确认套餐允许永久保存最终地理编码地址和坐标。
- [ ] 待处理｜上线前：确认账单和请求额度提醒。
- [ ] 代码待接入：在本地 `.env.local`、Vercel Preview 与 Production 中设置同一组 `NEXT_PUBLIC_MAPBOX_TOKEN` 和 `MAPBOX_SERVER_TOKEN`；两者禁止混用。
- [x] 已完成：发布接口在真实数据模式下会由服务端执行永久地理编码，并覆盖客户端提交的地址结构和坐标。

## Resend 与邮件域名

- [ ] 待处理｜联调前：创建 Resend 账号和 API key。
- [ ] 待处理｜上线前：在 Resend 添加发送域名。
- [ ] 待处理｜上线前：配置并验证 SPF、DKIM；建议同时配置 DMARC。
- [ ] 待处理｜上线前：确定发件人，例如 `GarageSale <hello@garagesale.com.au>`。
- [ ] 待处理｜上线前：验证真实邮箱的发送、垃圾邮件和链接跳转。
- [ ] 代码待接入：设置 `RESEND_API_KEY` 和正式发件人配置。

## Vercel

- [ ] 待处理｜联调前：创建 Vercel 项目并连接 Git 仓库。
- [ ] 待处理｜上线前：分别配置 Preview 和 Production 环境变量；Supabase 与 Mapbox 使用同一套生产值，`NEXT_PUBLIC_SITE_URL` 使用各自部署地址。
- [ ] 待处理｜上线前：绑定 `garagesale.com.au` 及需要的 `www` 重定向。
- [ ] 待处理｜上线前：启用并确认 Vercel Analytics。
- [x] 已完成：代码已接入 Vercel Analytics，只在 Vercel 构建中加载，并排除后台、验证、恢复和私人管理路径。
- [ ] 待处理｜上线前：确认部署区域与 Supabase 区域尽量接近。

## 域名与品牌

- [ ] 待处理｜上线前：确认 `garagesale.com.au` 的所有权和 DNS 管理权限。
- [ ] 待处理｜上线前：确定正式Logo、品牌主色和社交分享默认图。
- [ ] 待处理｜上线前：确认站点联系邮箱。
- [ ] 待处理｜上线前：准备 Privacy、Terms、About 和 Contact 最终文案。

## 数据来源与合规

- [ ] 待处理｜导入前：选择允许使用的澳大利亚 postcode/suburb 数据集并记录许可证和署名。
- [ ] 待处理｜聚合上线前：确认 Gumtree、Facebook 等来源的数据使用、链接和展示方式符合适用条款。
- [ ] 待处理｜上线前：审阅完整地址、邮箱和图片的隐私告知及保留策略。

## 上线前最终检查

- [ ] Production 数据库迁移成功。
- [ ] 匿名 key 无法读取邮箱和管理 token。
- [ ] Mapbox 正式 token、永久地理编码许可和域名限制已确认。
- [ ] Resend 正式域名验证通过，验证邮件和恢复邮件真实送达。
- [ ] 正式域名、HTTPS、canonical、robots 和 sitemap 正确。
- [ ] 后台密钥已设置且未出现在客户端或仓库中。
- [ ] 完整端到端验收清单通过。
