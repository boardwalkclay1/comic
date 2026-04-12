import { buildGrid3 } from "./grid-3.js";
import { buildGrid6 } from "./grid-6.js";
import { buildCinematic } from "./cinematic.js";

export class LayoutEngine {
  constructor(pageWidth, pageHeight) {
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
  }

  buildPages({ images, story, layoutKey, maxPages }) {
    const pages = [];
    const totalPages = Math.min(maxPages, 10);
    const storyTexts = this.resolveStoryTexts(story, totalPages);

    for (let i = 0; i < totalPages; i++) {
      const pageIndex = i;
      const text = storyTexts[i] || "";
      const layout = this.buildLayout(layoutKey, images, pageIndex, totalPages);

      const bubbles = this.buildBubblesForPage(layout, text);

      pages.push({
        panels: layout.panels,
        bubbles
      });
    }

    return pages;
  }

  resolveStoryTexts(story, totalPages) {
    if (!story) return Array(totalPages).fill("");
    if (story.mode === "single") {
      const chunks = splitTextIntoChunks(story.text || "", totalPages);
      return chunks;
    } else if (story.mode === "per-page") {
      const arr = story.pages || [];
      if (arr.length < totalPages) {
        return arr.concat(Array(totalPages - arr.length).fill(""));
      }
      return arr.slice(0, totalPages);
    }
    return Array(totalPages).fill("");
  }

  buildLayout(layoutKey, images, pageIndex, totalPages) {
    switch (layoutKey) {
      case "grid-3":
        return buildGrid3(this.pageWidth, this.pageHeight, images, pageIndex);
      case "grid-6":
        return buildGrid6(this.pageWidth, this.pageHeight, images, pageIndex);
      case "cinematic":
        return buildCinematic(this.pageWidth, this.pageHeight, images, pageIndex);
      default:
        return buildGrid3(this.pageWidth, this.pageHeight, images, pageIndex);
    }
  }

  buildBubblesForPage(layout, text) {
    const panels = layout.panels;
    const lines = text.split(/\n+/).filter(Boolean);
    const bubbles = [];

    const perPanel = Math.max(1, Math.floor(lines.length / Math.max(1, panels.length)) || 1);
    let idx = 0;

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const slice = lines.slice(idx, idx + perPanel);
      idx += perPanel;

      const bubbleText = slice.join(" ");
      if (!bubbleText) continue;

      const bubbleWidth = panel.w * 0.7;
      const bubbleHeight = panel.h * 0.3;
      const bubbleX = panel.x + panel.w * 0.15;
      const bubbleY = panel.y + panel.h * 0.05;

      bubbles.push({
        x: bubbleX,
        y: bubbleY,
        w: bubbleWidth,
        h: bubbleHeight,
        text: bubbleText
      });
    }

    return bubbles;
  }
}

function splitTextIntoChunks(text, chunks) {
  const words = text.split(/\s+/);
  const totalWords = words.length;
  const perChunk = Math.ceil(totalWords / chunks);
  const result = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * perChunk;
    const end = start + perChunk;
    result.push(words.slice(start, end).join(" "));
  }

  return result;
}
