import { notFound } from "next/navigation";

import { Container } from "@/components/container";
import { ManageForm } from "@/components/forms/manage-form";
import { getManagedSaleByToken } from "@/lib/db/manage";
import { getManageSessionToken } from "@/lib/manage-session";

import type { Metadata } from "next";

type ManagePageProps = {
  searchParams: Promise<{ verified?: string }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Manage your garage sale",
  robots: { index: false, follow: false },
};

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const token = await getManageSessionToken();
  if (!token) notFound();
  const sale = await getManagedSaleByToken(token);
  if (!sale) notFound();
  const { verified } = await searchParams;

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <div className="mb-8">
        <p className="text-primary text-sm font-medium">
          Private management page
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Manage your listing
        </h1>
        <p className="text-muted-foreground mt-3">
          Anyone with the private email link can open this session. Do not share
          it.
        </p>
      </div>
      <ManageForm sale={sale} verified={verified === "1"} />
    </Container>
  );
}
