import { notFound, redirect } from "next/navigation";

import { verifySale } from "@/lib/db/mutations";

type VerifyPageProps = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: "Confirming your listing",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { token } = await params;
  const verified = await verifySale(token);
  if (!verified) notFound();
  redirect(`/manage/${token}?verified=1`);
}
