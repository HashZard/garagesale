import { ImagePlus, X } from "lucide-react";

import { FieldError } from "@/components/forms/field-error";
import type { PublishFormApi } from "@/components/forms/publish-form-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SALE_CATEGORIES } from "@/config/constants";

type PublishListingSectionProps = {
  demoMode: boolean;
  files: File[];
  form: PublishFormApi;
  onRemoveFile: (index: number) => void;
  onSelectPhotos: (files: FileList | null) => void;
};

export function PublishListingSection({
  demoMode,
  files,
  form,
  onRemoveFile,
  onSelectPhotos,
}: PublishListingSectionProps) {
  const errors = form.formState.errors;
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. What are you selling?</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          Title <span className="text-destructive">*</span>
          <Input
            placeholder="Big moving sale — furniture, tools and more"
            {...form.register("title")}
          />
          <FieldError message={errors.title?.message} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Description
          <Textarea
            rows={5}
            placeholder="Tell buyers what they can expect to find…"
            {...form.register("description")}
          />
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
        <div className="grid gap-2">
          <span className="text-sm font-medium">Photos</span>
          <label className="bg-muted/40 hover:border-primary flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors">
            <ImagePlus className="text-primary size-6" aria-hidden="true" />
            <span className="mt-2 text-sm font-medium">
              Add up to six photos
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              JPEG, PNG or WebP · 5 MB each
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => onSelectPhotos(event.target.files)}
            />
          </label>
          {files.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="bg-background flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {demoMode && files.length > 0 ? (
            <p className="text-muted-foreground text-xs">
              Photo names are previewed locally; files will persist after
              Supabase is connected.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
