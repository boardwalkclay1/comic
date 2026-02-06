// =========================
// SOUNDTRACK EMBED
// =========================

export const soundtracks = {
  khalid: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187301982&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
};

const scPlayer = document.getElementById("scPlayer");
if (scPlayer) {
  scPlayer.src = soundtracks.khalid;
}

// =========================
// PDF READER LOGIC
// =========================

import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

let fileName = new URLSearchParams(window.location.search).get("id");
if (!fileName) throw new Error("Missing ?id=");
if (!fileName.toLowerCase().endsWith(".pdf")) fileName += ".pdf";

const PDF_URL = `https://boardwalkclay1.github.io/comic/assets/books/${fileName}`;

const flipWrapper = document.getElementById("flipWrapper");
const pageA = document.getElementById("pageA");
const pageB = document.getElementById("pageB");
const ctxA = pageA.getContext("2d");
const ctxB = pageB.getContext("2d");

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isRendering = false;
let showingA = true;


// =========================
// RENDER PAGE — FIXED
// =========================

async function renderPageToCanvas(pageNum, canvas, ctx) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 3.0 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  // ALWAYS update wrapper size — THIS FIXES THE “ONLY 2 PAGES” BUG
  flipWrapper.style.width = canvas.width + "px";
  flipWrapper.style.height = canvas.height + "px";
}


// =========================
// PAGE FLIP — FIXED
// =========================

async function flipToPage(num) {
  if (isRendering) return;
  isRendering = true;

  const front = showingA ? pageA : pageB;
  const back = showingA ? pageB : pageA;
  const backCtx = showingA ? ctxB : ctxA;

  await renderPageToCanvas(num, back, backCtx);

  // Bring back page forward
  front.style.zIndex = 1;
  back.style.zIndex = 2;

  // Reset states
  front.classList.remove("visible");
  back.classList.remove("visible");

  // Animate
  requestAnimationFrame(() => {
    back.classList.add("visible");
  });

  setTimeout(() => {
    showingA = !showingA;
    currentPage = num;
    isRendering = false;
  }, 1200);
}


// =========================
// LOAD FIRST PAGE — FIXED
// =========================

async function loadPdf() {
  const loadingTask = pdfjsLib.getDocument(PDF_URL);
  pdfDoc = await loadingTask.promise;
  totalPages = pdfDoc.numPages;

  await renderPageToCanvas(1, pageA, ctxA);

  pageA.style.zIndex = 2;
  pageB.style.zIndex = 1;

  pageA.classList.add("visible");
}


// =========================
// NAV BUTTONS — FIXED
// =========================

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) flipToPage(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
  if (currentPage < totalPages) flipToPage(currentPage + 1);
};


// =========================
// INIT
// =========================

loadPdf();
