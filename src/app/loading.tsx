import { Container } from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="space-y-6 py-10" aria-label="Loading page">
      <Skeleton className="h-12 w-3/4 max-w-xl" />
      <Skeleton className="h-14 w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </Container>
  );
}
