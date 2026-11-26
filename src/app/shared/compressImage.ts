/**
 * يضغط الصورة في المتصفح قبل رفعها: يصغّر أبعادها إلى حد معقول ويحوّلها إلى WebP.
 * صورة غلاف بحجم 30 ميغا تصير عادةً بين 300 و800 كيلوبايت دون فرق تراه العين.
 *
 * لا تُلمس: صور GIF المتحركة وSVG، ولا الصور الصغيرة أصلاً.
 * وإن خرجت النسخة المضغوطة أكبر من الأصل (نادر) يُرفع الأصل كما هو.
 */
export interface CompressResult {
  file: File;
  before: number;
  after: number;
}

export async function compressImage(
  file: File,
  { maxSide = 2400, quality = 0.82 }: { maxSide?: number; quality?: number } = {}
): Promise<CompressResult> {
  const before = file.size;
  const skip = !file.type.startsWith("image/") || /gif|svg/.test(file.type) || before < 250 * 1024;
  if (skip) return { file, before, after: before };

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, before, after: before };
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.size >= before) return { file, before, after: before };

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return { file: new File([blob], name, { type: "image/webp" }), before, after: blob.size };
  } catch {
    // صيغة لا يفهمها المتصفح (مثل HEIC على بعض الأجهزة): تُرفع كما هي
    return { file, before, after: before };
  }
}

export const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} ميغا` : `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`;
