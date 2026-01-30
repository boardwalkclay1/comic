import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs";

const urlParams = new URLSearchParams(window.location.search);
const initialFile = urlParams.get("file") || null;

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isRendering = false;
let pendingPage = null;

const canvas = document.getElementById("pageCanvas");
const ctx = canvas.getContext("2d");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pdfInput = document.getElementById("pdfInput");

function renderPage(num) {
  isRendering = true;
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport,
    };

    const renderTask = page.render(renderCtx);
    renderTask.promise.then(() => {
      isRendering = false;
      pageInfo.textContent = `Page ${num} / ${totalPages}`;
      if (pendingPage !== null) {
        renderPage(pendingPage);
        pendingPage = null;
      }
    });
  });
}

function queueRenderPage(num) {
  if (isRendering) {
    pendingPage = num;
  } else {
    renderPage(num);
  }
}

function showPrevPage() {
  if (!pdfDoc || currentPage <= 1) return;
  currentPage--;
  queueRenderPage(currentPage);
  animateTurn("left");
}

function showNextPage() {
  if (!pdfDoc || currentPage >= totalPages) return;
  currentPage++;
  queueRenderPage(currentPage);
  animateTurn("right");
}

function animateTurn(direction) {
  const frame = document.querySelector(".book-frame");
  frame.classList.remove("turn-left", "turn-right");
  void frame.offsetWidth; // force reflow
  frame.classList.add(direction === "left" ? "turn-left" : "turn-right");
  setTimeout(() => {
    frame.classList.remove("turn-left", "turn-right");
  }, 350);
}

function loadPdfFromUrl(url) {
  pdfjsLib
    .getDocument(url)
    .promise.then((doc) => {
      pdfDoc = doc;
      totalPages = doc.numPages;
      currentPage = 1;
      queueRenderPage(currentPage);
    })
    .catch((err) => {
      console.error("PDF load error:", err);
      alert("Could not load PDF.");
    });
}

function loadPdfFromFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const typedarray = new Uint8Array(e.target.result);
    pdfjsLib
      .getDocument(typedarray)
      .promise.then((doc) => {
        pdfDoc = doc;
        totalPages = doc.numPages;
        currentPage = 1;
        queueRenderPage(currentPage);
      })
      .catch((err) => {
        console.error("PDF load error:", err);
        alert("Could not load PDF.");
      });
  };
  reader.readAsArrayBuffer(file);
}

window.addEventListener("DOMContentLoaded", () => {
  prevBtn.addEventListener("click", showPrevPage);
  nextBtn.addEventListener("click", showNextPage);

  pdfInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) loadPdfFromFile(file);
  });

  if (initialFile) {
    loadPdfFromUrl(initialFile);
  }
});
