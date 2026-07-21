import { PageState } from "@/components/page-state";
import { SaleCard } from "@/components/sale/sale-card";
import type { NearbySale } from "@/types/sale";

type SaleListProps = {
  locationLabel?: string;
  sales: NearbySale[];
};

export function SaleList({ locationLabel, sales }: SaleListProps) {
  if (sales.length === 0) {
    return (
      <PageState
        title={`No garage sales found${locationLabel ? ` near ${locationLabel}` : ""}`}
        description="Try a wider radius or a different weekend. Having a sale? Publish it free."
        actionHref="/publish"
        actionLabel="Publish your sale"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      {sales.map((sale) => (
        <SaleCard key={sale.id} sale={sale} />
      ))}
    </div>
  );
}
