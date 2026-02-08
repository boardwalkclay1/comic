document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // SOUNDTRACK EMBED (STATIC)
  // =========================

  const scPlayer = document.getElementById("scPlayer");
  // already has src in HTML, so nothing else needed



  // =========================
  // PDF.js SETUP
  // =========================

  // Point worker to same CDN version
  if (window['pdfjsLib']) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  } else {
    console.error("pdfjsLib not found");
    return;
  }

  // Get book id from URL: ?id=gold-lake-1
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

  let showingA = true;



  // =========================
  // RENDER A PDF PAGE INTO A CANVAS
  // =========================

  async function renderPageToCanvas(pageNum, canvas, ctx) {
    if (!pdfDoc) return false;

    try {
      const page = await pdfDoc.getPage(pageNum);

      // Fit page into viewport based on height
      const viewport = page.getViewport({ scale: 1.5 });

      // Resize canvas
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      return true;
    } catch (e) {
      console.error("Error rendering page", pageNum, e);
      return false;
    }
  }



  // =========================
  // PAGE TURN LOGIC
  // =========================

  async function turnTo(pageNum) {
    if (isTurning) return;
    if (!pdfDoc) return;
    if (pageNum < 1 || pageNum > pdfDoc.numPages) return;

    isTurning = true;

    const front = showingA ? pageA : pageB;
    const back = showingA ? pageB : pageA;
    const backCtx = showingA ? ctxB : ctxA;

    const ok = await renderPageToCanvas(pageNum, back, backCtx);
    if (!ok) {
      isTurning = false;
      return;
    }

    // Stack order: back becomes visible after flip
    front.style.zIndex = 1;
    back.style.zIndex = 2;

    // Trigger dramatic flip
    flipWrapper.classList.add("turning");

    setTimeout(() => {
      flipWrapper.classList.remove("turning");
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

    // Render first page into pageA
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
