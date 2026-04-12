export function applyCartoon(imageData) {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = quantize(r, 4);
    g = quantize(g, 4);
    b = quantize(b, 4);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function quantize(v, levels) {
  const step = 255 / (levels - 1);
  return Math.round(v / step) * step;
}
