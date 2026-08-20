"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  tomorrowDate,
  type MapboxFeature,
} from "@/components/forms/publish-form-types";
import { PublishListingSection } from "@/components/forms/publish-listing-section";
import { PublishLocationSection } from "@/components/forms/publish-location-section";
import {
  PublishContactSection,
  PublishTimeSection,
} from "@/components/forms/publish-time-contact-sections";
import { TurnstileWidget } from "@/components/forms/turnstile-widget";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MAX_PHOTO_BYTES, MAX_PHOTO_COUNT } from "@/config/constants";
import { uploadSalePhotos } from "@/lib/client/photo-upload";
import {
  publishSaleSchema,
  type PublishSaleFormInput,
  type PublishSaleInput,
} from "@/lib/validation/sale";
export function PublishForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [formError, setFormError] = useState("");
  const [previewVerifyUrl, setPreviewVerifyUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<MapboxFeature[]>(
    [],
  );
  const form = useForm<PublishSaleFormInput, unknown, PublishSaleInput>({
    resolver: zodResolver(publishSaleSchema),
    defaultValues: {
      address: "",
      categories: [],
      contactEmail: "",
      description: "",
      endTime: "13:00",
      latitude: -32.0569,
      localDate: tomorrowDate(),
      longitude: 115.7478,
      photos: [],
      postcode: "6160",
      startTime: "08:00",
      state: "WA",
      suburb: "Fremantle",
      title: "",
      website: "",
    },
  });
  const address = useWatch({ control: form.control, name: "address" }) ?? "";
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapboxToken || address.trim().length < 5) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const parameters = new URLSearchParams({
        access_token: mapboxToken,
        autocomplete: "true",
        country: "au",
        limit: "5",
        q: address,
        types: "address",
      });
      const response = await fetch(
        `https://api.mapbox.com/search/geocode/v6/forward?${parameters}`,
        { signal: controller.signal },
      );
      if (!response.ok) return;
      const result = (await response.json()) as { features?: MapboxFeature[] };
      setAddressSuggestions(result.features ?? []);
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [address, mapboxToken]);

  function selectMapboxAddress(feature: MapboxFeature) {
    const properties = feature.properties;
    const coordinates = properties?.coordinates;
    const context = properties?.context;
    if (
      !properties ||
      typeof coordinates?.latitude !== "number" ||
      typeof coordinates.longitude !== "number" ||
      !context?.place?.name ||
      !context.postcode?.name ||
      !context.region?.region_code
    ) {
      return;
    }
    form.setValue("address", properties.full_address ?? properties.name ?? "", {
      shouldValidate: true,
    });
    form.setValue("latitude", coordinates.latitude);
    form.setValue("longitude", coordinates.longitude);
    form.setValue("suburb", context.place.name);
    form.setValue("postcode", context.postcode.name);
    form.setValue(
      "state",
      context.region.region_code.replace(
        "AU-",
        "",
      ) as PublishSaleInput["state"],
    );
    setAddressSuggestions([]);
  }

  function selectPhotos(selected: FileList | null) {
    if (!selected) return;
    setFormError("");
    const nextFiles = [...files, ...Array.from(selected)];
    if (nextFiles.length > MAX_PHOTO_COUNT) {
      setFormError(`You can add up to ${MAX_PHOTO_COUNT} photos.`);
      return;
    }
    if (
      nextFiles.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > MAX_PHOTO_BYTES,
      )
    ) {
      setFormError("Photos must be JPEG, PNG or WebP and no larger than 5 MB.");
      return;
    }
    setFiles(nextFiles);
  }

  async function submit(input: PublishSaleInput) {
    setFormError("");
    try {
      const photos = await uploadSalePhotos(files);
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, photos, turnstileToken }),
      });
      const result = (await response.json()) as {
        error?: string;
        previewVerifyUrl?: string;
      };
      if (!response.ok)
        throw new Error(result.error ?? "Could not publish sale");
      setPreviewVerifyUrl(result.previewVerifyUrl ?? "sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't publish your sale. Please try again.",
      );
    }
  }

  if (previewVerifyUrl) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center p-8 text-center sm:p-12">
          <span className="bg-secondary text-primary flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold">Check your inbox</h1>
          <p className="text-muted-foreground mt-3 max-w-md">
            We sent a private confirmation link. Open it to make your garage
            sale live.
          </p>
          {previewVerifyUrl !== "sent" ? (
            <Alert className="mt-6 text-left">
              <ShieldCheck aria-hidden="true" />
              <AlertTitle>Local email preview</AlertTitle>
              <AlertDescription>
                Resend is not connected. Use this link to test the verification
                flow.
              </AlertDescription>
              <Button asChild className="mt-4">
                <a href={previewVerifyUrl}>Confirm local listing</a>
              </Button>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
      <PublishListingSection
        files={files}
        form={form}
        onSelectPhotos={selectPhotos}
        onRemoveFile={(index) =>
          setFiles((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
          )
        }
      />
      <PublishLocationSection
        form={form}
        suggestions={addressSuggestions}
        onSelectMapboxAddress={selectMapboxAddress}
      />
      <PublishTimeSection form={form} />
      <PublishContactSection form={form} />
      <TurnstileWidget onToken={setTurnstileToken} />
      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>We couldn&apos;t submit the listing</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full text-base"
        disabled={form.formState.isSubmitting || !turnstileToken}
      >
        {form.formState.isSubmitting ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : null}
        {form.formState.isSubmitting ? "Publishing…" : "Publish my garage sale"}
      </Button>
    </form>
  );
}
