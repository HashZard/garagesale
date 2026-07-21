"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SALE_CATEGORIES } from "@/config/constants";
import { getLocalDate, getLocalTime } from "@/lib/geo/timezone";
import {
  manageSaleSchema,
  type ManageSaleFormInput,
  type ManageSaleInput,
} from "@/lib/validation/sale";
import type { AdminSale } from "@/types/admin";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  ) : null;
}

export function AdminSaleForm({ sale }: { sale: AdminSale }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const form = useForm<ManageSaleFormInput, unknown, ManageSaleInput>({
    resolver: zodResolver(manageSaleSchema),
    defaultValues: {
      address: sale.address,
      categories: sale.categories,
      description: sale.description ?? "",
      endTime: getLocalTime(sale.endAt, sale.state),
      latitude: sale.latitude,
      localDate: getLocalDate(sale.startAt, sale.state),
      longitude: sale.longitude,
      photos: sale.photos,
      postcode: sale.postcode,
      startTime: getLocalTime(sale.startAt, sale.state),
      state: sale.state,
      suburb: sale.suburb,
      title: sale.title,
    },
  });
  const photos = useWatch({ control: form.control, name: "photos" }) ?? [];
  const errors = form.formState.errors;

  async function save(input: ManageSaleInput) {
    setError("");
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Could not save changes");
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not save changes",
      );
    }
  }

  async function remove() {
    if (!window.confirm("Remove this listing from all public pages?")) return;
    setRemoving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/sales/${sale.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Could not remove listing");
      router.replace("/admin?removed=1");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not remove listing",
      );
      setRemoving(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(save)} className="grid gap-6" noValidate>
      <div className="bg-card grid gap-5 rounded-xl border p-5 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          Title
          <Input {...form.register("title")} />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Description
          <Textarea rows={5} {...form.register("description")} />
          <FieldError message={errors.description?.message} />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Categories</legend>
          <div className="flex flex-wrap gap-2">
            {SALE_CATEGORIES.map((category) => (
              <label key={category.value} className="cursor-pointer">
                <input
                  type="checkbox"
                  value={category.value}
                  {...form.register("categories")}
                  className="peer sr-only"
                />
                <Badge
                  variant="outline"
                  className="peer-checked:border-primary peer-checked:bg-secondary min-h-9 px-3"
                >
                  {category.label}
                </Badge>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="bg-card grid gap-5 rounded-xl border p-5 sm:p-6">
        <label className="grid gap-2 text-sm font-medium">
          Complete address
          <Input {...form.register("address")} />
          <FieldError message={errors.address?.message} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Suburb
            <Input {...form.register("suburb")} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            State
            <Input {...form.register("state")} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Postcode
            <Input {...form.register("postcode")} />
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
      </div>

      <div className="bg-card grid gap-3 rounded-xl border p-5 sm:p-6">
        <h2 className="font-semibold">Photos</h2>
        {photos.length === 0 ? (
          <p className="text-muted-foreground text-sm">No photos attached.</p>
        ) : (
          photos.map((photo, index) => (
            <div
              key={photo}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>Photo {index + 1}</span>
              <button
                type="button"
                className="hover:bg-muted rounded-md p-1"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() =>
                  form.setValue(
                    "photos",
                    photos.filter((item) => item !== photo),
                  )
                }
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {saved ? (
        <Alert>
          <AlertTitle>Changes saved</AlertTitle>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : null}
          Save changes
        </Button>
        <Button
          type="button"
          size="lg"
          variant="destructive"
          disabled={removing}
          onClick={remove}
        >
          <Trash2 aria-hidden="true" /> Remove listing
        </Button>
      </div>
    </form>
  );
}
