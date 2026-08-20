import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";

import type { Database } from "@/types/database.generated";

const databaseConfigured = Boolean(
  process.env.SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

describe.skipIf(!databaseConfigured)("database security boundaries", () => {
  const url = process.env.SUPABASE_URL!;
  const anonymous = createClient<Database>(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: "garage-sale-anonymous-integration",
      },
    },
  );
  const service = createClient<Database>(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: "garage-sale-service-integration",
      },
    },
  );
  const createdSaleIds: string[] = [];

  afterAll(async () => {
    if (createdSaleIds.length > 0) {
      await service.from("sales").delete().in("id", createdSaleIds);
    }
  });

  it("does not expose private tables to anonymous clients", async () => {
    const privateResult = await anonymous
      .from("sale_private_details")
      .select("sale_id")
      .limit(1);
    const tokenResult = await anonymous
      .from("sale_access_tokens")
      .select("sale_id")
      .limit(1);

    expect(privateResult.error?.code).toBe("42501");
    expect(tokenResult.error?.code).toBe("42501");
  });

  it("stores only token hashes and publishes through the verification RPC", async () => {
    const startAt = new Date(Date.now() + 24 * 60 * 60_000);
    startAt.setUTCHours(0, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 5 * 60 * 60_000);
    const { data, error } = await service.rpc("create_self_sale", {
      p_address: "10 Market Street, Fremantle WA 6160",
      p_categories: ["furniture"],
      p_contact_email: "database-boundary@example.test",
      p_description: "Integration boundary test",
      p_end_at: endAt.toISOString(),
      p_latitude: -32.0569,
      p_longitude: 115.7478,
      p_photos: ["/media/integration/database-boundary.webp"],
      p_postcode: "6160",
      p_start_at: startAt.toISOString(),
      p_state: "WA",
      p_suburb: "Fremantle",
      p_title: `Database boundary ${Date.now()}`,
    });

    expect(error).toBeNull();
    const created = data?.[0];
    expect(created).toBeDefined();
    if (!created) return;
    createdSaleIds.push(created.sale_id);

    const { data: tokens, error: tokenError } = await service
      .from("sale_access_tokens")
      .select("token_hash,purpose")
      .eq("sale_id", created.sale_id);
    expect(tokenError).toBeNull();
    expect(tokens).toHaveLength(2);
    expect(tokens?.map(({ token_hash }) => token_hash)).not.toContain(
      created.manage_token,
    );
    expect(tokens?.map(({ token_hash }) => token_hash)).not.toContain(
      created.verification_token,
    );
    expect(
      tokens?.every(({ token_hash }) => /^[a-f0-9]{64}$/.test(token_hash)),
    ).toBe(true);

    const mediaResult = await service
      .from("sale_media")
      .select("storage_key,sort_order")
      .eq("sale_id", created.sale_id)
      .single();
    expect(mediaResult.data).toEqual({
      sort_order: 0,
      storage_key: "integration/database-boundary.webp",
    });

    const verification = await service.rpc("verify_sale_token", {
      raw_token: created.verification_token,
    });
    expect(verification.error).toBeNull();
    expect(verification.data).toBe(created.sale_id);

    const publicResult = await anonymous
      .from("public_sales")
      .select("id")
      .eq("id", created.sale_id)
      .single();
    expect(publicResult.error).toBeNull();
    expect(publicResult.data?.id).toBe(created.sale_id);

    const statusResult = await service
      .from("sales")
      .select("status")
      .eq("id", created.sale_id)
      .single();
    expect(statusResult.data?.status).toBe("published");
  });
});
