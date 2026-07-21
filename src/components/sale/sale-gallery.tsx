import { ImageIcon } from "lucide-react";
import Image from "next/image";

type SaleGalleryProps = {
  photos: string[];
  title: string;
};

export function SaleGallery({ photos, title }: SaleGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="from-secondary via-muted to-accent/40 flex aspect-[16/8] items-center justify-center rounded-2xl border bg-gradient-to-br">
        <div className="text-muted-foreground text-center">
          <ImageIcon
            className="text-primary/40 mx-auto size-12"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm">No photos added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {photos.map((photo, index) => (
        <div
          key={photo}
          className={
            index === 0
              ? "relative aspect-[16/9] overflow-hidden rounded-2xl sm:col-span-2"
              : "relative aspect-[4/3] overflow-hidden rounded-xl"
          }
        >
          <Image
            src={photo}
            alt={`${title} photo ${index + 1}`}
            fill
            sizes={
              index === 0
                ? "(max-width: 768px) 100vw, 800px"
                : "(max-width: 768px) 100vw, 400px"
            }
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
