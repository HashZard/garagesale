import { RECOVER_RATE_LIMIT_PER_HOUR } from "@/config/constants";
import { issueRecoveryTokens } from "@/lib/db/manage";
import { recordOutboxDelivery } from "@/lib/db/mutations";
import { sendRecoveryEmail } from "@/lib/email/sales";
import { getServerEnv } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { recoverLinkSchema } from "@/lib/validation/sale";
import { verifyTurnstile } from "@/platform/security/turnstile";

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
  const requestIp = getRequestIp(request);
  const turnstileToken =
    body && typeof body === "object" && "turnstileToken" in body
      ? String(body.turnstileToken)
      : undefined;
  if (!(await verifyTurnstile(turnstileToken, requestIp))) {
    return Response.json({ message: neutralMessage });
  }

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit({
      action: "recover-ip",
      key: requestIp,
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
    let issuedSales: Awaited<ReturnType<typeof issueRecoveryTokens>> = [];
    try {
      issuedSales = await issueRecoveryTokens(parsed.data.email);
      await sendRecoveryEmail({
        email: parsed.data.email,
        sales: issuedSales.map(
          ({ manageToken, status, title, verificationToken }) => ({
            manageToken,
            status,
            title,
            verificationToken,
          }),
        ),
      });
      await Promise.all(
        issuedSales.map(({ outboxId }) => recordOutboxDelivery(outboxId, {})),
      );
      if (getServerEnv().EMAIL_DELIVERY_MODE === "preview") {
        previewManageUrls = issuedSales.map(
          ({ manageToken }) => `/manage/${manageToken}`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Recovery email send failed";
      await Promise.allSettled(
        issuedSales.map(({ outboxId }) =>
          recordOutboxDelivery(outboxId, { error: message }),
        ),
      );
      // 对外保持中性响应；失败任务留在 outbox，交给重试 worker 处理。
    }
  }

  return Response.json({ message: neutralMessage, previewManageUrls });
}
