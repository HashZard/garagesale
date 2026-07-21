"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await fetch("/api/admin/session", { method: "DELETE" });
        router.refresh();
      }}
    >
      <LogOut aria-hidden="true" />
      Sign out
    </Button>
  );
}
