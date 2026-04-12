export function buildGrid6(pageWidth, pageHeight, images, pageIndex) {
  const panels = [];
  const margin = 40;
  const gutter = 16;

  const cols = 3;
  const rows = 2;

  const panelWidth = (pageWidth - margin * 2 - gutter * (cols - 1)) / cols;
  const panelHeight = (pageHeight - margin * 2 - gutter * (rows - 1)) / rows;

  let panelCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * (panelWidth + gutter);
      const y = margin + row * (panelHeight + gutter);
      const imgIndex = (pageIndex * 6 + panelCount) % Math.max(1, images.length);
      panels.push({
        x,
        y,
        w: panelWidth,
        h: panelHeight,
        image: images[imgIndex] || null
      });
      panelCount++;
    }
  }

  return { panels };
}
