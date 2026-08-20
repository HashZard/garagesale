"use client";

import { resizeImage } from "@/lib/images";

export async function uploadSalePhotos(files: File[]): Promise<string[]> {
  const uploadedUrls: string[] = [];
  for (const file of files) {
    const resized = await resizeImage(file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        "Content-Type": resized.type,
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: resized,
    });
    if (!response.ok) throw new Error("Could not upload photo");
    const uploaded = (await response.json()) as {
      key: string;
      publicUrl: string;
    };
    uploadedUrls.push(uploaded.publicUrl);
  }
  return uploadedUrls;
}
