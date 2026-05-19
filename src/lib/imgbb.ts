// src/lib/imgbb.ts
// Free image hosting – https://api.imgbb.com/
// Free tier: unlimited uploads, images never expire

const IMGBB_API = "https://api.imgbb.com/1/upload";

export interface ImgBBResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    thumb: { url: string };
    delete_url: string;
  };
  success: boolean;
}

/**
 * Upload an image file to ImgBB and get back a permanent URL.
 * Call this from the browser (admin panel).
 *
 * Usage:
 *   const result = await uploadImage(file);
 *   article.imageUrl = result.data.url;
 */
export async function uploadImage(file: File): Promise<ImgBBResponse> {
  const apiKey = import.meta.env.PUBLIC_IMGBB_API_KEY;
  if (!apiKey) throw new Error("Missing PUBLIC_IMGBB_API_KEY in .env");

  const form = new FormData();
  form.append("image", file);
  form.append("key", apiKey);

  const res = await fetch(IMGBB_API, { method: "POST", body: form });
  if (!res.ok) throw new Error(`ImgBB upload failed: ${res.statusText}`);

  const json: ImgBBResponse = await res.json();
  if (!json.success) throw new Error("ImgBB returned success=false");

  return json;
}

/**
 * Upload from a base64 string (useful when you already have base64 data).
 */
export async function uploadBase64(base64: string): Promise<ImgBBResponse> {
  const apiKey = import.meta.env.PUBLIC_IMGBB_API_KEY;
  const form = new FormData();
  form.append("image", base64);
  form.append("key", apiKey!);

  const res = await fetch(IMGBB_API, { method: "POST", body: form });
  const json: ImgBBResponse = await res.json();
  return json;
}
