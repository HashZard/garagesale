import { CircleAlert, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageStateProps = {
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  description: string;
  kind?: "empty" | "error";
  title: string;
};

export function PageState({
  actionHref,
  actionLabel,
  className,
  description,
  kind = "empty",
  title,
}: PageStateProps) {
  const Icon = kind === "error" ? CircleAlert : SearchX;

  return (
    <div
      className={cn(
        "bg-card flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center",
        className,
      )}
    >
      <span className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-5" size="lg">
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
