export function buildGrid3(pageWidth, pageHeight, images, pageIndex) {
  const panels = [];
  const margin = 40;
  const gutter = 20;

  const panelWidth = pageWidth - margin * 2;
  const panelHeight = (pageHeight - margin * 2 - gutter * 2) / 3;

  for (let i = 0; i < 3; i++) {
    const x = margin;
    const y = margin + i * (panelHeight + gutter);
    const imgIndex = (pageIndex * 3 + i) % Math.max(1, images.length);
    panels.push({
      x,
      y,
      w: panelWidth,
      h: panelHeight,
      image: images[imgIndex] || null
    });
  }

  return { panels };
}
