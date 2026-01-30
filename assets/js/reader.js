import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs";

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id") || null;

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
const ytPlayer = document.getElementById("ytPlayer");
const bookTitleEl = document.getElementById("bookTitle");
const bookDescEl = document.getElementById("bookDescription");
const bookTypeTag = document.getElementById("bookTypeTag");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const bookFrame = document.getElementById("bookFrame");

let booksConfig = null;
let currentBook = null;

function setPlaylist(playlistId) {
  if (!ytPlayer || !playlistId) return;
  ytPlayer.src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
    playlistId
  )}`;
}

function setBookMeta(book) {
  bookTitleEl.textContent = book.title;
  bookDescEl.textContent = book.description || "";
  bookTypeTag.textContent = book.type === "comic" ? "Comic" : "Book";
  bookTypeTag.className = `type-tag type-tag--${book.type}`;

  // Loading screen flavor
  loadingText.textContent =
    book.type === "comic" ? "Comic pages loading…" : "Book pages loading…";
  bookFrame.classList.toggle("book-frame--comic", book.type === "comic");
  bookFrame.classList.toggle("book-frame--book", book.type === "book");
}

function hideLoading() {
  if (loadingOverlay) loadingOverlay.style.display = "none";
}

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
      hideLoading();
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
  bookFrame.classList.remove("turn-left", "turn-right");
  void bookFrame.offsetWidth;
  bookFrame.classList.add(direction === "left" ? "turn-left" : "turn-right");
  setTimeout(() => {
    bookFrame.classList.remove("turn-left", "turn-right");
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

async function loadConfigAndBook() {
  try {
    const res = await fetch("books.json");
    booksConfig = await res.json();
    const books = booksConfig.books || [];

    if (bookId) {
      currentBook = books.find((b) => b.id === bookId);
    }

    if (!currentBook) {
      bookTitleEl.textContent = "Book not found";
      return;
    }

    setBookMeta(currentBook);
    loadPdfFromUrl(currentBook.file);
    setPlaylist(currentBook.playlistId || booksConfig.defaultPlaylistId);
  } catch (e) {
    console.error("Failed to load books.json", e);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  prevBtn.addEventListener("click", showPrevPage);
  nextBtn.addEventListener("click", showNextPage);
  loadConfigAndBook();
});
