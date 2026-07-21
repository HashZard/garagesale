import { RECOVER_RATE_LIMIT_PER_HOUR } from "@/config/constants";
import { getActiveManagedSalesByEmail } from "@/lib/db/manage";
import { sendRecoveryEmail } from "@/lib/email/sales";
import { getServerEnv } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { recoverLinkSchema } from "@/lib/validation/sale";

const neutralMessage =
  "If active listings match that email, we'll send their private management links.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: neutralMessage });
  }
  const parsed = recoverLinkSchema.safeParse(body);
  if (!parsed.success) return Response.json({ message: neutralMessage });

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit({
      action: "recover-ip",
      key: getRequestIp(request),
      maxRequests: RECOVER_RATE_LIMIT_PER_HOUR,
      windowSeconds: 3600,
    }),
    consumeRateLimit({
      action: "recover-email",
      key: parsed.data.email,
      maxRequests: RECOVER_RATE_LIMIT_PER_HOUR,
      windowSeconds: 3600,
    }),
  ]);

  let previewManageUrls: string[] | undefined;
  if (ipAllowed && emailAllowed) {
    try {
      const sales = await getActiveManagedSalesByEmail(parsed.data.email);
      await sendRecoveryEmail({
        email: parsed.data.email,
        sales: sales.map(({ manageToken, status, title }) => ({
          manageToken,
          status: status as "pending_verification" | "published",
          title,
        })),
      });
      if (getServerEnv().EMAIL_DELIVERY_MODE === "preview") {
        previewManageUrls = sales.map(
          ({ manageToken }) => `/manage/${manageToken}`,
        );
      }
    } catch {
      // 对外保持中性响应；真实发送错误由部署日志和邮件供应商告警追踪。
    }
  }

  return Response.json({ message: neutralMessage, previewManageUrls });
}
