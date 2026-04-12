import { StylizerEngine } from "../modules/stylizers/engine.js";
import { LayoutEngine } from "../modules/layouts/engine.js";
import { exportAsPdf } from "../modules/pdf/exporter.js";

window.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const imageThumbs = document.getElementById("imageThumbs");
  const styleSelect = document.getElementById("styleSelect");
  const layoutSelect = document.getElementById("layoutSelect");
  const fontSelect = document.getElementById("fontSelect");
  const bubbleSelect = document.getElementById("bubbleSelect");
  const storyMode = document.getElementById("storyMode");
  const storySingleWrap = document.getElementById("storySingleWrap");
  const storyPagesWrap = document.getElementById("storyPagesWrap");
  const storyInput = document.getElementById("storyInput");
  const previewPages = document.getElementById("previewPages");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const regenPageBtn = document.getElementById("regenPageBtn");

  const MAX_PAGES = 10;
  const PAGE_WIDTH = 800;
  const PAGE_HEIGHT = 1200;

  let uploadedImages = [];      // File objects
  let imageBitmaps = [];        // ImageBitmap or HTMLImageElement
  let pageCanvases = [];        // Canvas per page
  let currentPageIndex = 0;     // For regenerate

  storyMode.addEventListener("change", () => {
    if (storyMode.value === "single") {
      storySingleWrap.style.display = "";
      storyPagesWrap.style.display = "none";
    } else {
      storySingleWrap.style.display = "none";
      storyPagesWrap.style.display = "";
    }
  });

  imageInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files || []);
    uploadedImages = files;
    imageThumbs.innerHTML = "";
    imageBitmaps = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = url;
      imageThumbs.appendChild(img);

      const bitmap = await loadImage(url);
      imageBitmaps.push(bitmap);
    }
  });

  generateBtn.addEventListener("click", async () => {
    if (!imageBitmaps.length) return;

    const style = styleSelect.value;
    const layout = layoutSelect.value;
    const font = fontSelect.value;
    const bubble = bubbleSelect.value;

    const storyData = collectStory();
    const layoutEngine = new LayoutEngine(PAGE_WIDTH, PAGE_HEIGHT);
    const stylizer = new StylizerEngine();

    const pageSpecs = layoutEngine.buildPages({
      images: imageBitmaps,
      story: storyData,
      layoutKey: layout,
      maxPages: MAX_PAGES
    });

    pageCanvases = [];
    previewPages.innerHTML = "";

    for (let i = 0; i < pageSpecs.length; i++) {
      const spec = pageSpecs[i];
      const canvas = document.createElement("canvas");
      canvas.width = PAGE_WIDTH;
      canvas.height = PAGE_HEIGHT;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

      for (const panel of spec.panels) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(panel.x, panel.y, panel.w, panel.h);
        ctx.clip();

        const img = panel.image;
        if (img) {
          drawImageCover(ctx, img, panel.x, panel.y, panel.w, panel.h);
          await stylizer.applyStyle(ctx, panel, style);
        }

        ctx.restore();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
      }

      ctx.save();
      ctx.font = selectFont(font, 24);
      ctx.fillStyle = "#000000";
      ctx.textBaseline = "top";

      for (const bubbleSpec of spec.bubbles) {
        drawBubble(ctx, bubbleSpec, bubble);
      }

      ctx.restore();

      pageCanvases.push(canvas);

      const preview = document.createElement("div");
      preview.className = "preview-page";
      preview.dataset.index = String(i);

      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = 300;
      thumbCanvas.height = 450;
      const tctx = thumbCanvas.getContext("2d");
      tctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

      preview.appendChild(thumbCanvas);
      const label = document.createElement("span");
      label.textContent = `Page ${i + 1}`;
      preview.appendChild(label);

      preview.addEventListener("click", () => {
        currentPageIndex = i;
      });

      previewPages.appendChild(preview);
    }

    currentPageIndex = 0;
  });

  regenPageBtn.addEventListener("click", async () => {
    if (!pageCanvases.length) return;
    const style = styleSelect.value;
    const layout = layoutSelect.value;
    const font = fontSelect.value;
    const bubble = bubbleSelect.value;
    const storyData = collectStory();

    const layoutEngine = new LayoutEngine(PAGE_WIDTH, PAGE_HEIGHT);
    const stylizer = new StylizerEngine();

    const pageSpecs = layoutEngine.buildPages({
      images: imageBitmaps,
      story: storyData,
      layoutKey: layout,
      maxPages: MAX_PAGES
    });

    const spec = pageSpecs[currentPageIndex];
    const canvas = pageCanvases[currentPageIndex];
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

    for (const panel of spec.panels) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(panel.x, panel.y, panel.w, panel.h);
      ctx.clip();

      const img = panel.image;
      if (img) {
        drawImageCover(ctx, img, panel.x, panel.y, panel.w, panel.h);
        await stylizer.applyStyle(ctx, panel, style);
      }

      ctx.restore();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    }

    ctx.save();
    ctx.font = selectFont(font, 24);
    ctx.fillStyle = "#000000";
    ctx.textBaseline = "top";

    for (const bubbleSpec of spec.bubbles) {
      drawBubble(ctx, bubbleSpec, bubble);
    }

    ctx.restore();

    const preview = previewPages.querySelector(`.preview-page[data-index="${currentPageIndex}"]`);
    if (preview) {
      const thumbCanvas = preview.querySelector("canvas");
      const tctx = thumbCanvas.getContext("2d");
      tctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    }
  });

  downloadBtn.addEventListener("click", async () => {
    if (!pageCanvases.length) return;
    await exportAsPdf(pageCanvases, { filename: "boardwalk-comic.pdf" });
  });

  function collectStory() {
    if (storyMode.value === "single") {
      return {
        mode: "single",
        text: storyInput.value || ""
      };
    } else {
      const pages = [];
      for (let i = 1; i <= MAX_PAGES; i++) {
        const el = document.getElementById(`storyPage${i}`);
        pages.push(el ? el.value || "" : "");
      }
      return {
        mode: "per-page",
        pages
      };
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function drawImageCover(ctx, img, x, y, w, h) {
    const iw = img.width;
    const ih = img.height;
    const ir = iw / ih;
    const r = w / h;

    let dw = w;
    let dh = h;
    let dx = x;
    let dy = y;

    if (ir > r) {
      dh = h;
      dw = h * ir;
      dx = x + (w - dw) / 2;
    } else {
      dw = w;
      dh = w / ir;
      dy = y + (h - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function selectFont(fontKey, size) {
    switch (fontKey) {
      case "ComicSans":
        return `${size}px "Comic Sans MS", "ComicSans", system-ui`;
      case "Impact":
        return `${size}px "Impact", system-ui`;
      case "Serif":
        return `${size}px "Georgia", "Times New Roman", serif`;
      case "Sans":
      default:
        return `${size}px "Segoe UI", system-ui, sans-serif`;
    }
  }

  function drawBubble(ctx, spec, bubbleStyle) {
    const padding = 10;
    const x = spec.x;
    const y = spec.y;
    const w = spec.w;
    const h = spec.h;
    const text = spec.text || "";

    ctx.save();

    if (bubbleStyle === "round") {
      roundRect(ctx, x, y, w, h, 16);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (bubbleStyle === "shout") {
      jaggedRect(ctx, x, y, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (bubbleStyle === "narration") {
      ctx.fillStyle = "rgba(255,255,200,0.95)";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }

    ctx.fillStyle = "#000000";
    const lines = wrapText(ctx, text, w - padding * 2);
    let ty = y + padding;
    for (const line of lines) {
      ctx.fillText(line, x + padding, ty);
      ty += 24;
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function jaggedRect(ctx, x, y, w, h) {
    const spikes = 10;
    const stepX = w / spikes;
    const stepY = h / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y + stepY);

    for (let i = 0; i < spikes; i++) {
      const nx = x + i * stepX;
      const ny = y;
      ctx.lineTo(nx + stepX * 0.5, ny - 6);
      ctx.lineTo(nx + stepX, ny + stepY);
    }

    ctx.lineTo(x + w, y + h - stepY);

    for (let i = spikes; i > 0; i--) {
      const nx = x + i * stepX;
      const ny = y + h;
      ctx.lineTo(nx - stepX * 0.5, ny + 6);
      ctx.lineTo(nx - stepX, ny - stepY);
    }

    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const words = (text || "").split(/\s+/);
    const lines = [];
    let line = "";

    for (const word of words) {
      const testLine = line ? line + " " + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
});
