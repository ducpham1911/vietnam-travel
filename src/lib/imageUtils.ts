const MAX_SIZE = 600;
const JPEG_QUALITY = 0.7;

export function compressThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      let w = width;
      let h = height;

      if (w > MAX_SIZE || h > MAX_SIZE) {
        if (w > h) {
          h = Math.round(h * (MAX_SIZE / w));
          w = MAX_SIZE;
        } else {
          w = Math.round(w * (MAX_SIZE / h));
          h = MAX_SIZE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}
