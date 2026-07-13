import { isMediaUploadConfigured, wooUploadMedia } from "@/lib/woocommerce";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_PREFIX = "image/";

export async function POST(request: Request) {
  if (!isMediaUploadConfigured()) {
    return Response.json(
      { error: "Photo uploads are not configured on the server yet." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload payload" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith(ALLOWED_PREFIX)) {
    return Response.json({ error: "Only image files are allowed" }, { status: 415 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: "Image must be under 10MB" }, { status: 413 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const safeName = file.name?.trim() || `upload-${Date.now()}`;
    const { url } = await wooUploadMedia(buffer, safeName, file.type);
    return Response.json({ url });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}
