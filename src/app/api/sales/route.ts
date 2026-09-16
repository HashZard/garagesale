import { PUBLISH_RATE_LIMIT_PER_HOUR } from "@/config/constants";
import { publishSale, recordOutboxDelivery } from "@/lib/db/mutations";
import { sendVerificationEmail } from "@/lib/email/sales";
import {
  AddressVerificationError,
  verifyAustralianAddress,
} from "@/lib/geo/mapbox";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request";
import { publishSaleSchema } from "@/lib/validation/sale";
import { verifyTurnstile } from "@/platform/security/turnstile";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = publishSaleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form fields", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestIp = getRequestIp(request);
  const turnstileToken =
    body && typeof body === "object" && "turnstileToken" in body
      ? String(body.turnstileToken)
      : undefined;
  if (!(await verifyTurnstile(turnstileToken, requestIp))) {
    return Response.json(
      { error: "Please complete the bot protection challenge" },
      { status: 400 },
    );
  }

  const allowed = await consumeRateLimit({
    action: "publish",
    key: requestIp,
    maxRequests: PUBLISH_RATE_LIMIT_PER_HOUR,
    windowSeconds: 3600,
  });
  if (!allowed) {
    return Response.json(
      {
        error: "Too many listings have been submitted. Please try again later.",
      },
      { status: 429 },
    );
  }

  try {
    const verifiedInput = await verifyAustralianAddress(parsed.data);
    const result = await publishSale(verifiedInput);
    let emailQueued = false;
    try {
      await sendVerificationEmail({
        email: verifiedInput.contactEmail,
        manageToken: result.manageToken,
        title: verifiedInput.title,
        verificationToken: result.verificationToken,
      });
      await recordOutboxDelivery(result.outboxId, {});
    } catch (emailError) {
      emailQueued = true;
      await recordOutboxDelivery(result.outboxId, {
        error:
          emailError instanceof Error
            ? emailError.message
            : "Email send failed",
      });
    }
    return Response.json({
      ok: true,
      emailQueued,
    });
  } catch (error) {
    if (error instanceof AddressVerificationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json(
      { error: "We couldn't publish your sale. Please try again." },
      { status: 500 },
    );
  }
}
