import { MapPin } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import type {
  MapboxFeature,
  PublishFormApi,
} from "@/components/forms/publish-form-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
type PublishLocationSectionProps = {
  form: PublishFormApi;
  onSelectMapboxAddress: (feature: MapboxFeature) => void;
  suggestions: MapboxFeature[];
};

export function PublishLocationSection({
  form,
  onSelectMapboxAddress,
  suggestions,
}: PublishLocationSectionProps) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Where is the sale?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="relative grid gap-2">
          <label htmlFor="address" className="text-sm font-medium">
            Full street address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <MapPin
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="address"
              className="pl-9"
              autoComplete="street-address"
              {...form.register("address")}
            />
          </div>
          <FieldError message={errors.address?.message} />
          {suggestions.length > 0 ? (
            <div className="bg-popover absolute top-full right-0 left-0 z-20 overflow-hidden rounded-xl border shadow-xl">
              {suggestions.map((feature, index) => (
                <button
                  key={`${feature.properties?.full_address ?? "address"}-${index}`}
                  type="button"
                  className="hover:bg-muted block min-h-12 w-full border-b px-4 py-2 text-left text-sm last:border-b-0"
                  onClick={() => onSelectMapboxAddress(feature)}
                >
                  {feature.properties?.full_address ?? feature.properties?.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Alert>
          <MapPin aria-hidden="true" />
          <AlertTitle>Your exact location will be public</AlertTitle>
          <AlertDescription>
            Your full address and exact map pin are shown as soon as the listing
            is published.
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Suburb
            <Input {...form.register("suburb")} readOnly />
            <FieldError message={errors.suburb?.message} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            State
            <Input {...form.register("state")} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Postcode
            <Input
              inputMode="numeric"
              {...form.register("postcode")}
              readOnly
            />
            <FieldError message={errors.postcode?.message} />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
