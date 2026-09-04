'use client';

// Compress a profile photo so the upload stays under maxBytes (default 2MB).
// Downscales to max 512px and re-encodes as JPEG with decreasing quality.

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 512;

function drawToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Image conversion failed'));
      },
      'image/jpeg',
      quality
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('File is not a readable image'));
    };
    image.src = url;
  });
}

export async function compressAvatarImage(file: File, maxBytes: number = AVATAR_MAX_BYTES): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
  if (file.size <= maxBytes && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    // Small enough already — still normalize through canvas for a consistent JPEG.
  }
  const image = await loadImage(file);
  const canvas = drawToCanvas(image);
  let quality = 0.9;
  let blob = await canvasToBlob(canvas, quality);
  while (blob.size > maxBytes && quality > 0.35) {
    quality -= 0.15;
    blob = await canvasToBlob(canvas, quality);
  }
  if (blob.size > maxBytes) throw new Error('Photo is too large even after compression');
  return blob;
}

export function initialsOf(name: string): string {
  const clean = name.trim();
  if (!clean) return 'A';
  const parts = clean.split(/\s+/);
  const first = parts[0]?.charAt(0) ?? 'A';
  const second = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : '';
  return `${first}${second}`.toUpperCase();
}
