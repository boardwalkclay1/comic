document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // SOUNDTRACK (STATIC)
  // =========================
  const scPlayer = document.getElementById("scPlayer");



  // =========================
  // PDF.js SETUP
  // =========================
  if (!window['pdfjsLib']) {
    console.error("pdfjsLib not found");
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  let fileName = new URLSearchParams(window.location.search).get("id");
  if (!fileName) throw new Error("Missing ?id=");

  const PDF_URL = `/comic/assets/books/${fileName}.pdf`;

  let pdfDoc = null;
  let currentPage = 1;
  let isTurning = false;

  const flipWrapper = document.getElementById("flipWrapper");

  const pageA = document.getElementById("pageA");
  const pageB = document.getElementById("pageB");
  const ctxA = pageA.getContext("2d");
  const ctxB = pageB.getContext("2d");

  // 3 peel layers
  const turnLayers = [
    document.getElementById("turn1"),
    document.getElementById("turn2"),
    document.getElementById("turn3")
  ];
  const turnCtxs = turnLayers.map(c => c.getContext("2d"));

  let showingA = true;



  // =========================
  // RENDER PDF PAGE INTO CANVAS
  // =========================
  async function renderPageToCanvas(pageNum, canvas, ctx) {
    if (!pdfDoc) return false;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      return true;
    } catch (e) {
      console.error("Error rendering page", pageNum, e);
      return false;
    }
  }



  // =========================
  // PAGE TURN WITH 3 PEEL LAYERS
  // =========================
  async function turnTo(pageNum) {
    if (isTurning) return;
    if (!pdfDoc) return;
    if (pageNum < 1 || pageNum > pdfDoc.numPages) return;

    isTurning = true;

    const front = showingA ? pageA : pageB;
    const back = showingA ? pageB : pageA;
    const backCtx = showingA ? ctxB : ctxA;

    // Render next page into back canvas
    const ok = await renderPageToCanvas(pageNum, back, backCtx);
    if (!ok) {
      isTurning = false;
      return;
    }

    // Render next page into peel layers
    for (let i = 0; i < turnLayers.length; i++) {
      await renderPageToCanvas(pageNum, turnLayers[i], turnCtxs[i]);
    }

    // Stack order
    front.style.zIndex = 1;
    back.style.zIndex = 2;

    // Trigger wrapper tilt
    flipWrapper.classList.add("turning");

    // Trigger peel layers with stagger
    turnLayers.forEach((layer, i) => {
      layer.classList.remove("active");
      void layer.offsetWidth; // force reflow
      setTimeout(() => {
        layer.classList.add("active");
      }, i * 120);
    });

    // End turn
    setTimeout(() => {
      flipWrapper.classList.remove("turning");
      turnLayers.forEach(layer => layer.classList.remove("active"));
      showingA = !showingA;
      currentPage = pageNum;
      isTurning = false;
    }, 1500);
  }



  // =========================
  // INITIALIZE PDF + FIRST PAGE
  // =========================
  pdfjsLib.getDocument(PDF_URL).promise.then(async (pdf) => {
    pdfDoc = pdf;

    await renderPageToCanvas(1, pageA, ctxA);
    pageA.style.zIndex = 2;
    pageB.style.zIndex = 1;
  }).catch(err => {
    console.error("Error loading PDF:", err);
  });



  // =========================
  // BUTTON HANDLERS
  // =========================
  document.getElementById("nextBtn").onclick = () => {
    if (!pdfDoc) return;
    if (currentPage >= pdfDoc.numPages) return;
    turnTo(currentPage + 1);
  };

  document.getElementById("prevBtn").onclick = () => {
    if (!pdfDoc) return;
    if (currentPage <= 1) return;
    turnTo(currentPage - 1);
  };

});
