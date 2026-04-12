export function applyManga(imageData) {
  const { data, width, height } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.3 * r + 0.59 * g + 0.11 * b;
    const threshold = 180;
    const v = gray > threshold ? 255 : 0;

    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }

  const copy = new Uint8ClampedArray(data);

  const kernel = [
    0, -1, 0,
    -1, 4, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];
          sum += copy[idx] * weight;
        }
      }
      const idx = (y * width + x) * 4;
      const v = sum > 50 ? 0 : 255;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
    }
  }
}
