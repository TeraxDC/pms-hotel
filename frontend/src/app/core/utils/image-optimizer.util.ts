/**
 * Utility to optimize and convert uploaded image files (PNG, JPG, SVG, WebP, ICO)
 * to a lightweight, high-fidelity Base64 Data URL.
 */
export function optimizeImageFile(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 300,
  quality: number = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No se seleccionó ningún archivo'));
    }

    // Direct read for SVG and ICO (keep full vector & multi-icon fidelity)
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isIco = file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico');

    if (isSvg || isIco) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
      return;
    }

    // Bitmap images: resize and optimize using HTML5 canvas
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve((e.target?.result as string) || '');
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG format for transparent backgrounds, else WebP or JPEG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Error al decodificar la imagen'));
      img.src = (e.target?.result as string) || '';
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}
