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

// ONE CANVAS ONLY — future‑proof
const flipWrapper = document.getElementById("flipWrapper");
const canvas = document.getElementById("pageA");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isTurning = false;

// Dramatic slow turn duration
const TURN_TIME = 1600;


// =========================
// RENDER PAGE
// =========================

async function renderPage(pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 3.0 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: ctx, viewport }).promise;

  flipWrapper.style.width = canvas.width + "px";
  flipWrapper.style.height = canvas.height + "px";
}


// =========================
// DRAMATIC PAGE TURN
// =========================

async function flipToPage(num) {
  if (isTurning) return;
  if (num < 1 || num > totalPages) return;

  isTurning = true;

  // Start dramatic animation
  canvas.classList.add("turning");

  // Render new page while animation plays
  await renderPage(num);

  setTimeout(() => {
    canvas.classList.remove("turning");
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
// BUTTONS — ONE CLICK WORKS
// =========================

document.getElementById("prevBtn").onclick = () => {
  if (!isTurning && currentPage > 1) flipToPage(currentPage - 1);
};

document.getElementById("nextBtn").onclick = () => {
  if (!isTurning && currentPage < totalPages) flipToPage(currentPage + 1);
};


// =========================
// INIT
// =========================

loadPdf();
