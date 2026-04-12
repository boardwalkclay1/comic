export function buildCinematic(pageWidth, pageHeight, images, pageIndex) {
  const panels = [];
  const margin = 40;
  const gutter = 20;

  const topHeight = (pageHeight - margin * 2 - gutter) * 0.6;
  const bottomHeight = (pageHeight - margin * 2 - gutter) * 0.4;

  const topWidth = pageWidth - margin * 2;
  const bottomWidth = (pageWidth - margin * 2 - gutter) / 2;

  const imgIndexTop = (pageIndex * 3) % Math.max(1, images.length);
  panels.push({
    x: margin,
    y: margin,
    w: topWidth,
    h: topHeight,
    image: images[imgIndexTop] || null
  });

  const imgIndexBottom1 = (pageIndex * 3 + 1) % Math.max(1, images.length);
  const imgIndexBottom2 = (pageIndex * 3 + 2) % Math.max(1, images.length);

  panels.push({
    x: margin,
    y: margin + topHeight + gutter,
    w: bottomWidth,
    h: bottomHeight,
    image: images[imgIndexBottom1] || null
  });

  panels.push({
    x: margin + bottomWidth + gutter,
    y: margin + topHeight + gutter,
    w: bottomWidth,
    h: bottomHeight,
    image: images[imgIndexBottom2] || null
  });

  return { panels };
}
