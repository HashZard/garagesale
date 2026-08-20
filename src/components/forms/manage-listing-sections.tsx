import { ImagePlus, X } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import type { ManageFormApi } from "@/components/forms/manage-form-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SALE_CATEGORIES } from "@/config/constants";

export function ManageDetailsSection({ form }: { form: ManageFormApi }) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
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
      </CardContent>
    </Card>
  );
}

export function ManagePhotosSection({
  existingPhotos,
  files,
  onAddPhotos,
  onRemoveExisting,
  onRemoveFile,
}: {
  existingPhotos: string[];
  files: File[];
  onAddPhotos: (files: FileList | null) => void;
  onRemoveExisting: (photo: string) => void;
  onRemoveFile: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {existingPhotos.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {existingPhotos.map((photo, index) => (
              <li
                key={photo}
                className="flex items-center justify-between gap-2 rounded-lg border p-2 text-xs"
              >
                <span className="truncate">Photo {index + 1}</span>
                <button
                  type="button"
                  className="hover:bg-muted rounded-md p-1"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => onRemoveExisting(photo)}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="bg-muted/40 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-4 text-center">
          <ImagePlus className="text-primary size-5" aria-hidden="true" />
          <span className="mt-2 text-sm font-medium">Add photos</span>
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => onAddPhotos(event.target.files)}
          />
        </label>
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.lastModified}`}
            className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
          >
            <span className="truncate">{file.name}</span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemoveFile(index)}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
