export function applyNoir(imageData) {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray = 0.3 * r + 0.59 * g + 0.11 * b;
    gray *= 1.4;
    if (gray > 255) gray = 255;

    data[i] = gray * 0.9;
    data[i + 1] = gray * 0.9;
    data[i + 2] = gray;
  }
}
