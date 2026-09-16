import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { Container } from "@/components/container";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminSales } from "@/lib/db/admin";
import { formatSaleDateTime } from "@/lib/geo/timezone";

import type { Metadata } from "next";

type AdminPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return (
      <Container className="max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle>GarageSale admin</CardTitle>
            <p className="text-muted-foreground text-sm">
              Sign in with the server-side admin secret.
            </p>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>
      </Container>
    );
  }

  const query = (await searchParams).q?.trim() ?? "";
  const sales = await getAdminSales(query);
  return (
    <Container className="py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary text-sm font-medium">Private dashboard</p>
          <h1 className="mt-1 text-3xl font-bold">Listings admin</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Search by suburb, publisher email or source.
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      <form className="mt-7 flex max-w-xl gap-2" action="/admin">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Fremantle, seller@example.com or gumtree"
          aria-label="Search listings"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="bg-card mt-7 overflow-hidden rounded-xl border">
        <div className="border-b px-4 py-3 text-sm font-medium">
          {sales.length} {sales.length === 1 ? "listing" : "listings"}
        </div>
        {sales.length === 0 ? (
          <p className="text-muted-foreground p-8 text-center text-sm">
            No listings match that search.
          </p>
        ) : (
          <ul className="divide-y">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{sale.title}</p>
                    <Badge variant="outline">{sale.status}</Badge>
                    <Badge variant="secondary">{sale.source}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {sale.suburb}, {sale.state} ·{" "}
                    {formatSaleDateTime(sale.startAt, sale.endAt, sale.state)}
                  </p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {sale.contactEmail ??
                      "External source — no publisher email"}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/sale/${sale.id}`}>View and edit</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
