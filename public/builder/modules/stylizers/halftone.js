export function applyHalftone(imageData) {
  const { data, width, height } = imageData;
  const dotSize = 4;

  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let dy = 0; dy < dotSize; dy++) {
        for (let dx = 0; dx < dotSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= width || py >= height) continue;
          const idx = (py * width + px) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }

      const rAvg = rSum / count;
      const gAvg = gSum / count;
      const bAvg = bSum / count;
      const lum = (rAvg + gAvg + bAvg) / 3;

      const radius = (1 - lum / 255) * (dotSize / 2);

      for (let dy = 0; dy < dotSize; dy++) {
        for (let dx = 0; dx < dotSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= width || py >= height) continue;
          const idx = (py * width + px) * 4;

          const cx = x + dotSize / 2;
          const cy = y + dotSize / 2;
          const dist = Math.hypot(px - cx, py - cy);

          if (dist <= radius) {
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
          } else {
            data[idx] = 255;
            data[idx + 1] = 255;
            data[idx + 2] = 255;
          }
        }
      }
    }
  }
}
