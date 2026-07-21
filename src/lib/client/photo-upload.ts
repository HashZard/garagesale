"use client";

import { createBrowserSupabaseClient } from "@/lib/browser-supabase";
import { resizeImage } from "@/lib/images";

export async function uploadSalePhotos(files: File[]): Promise<string[]> {
  const client = createBrowserSupabaseClient();
  const uploadedUrls: string[] = [];
  for (const file of files) {
    const resized = await resizeImage(file);
    const signResponse = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentType: resized.type,
        fileSize: resized.size,
      }),
    });
    if (!signResponse.ok) throw new Error("Could not prepare photo upload");
    const signed = (await signResponse.json()) as {
      path: string;
      publicUrl: string;
      token: string;
    };
    const { error } = await client.storage
      .from("sale-photos")
      .uploadToSignedUrl(signed.path, signed.token, resized, {
        contentType: resized.type,
      });
    if (error) throw error;
    uploadedUrls.push(signed.publicUrl);
  }
  return uploadedUrls;
}
