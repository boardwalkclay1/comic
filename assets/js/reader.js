// =========================
// SOUNDTRACK EMBED
// =========================

export const soundtracks = {
  khalid: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187301982&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
};

const scPlayer = document.getElementById("scPlayer");
scPlayer.src = soundtracks.khalid;


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

const wrapper = document.getElementById("flipWrapper");
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
// PAGE LOCK — REAL FIX
// =========================

function lockFlip() {
  wrapper.classList.add("locked");
}

function unlockFlip() {
  wrapper.classList.remove("locked");
}


// =========================
// RENDER PAGE
// =========================

async function renderPageToCanvas(pageNum, canvas, ctx) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 3.0 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;
}


// =========================
// PAGE FLIP — FINAL FIX
// =========================

async function flipToPage(num) {
  if (isRendering) return;
  isRendering = true;

  // THIS is what keeps the comic from moving
  lockFlip();

  const front = showingA ? pageA : pageB;
  const back = showingA ? pageB : pageA;
  const backCtx = showingA ? ctxB : ctxA;

  await renderPageToCanvas(num, back, backCtx);

  front.classList.remove("flip");
  back.classList.remove("flip");

  requestAnimationFrame(() => back.classList.add("flip"));

  setTimeout(() => {
    showingA = !showingA;
    currentPage = num;
    isRendering = false;

    unlockFlip();

    // Keep the comic EXACTLY in place
    window.scrollTo({ top: 0, behavior: "instant" });
  }, 1400);
}


// =========================
// LOAD PDF
// =========================

async function loadPdf() {
  const loadingTask = pdfjsLib.getDocument(PDF_URL);
  pdfDoc = await loadingTask.promise;
  totalPages = pdfDoc.numPages;

  await renderPageToCanvas(1, pageA, ctxA);
}


// =========================
// NAV BUTTONS
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
