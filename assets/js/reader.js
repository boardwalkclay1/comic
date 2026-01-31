import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs";

const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get("id") || null;

// PDF state
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isRendering = false;
let pendingPage = null;

// DOM
const canvas = document.getElementById("pageCanvas");
const ctx = canvas.getContext("2d");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const bookTitleEl = document.getElementById("bookTitle");
const bookDescEl = document.getElementById("bookDescription");
const bookTypeTag = document.getElementById("bookTypeTag");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const bookFrame = document.getElementById("bookFrame");

// Read‑aloud DOM
const raPanel = document.getElementById("readAloudPanel");
const raPlay = document.getElementById("raPlay");
const raPause = document.getElementById("raPause");
const raStop = document.getElementById("raStop");
const raVoiceSelect = document.getElementById("raVoiceSelect");
const raRate = document.getElementById("raRate");
const raStatus = document.getElementById("readAloudStatus");
const raHint = document.getElementById("readAloudHint");

// Music DOM
const ytPlaylist = document.getElementById("ytPlaylist");
const ytSearchInput = document.getElementById("ytSearchInput");
const ytSearchBtn = document.getElementById("ytSearchBtn");
const ytSearchFrame = document.getElementById("ytSearchFrame");

// Config
let booksConfig = null;
let currentBook = null;

// Read‑aloud state
let speechSupported = "speechSynthesis" in window;
let voices = [];
let currentUtterance = null;
let currentText = "";
let isSpeaking = false;

// ---------- MUSIC ----------

function setPlaylist(playlistId, fallbackId) {
  const id = playlistId || fallbackId;
  if (!ytPlaylist || !id) return;
  ytPlaylist.src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(id)}`;
}

function setupYouTubeSearch() {
  if (!ytSearchBtn || !ytSearchInput || !ytSearchFrame) return;
  ytSearchBtn.addEventListener("click", () => {
    const q = ytSearchInput.value.trim();
    if (!q) return;
    const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
    ytSearchFrame.src = url;
  });
}

// ---------- READ‑ALOUD ----------

function loadVoices() {
  if (!speechSupported) return;
  voices = window.speechSynthesis.getVoices();
  raVoiceSelect.innerHTML = "";

  // pick 3 voices if possible
  const pick = voices.slice(0, 3);
  pick.forEach((v, idx) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `Voice ${idx + 1}: ${v.name}`;
    raVoiceSelect.appendChild(opt);
  });

  if (!pick.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No voices available";
    raVoiceSelect.appendChild(opt);
  }
}

function speakText(text) {
  if (!speechSupported || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const selectedName = raVoiceSelect.value;
  const voice = voices.find((v) => v.name === selectedName);
  if (voice) utter.voice = voice;
  utter.rate = parseFloat(raRate.value || "1");

  utter.onstart = () => {
    isSpeaking = true;
    raStatus.textContent = "Reading aloud…";
  };
  utter.onend = () => {
    isSpeaking = false;
    raStatus.textContent = "Finished.";
  };
  utter.onerror = () => {
    isSpeaking = false;
    raStatus.textContent = "Error during read‑aloud.";
  };

  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

function pauseSpeech() {
  if (!speechSupported) return;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    raStatus.textContent = "Paused.";
  }
}

function resumeSpeech() {
  if (!speechSupported) return;
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    raStatus.textContent = "Reading aloud…";
  } else if (!window.speechSynthesis.speaking && currentText) {
    speakText(currentText);
  }
}

function stopSpeech() {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  isSpeaking = false;
  raStatus.textContent = "Stopped.";
}

// ---------- PDF RENDERING ----------

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
      // For read‑aloud, we’ll extract text from the whole doc
      if (currentBook && currentBook.type === "book" && currentBook.readAloud) {
        extractTextFromPdf(doc);
      }
    })
    .catch((err) => {
      console.error("PDF load error:", err);
      alert("Could not load PDF.");
    });
}

// ---------- PDF TEXT EXTRACTION FOR READ‑ALOUD ----------

async function extractTextFromPdf(doc) {
  try {
    let fullText = "";
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += strings.join(" ") + "\n\n";
    }
    currentText = fullText;
    raStatus.textContent = "Ready to read aloud.";
  } catch (e) {
    console.error("Failed to extract text:", e);
    raStatus.textContent = "Could not prepare read‑aloud for this book.";
  }
}

// ---------- META + CONFIG ----------

function setBookMeta(book) {
  bookTitleEl.textContent = book.title;
  bookDescEl.textContent = book.description || "";
  bookTypeTag.textContent = book.type === "comic" ? "Comic" : "Book";
  bookTypeTag.className = `type-tag type-tag--${book.type}`;

  loadingText.textContent =
    book.type === "comic" ? "Comic pages loading…" : "Book pages loading…";

  bookFrame.classList.toggle("book-frame--comic", book.type === "comic");
  bookFrame.classList.toggle("book-frame--book", book.type === "book");

  // Read‑aloud visibility
  if (book.type === "book" && book.readAloud && speechSupported) {
    raPanel.style.display = "block";
    raHint.textContent =
      "This chapter book supports automatic read‑aloud. Choose a voice and press Play.";
  } else if (book.type === "book" && !speechSupported) {
    raPanel.style.display = "block";
    raHint.textContent =
      "Read‑aloud is not supported in this browser. Try a modern browser with speech support.";
  } else {
    raPanel.style.display = "none";
  }
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
    setPlaylist(currentBook.playlistId, booksConfig.defaultPlaylistId);
  } catch (e) {
    console.error("Failed to load books.json", e);
  }
}

// ---------- INIT ----------

window.addEventListener("DOMContentLoaded", () => {
  prevBtn.addEventListener("click", showPrevPage);
  nextBtn.addEventListener("click", showNextPage);

  // Read‑aloud controls
  if (speechSupported) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    raPlay.addEventListener("click", () => {
      if (!currentText) {
        raStatus.textContent = "Preparing text… try again in a moment.";
        return;
      }
      resumeSpeech();
    });

    raPause.addEventListener("click", pauseSpeech);
    raStop.addEventListener("click", stopSpeech);

    raRate.addEventListener("input", () => {
      if (isSpeaking && currentText) {
        stopSpeech();
        speakText(currentText);
      }
    });
  } else {
    raPanel.style.display = "none";
  }

  setupYouTubeSearch();
  loadConfigAndBook();
});
