document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // COMIC → PDF FILES
  // =========================
  const COMICS = {
    "gold-lake": [
      "gold-lake-1.pdf",
      "gold-lake-2.pdf"
    ],
    "new-civil-war": [
      "new-civil-war-1.pdf",
      "new-civil-war-2.pdf",
      "new-civil-war-3.pdf"
    ]
  };

  // =========================
  // ERROR DISPLAY
  // =========================
  function showError(msg) {
    document.body.innerHTML = `
      <div style="padding:40px; font-size:20px; color:red;">
        ${msg}
      </div>
    `;
  }

  // =========================
  // GET COMIC ID FROM URL
  // =========================
  let comicID = new URLSearchParams(window.location.search).get("id");

  if (!comicID) {
    return showError("Missing ?id= in URL");
  }

  // normalize ID: trim, lowercase, strip trailing -number
  comicID = comicID
    .trim()
    .toLowerCase()
    .replace(/-\d+$/, ""); // gold-lake-2 → gold-lake

  if (!COMICS[comicID]) {
    return showError("Unknown comic id: " + comicID);
  }

  const pdfFiles = COMICS[comicID];

  // =========================
  // PDF.js SETUP
  // =========================
  if (!window.pdfjsLib) {
    return showError("PDF.js library not found");
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  // =========================
  // STATE
  // =========================
  let pdfDocs = [];
  let pageMap = [];
  let totalPages = 0;

  let currentPage = 1;
  let isTurning = false;
  let showingA = true;

  // =========================
  // ELEMENTS
  // =========================
  const flipWrapper = document.getElementById("flipWrapper");

  const pageA = document.getElementById("pageA");
  const pageB = document.getElementById("pageB");
  const ctxA = pageA.getContext("2d");
  const ctxB = pageB.getContext("2d");

  const turnLayers = [
    document.getElementById("turn1"),
    document.getElementById("turn2"),
    document.getElementById("turn3")
  ];
  const turnCtxs = turnLayers.map(c => c.getContext("2d"));

  // =========================
  // LOAD ALL PDFs  (/assets/*.pdf)
  // =========================
  async function loadAllPDFs() {
    for (let i = 0; i < pdfFiles.length; i++) {
      const url = `/assets/${pdfFiles[i]}`;
      const pdf = await pdfjsLib.getDocument(url).promise;
      pdfDocs.push(pdf);

      for (let p = 1; p <= pdf.numPages; p++) {
        pageMap.push({ pdfIndex: i, page: p });
      }
    }
    totalPages = pageMap.length;
  }

  // =========================
  // RENDER PAGE
  // =========================
  async function renderPage(globalPageNum, canvas, ctx) {
    if (globalPageNum < 1 || globalPageNum > totalPages) return false;

    const info = pageMap[globalPageNum - 1];
    const pdf = pdfDocs[info.pdfIndex];
    const page = await pdf.getPage(info.page);

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    return true;
  }

  // =========================
  // PAGE TURN
  // =========================
  async function turnTo(globalPageNum) {
    if (isTurning) return;
    if (globalPageNum < 1 || globalPageNum > totalPages) return;

    isTurning = true;

    const front = showingA ? pageA : pageB;
    const back = showingA ? pageB : pageA;
    const backCtx = showingA ? ctxB : ctxA;

    await renderPage(globalPageNum, back, backCtx);

    for (let i = 0; i < turnLayers.length; i++) {
      await renderPage(globalPageNum, turnLayers[i], turnCtxs[i]);
    }

    front.style.zIndex = 1;
    back.style.zIndex = 2;

    flipWrapper.classList.add("turning");

    turnLayers.forEach((layer, i) => {
      layer.classList.remove("active");
      void layer.offsetWidth;
      setTimeout(() => layer.classList.add("active"), i * 120);
    });

    setTimeout(() => {
      flipWrapper.classList.remove("turning");
      turnLayers.forEach(layer => layer.classList.remove("active"));
      showingA = !showingA;
      currentPage = globalPageNum;
      isTurning = false;
    }, 1500);
  }

  // =========================
  // INIT
  // =========================
  loadAllPDFs()
    .then(async () => {
      await renderPage(1, pageA, ctxA);
      pageA.style.zIndex = 2;
      pageB.style.zIndex = 1;
    })
    .catch(err => {
      showError("Error loading PDFs: " + err.message);
    });

  // =========================
  // BUTTONS
  // =========================
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (currentPage < totalPages) turnTo(currentPage + 1);
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 1) turnTo(currentPage - 1);
    };
  }
});
