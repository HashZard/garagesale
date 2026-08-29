"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";

import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const result = (await response.json()) as { message: string };
      setMessage(result.message);
    } catch {
      setMessage(
        "If active listings match that email, we'll send their private management links.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <TurnstileWidget onToken={setTurnstileToken} />
        <Button type="submit" size="lg" disabled={pending || !turnstileToken}>
          {pending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : null}
          Email my management links
        </Button>
      </form>
      {message ? (
        <Alert>
          <MailCheck aria-hidden="true" />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
