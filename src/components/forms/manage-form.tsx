"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  ManageDetailsSection,
  ManagePhotosSection,
} from "@/components/forms/manage-listing-sections";
import {
  ManageControls,
  ManageLocationSection,
} from "@/components/forms/manage-location-controls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MAX_PHOTO_BYTES, MAX_PHOTO_COUNT } from "@/config/constants";
import { uploadSalePhotos } from "@/lib/client/photo-upload";
import { getLocalDate, getLocalTime } from "@/lib/geo/timezone";
import {
  manageSaleSchema,
  type ManageSaleFormInput,
  type ManageSaleInput,
} from "@/lib/validation/sale";
import type { ManagedSale } from "@/types/manage";

type ManageFormProps = {
  demoMode: boolean;
  sale: ManagedSale;
  verified: boolean;
};

export function ManageForm({ demoMode, sale, verified }: ManageFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(sale.status);
  const [actionPending, setActionPending] = useState(false);
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
  const existingPhotos =
    useWatch({ control: form.control, name: "photos" }) ?? [];

  function addPhotos(selected: FileList | null) {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)];
    if (existingPhotos.length + next.length > MAX_PHOTO_COUNT) {
      setFormError(`You can keep up to ${MAX_PHOTO_COUNT} photos.`);
      return;
    }
    if (
      next.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > MAX_PHOTO_BYTES,
      )
    ) {
      setFormError("Photos must be JPEG, PNG or WebP and no larger than 5 MB.");
      return;
    }
    setFiles(next);
    setFormError("");
  }

  async function save(input: ManageSaleInput) {
    setFormError("");
    setSaved(false);
    try {
      const uploaded = demoMode ? [] : await uploadSalePhotos(files);
      const response = await fetch(`/api/manage/${sale.manageToken}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...input,
          photos: [...input.photos, ...uploaded],
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Could not save changes");
      form.setValue("photos", [...input.photos, ...uploaded]);
      setFiles([]);
      setSaved(true);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't save your changes. Please try again.",
      );
    }
  }

  async function changeStatus(action: "cancel" | "remove") {
    const message =
      action === "cancel"
        ? "Cancel this listing and remove it from all public pages?"
        : "Permanently remove this listing? This management link will stop working.";
    if (!window.confirm(message)) return;
    setActionPending(true);
    setFormError("");
    try {
      const response = await fetch(
        action === "cancel"
          ? `/api/manage/${sale.manageToken}/cancel`
          : `/api/manage/${sale.manageToken}`,
        { method: action === "cancel" ? "POST" : "DELETE" },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Action failed");
      if (action === "remove") {
        router.replace("/?removed=1");
        return;
      }
      setStatus("cancelled");
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Action failed");
    } finally {
      setActionPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {verified ? (
        <Alert className="border-primary/30 bg-secondary/50">
          <AlertTitle>Your listing is live</AlertTitle>
          <AlertDescription>
            Your email is confirmed. Keep this private page to make changes.
          </AlertDescription>
        </Alert>
      ) : null}
      {status === "pending_verification" ? (
        <Alert>
          <AlertTitle>Waiting for email confirmation</AlertTitle>
          <AlertDescription>
            This listing is not public yet. Open the confirmation link in your
            email first.
          </AlertDescription>
        </Alert>
      ) : null}
      {status === "cancelled" ? (
        <Alert variant="destructive">
          <AlertTitle>This listing is cancelled</AlertTitle>
          <AlertDescription>
            It is no longer public. You can still review it or remove it
            permanently.
          </AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={form.handleSubmit(save)} className="space-y-6" noValidate>
        <ManageDetailsSection form={form} />
        <ManagePhotosSection
          demoMode={demoMode}
          existingPhotos={existingPhotos}
          files={files}
          onAddPhotos={addPhotos}
          onRemoveExisting={(photo) =>
            form.setValue(
              "photos",
              existingPhotos.filter((item) => item !== photo),
            )
          }
          onRemoveFile={(index) =>
            setFiles((current) =>
              current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        />
        <ManageLocationSection demoMode={demoMode} form={form} />
        {formError ? (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
        {saved ? (
          <Alert>
            <AlertTitle>Changes saved</AlertTitle>
          </Alert>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={form.formState.isSubmitting || status === "cancelled"}
        >
          {form.formState.isSubmitting ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : null}
          Save changes
        </Button>
      </form>

      <ManageControls
        actionPending={actionPending}
        onAction={changeStatus}
        status={status}
      />
    </div>
  );
}
