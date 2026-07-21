import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { Container } from "@/components/container";
import { AdminSaleForm } from "@/components/forms/admin-sale-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminSaleById } from "@/lib/db/admin";

import type { Metadata } from "next";

type AdminSalePageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Edit listing — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSalePage({ params }: AdminSalePageProps) {
  if (!(await isAdminAuthenticated())) redirect("/admin");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const sale = await getAdminSaleById(id);
  if (!sale) notFound();
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Button variant="ghost" asChild className="mb-5">
        <Link href="/admin">
          <ArrowLeft aria-hidden="true" /> Back to listings
        </Link>
      </Button>
      <div className="mb-7">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{sale.status}</Badge>
          <Badge variant="secondary">{sale.source}</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold">Edit listing</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {sale.contactEmail ?? "External source — no publisher email"}
        </p>
      </div>
      <AdminSaleForm sale={sale} />
    </Container>
  );
}
