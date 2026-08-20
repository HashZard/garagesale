import { MapPin, Trash2 } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import type { ManageFormApi } from "@/components/forms/manage-form-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SaleStatus } from "@/types/sale";

export function ManageLocationSection({ form }: { form: ManageFormApi }) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address and time</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          Full street address
          <span className="relative">
            <MapPin className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input className="pl-9" {...form.register("address")} />
          </span>
          <FieldError message={errors.address?.message} />
        </label>
        <p className="text-muted-foreground text-xs">
          The complete address and exact map position remain public. In live
          mode the server geocodes this address again when you save.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Suburb
            <Input {...form.register("suburb")} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            State
            <Input {...form.register("state")} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Postcode
            <Input {...form.register("postcode")} readOnly />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Date
            <Input type="date" {...form.register("localDate")} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Starts
            <Input type="time" {...form.register("startTime")} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Ends
            <Input type="time" {...form.register("endTime")} />
            <FieldError message={errors.endTime?.message} />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

export function ManageControls({
  actionPending,
  onAction,
  status,
}: {
  actionPending: boolean;
  onAction: (action: "cancel" | "remove") => void;
  status: SaleStatus;
}) {
  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle>Listing controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        {status !== "cancelled" ? (
          <Button
            variant="outline"
            disabled={actionPending}
            onClick={() => onAction("cancel")}
          >
            Cancel listing
          </Button>
        ) : null}
        <Button
          variant="destructive"
          disabled={actionPending}
          onClick={() => onAction("remove")}
        >
          <Trash2 aria-hidden="true" />
          Remove permanently
        </Button>
      </CardContent>
    </Card>
  );
}
