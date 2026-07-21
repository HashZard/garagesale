import { FieldError } from "@/components/forms/field-error";
import {
  tomorrowDate,
  type PublishFormApi,
} from "@/components/forms/publish-form-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PublishTimeSection({ form }: { form: PublishFormApi }) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. When is it?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Date
          <Input
            type="date"
            min={tomorrowDate()}
            {...form.register("localDate")}
          />
          <FieldError message={errors.localDate?.message} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Starts
          <Input type="time" {...form.register("startTime")} />
          <FieldError message={errors.startTime?.message} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Ends
          <Input type="time" {...form.register("endTime")} />
          <FieldError message={errors.endTime?.message} />
        </label>
        <p className="text-muted-foreground text-xs sm:col-span-3">
          MVP listings cover one day only. Create a separate listing for each
          day.
        </p>
      </CardContent>
    </Card>
  );
}

export function PublishContactSection({ form }: { form: PublishFormApi }) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Where should we send your private link?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("contactEmail")}
          />
          <FieldError message={errors.contactEmail?.message} />
        </label>
        <p className="text-muted-foreground text-xs">
          We&apos;ll email a private link to edit or cancel your listing. Your
          email is never public.
        </p>
        <label className="sr-only" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </label>
      </CardContent>
    </Card>
  );
}
