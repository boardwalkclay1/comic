// =========================
// SOUNDTRACK EMBED
// =========================

export const soundtracks = {
  khalid: `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187301982&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
};

const scPlayer = document.getElementById("scPlayer");
if (scPlayer) scPlayer.src = soundtracks.khalid;


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

// We will ONLY use pageA as the live canvas
const flipWrapper = document.getElementById("flipWrapper");
const pageCanvas = document.getElementById("pageA");
const ctx = pageCanvas.getContext("2d");

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isTurning = false;

// Dramatic slow turn duration (match your CSS transition)
const TURN_TIME = 1600;


// =========================
// RENDER PAGE
// =========================

async function renderPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 3.0 });

  pageCanvas.width = viewport.width;
  pageCanvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  // keep wrapper sized to current page
  flipWrapper.style.width = pageCanvas.width + "px";
  flipWrapper.style.height = pageCanvas.height + "px";
}


// =========================
// PAGE TURN (ONE CLICK, NO SKIPS)
// =========================

async function flipToPage(num) {
  if (isTurning) return;
  if (num < 1 || num > totalPages) return;

  isTurning = true;

  // start dramatic effect
  pageCanvas.classList.add("turning");

  await renderPage(num);

  setTimeout(() => {
    pageCanvas.classList.remove("turning");
    currentPage = num;
    isTurning = false;
  }, TURN_TIME);
}


// =========================
// LOAD FIRST PAGE
// =========================

async function loadPdf() {
  const loadingTask = pdfjsLib.getDocument(PDF_URL);
  pdfDoc = await loadingTask.promise;
  totalPages = pdfDoc.numPages;

  await renderPage(1);
  currentPage = 1;
}


// =========================
// BUTTONS (ONE CLICK = ONE TURN)
// =========================

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (prevBtn) {
  prevBtn.onclick = () => {
    if (!isTurning && currentPage > 1) {
      flipToPage(currentPage - 1);
    }
  };
}

if (nextBtn) {
  nextBtn.onclick = () => {
    if (!isTurning && currentPage < totalPages) {
      flipToPage(currentPage + 1);
    }
  };
}


// =========================
// INIT
// =========================

loadPdf();
