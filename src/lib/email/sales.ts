import "server-only";

import { Resend } from "resend";

import { getServerEnv } from "@/lib/env";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

type VerificationEmailInput = {
  email: string;
  manageToken: string;
  title: string;
  verificationToken: string;
};

type RecoverySale = {
  manageToken: string;
  status: "pending_verification" | "published";
  title: string;
  verificationToken: string | null;
};

export async function sendVerificationEmail(
  input: VerificationEmailInput,
): Promise<void> {
  const environment = getServerEnv();

  const resend = new Resend(environment.RESEND_API_KEY);
  const verifyUrl = `${environment.NEXT_PUBLIC_SITE_URL}/verify/${input.verificationToken}?manage=${encodeURIComponent(input.manageToken)}`;
  const manageUrl = `${environment.NEXT_PUBLIC_SITE_URL}/manage/${input.manageToken}`;
  const { error } = await resend.emails.send({
    from: environment.RESEND_FROM_EMAIL,
    to: input.email,
    subject: "Confirm your garage sale listing",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px;margin:auto">
        <h1 style="font-size:24px">Confirm your garage sale</h1>
        <p>You're almost done publishing <strong>${escapeHtml(input.title)}</strong>.</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#167c73;color:#fff;text-decoration:none;border-radius:8px">Confirm listing</a></p>
        <p>Keep this email. Your private management link is:</p>
        <p><a href="${manageUrl}">${manageUrl}</a></p>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}

export async function sendRecoveryEmail(input: {
  email: string;
  sales: RecoverySale[];
}): Promise<void> {
  const environment = getServerEnv();
  if (input.sales.length === 0) return;

  const listingLinks = input.sales
    .map((sale) => {
      const manageUrl = `${environment.NEXT_PUBLIC_SITE_URL}/manage/${sale.manageToken}`;
      const verifyUrl = sale.verificationToken
        ? `${environment.NEXT_PUBLIC_SITE_URL}/verify/${sale.verificationToken}?manage=${encodeURIComponent(sale.manageToken)}`
        : null;
      const verification =
        sale.status === "pending_verification"
          ? `<br><a href="${verifyUrl}">Confirm this listing first</a>`
          : "";
      return `<li style="margin-bottom:16px"><strong>${escapeHtml(sale.title)}</strong><br><a href="${manageUrl}">Manage listing</a>${verification}</li>`;
    })
    .join("");

  const resend = new Resend(environment.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: environment.RESEND_FROM_EMAIL,
    to: input.email,
    subject: "Your GarageSale management links",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px;margin:auto">
        <h1 style="font-size:24px">Your garage sale listings</h1>
        <p>Use these private links to manage your active listings. Do not share them.</p>
        <ul>${listingLinks}</ul>
      </div>
    `,
  });
  if (error) throw new Error(error.message);
}
