import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href;

export type PdfProgressCallback = (current: number, total: number) => void;

type PdfInput = File | ArrayBuffer | Uint8Array;

async function toPdfData(input: PdfInput): Promise<Uint8Array> {
  if (input instanceof File) {
    return new Uint8Array(await input.arrayBuffer());
  }
  if (input instanceof Uint8Array) {
    return input;
  }
  return new Uint8Array(input);
}

export async function pdfToImages(
  input: PdfInput,
  onProgress?: PdfProgressCallback,
): Promise<string[]> {
  const pdfData = await toPdfData(input);
  const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const totalPages = pdf.numPages;
  const images: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = 1600 / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    images.push(canvas.toDataURL('image/jpeg', 0.85));
    onProgress?.(i, totalPages);
  }

  return images;
}
