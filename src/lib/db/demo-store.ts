import "server-only";

import { createHash } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { AdminSale } from "@/types/admin";
import type { ManagedSale } from "@/types/manage";

const workspaceHash = createHash("sha256")
  .update(process.cwd())
  .digest("hex")
  .slice(0, 12);
const demoStorePath = join(tmpdir(), `garagesale-demo-${workspaceHash}.jsonl`);
const adminStorePath = join(
  tmpdir(),
  `garagesale-admin-demo-${workspaceHash}.jsonl`,
);

function getAdminOverrides(): Map<string, AdminSale> {
  const store = new Map<string, AdminSale>();
  try {
    for (const line of readFileSync(adminStorePath, "utf8").split("\n")) {
      if (!line) continue;
      const sale = JSON.parse(line) as AdminSale;
      if (sale.id) store.set(sale.id, sale);
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  return store;
}

export function getDemoAdminOverride(id: string): AdminSale | null {
  return getAdminOverrides().get(id) ?? null;
}

export function saveDemoAdminOverride(sale: AdminSale): void {
  appendFileSync(adminStorePath, `${JSON.stringify(sale)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

function getStore(): Map<string, ManagedSale> {
  const store = new Map<string, ManagedSale>();
  try {
    for (const line of readFileSync(demoStorePath, "utf8").split("\n")) {
      if (!line) continue;
      const sale = JSON.parse(line) as ManagedSale;
      if (sale.id && sale.manageToken) store.set(sale.id, sale);
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  return store;
}

export function saveDemoSale(sale: ManagedSale): void {
  // 追加日志让Next开发服务器的多个worker共享演示状态；生产不得使用demo模式。
  appendFileSync(demoStorePath, `${JSON.stringify(sale)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
}

export function getDemoSaleById(id: string): ManagedSale | null {
  return getStore().get(id) ?? null;
}

export function getDemoSaleByToken(token: string): ManagedSale | null {
  return (
    [...getStore().values()].find((sale) => sale.manageToken === token) ?? null
  );
}

export function getAllStoredDemoSales(): ManagedSale[] {
  return [...getStore().values()];
}

export function getPublishedDemoSales(): ManagedSale[] {
  const now = new Date();
  return [...getStore().values()].filter(
    (sale) => sale.status === "published" && new Date(sale.endAt) > now,
  );
}

export function getActiveDemoSalesByEmail(email: string): ManagedSale[] {
  const now = new Date();
  return [...getStore().values()].filter(
    (sale) =>
      sale.contactEmail.toLowerCase() === email.toLowerCase() &&
      (sale.status === "pending_verification" || sale.status === "published") &&
      new Date(sale.endAt) > now,
  );
}

export function removeDemoSale(id: string): void {
  const sale = getDemoSaleById(id);
  if (sale) saveDemoSale({ ...sale, status: "removed" });
}
