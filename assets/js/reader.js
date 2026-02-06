window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  const res = await fetch("books.json");
  const data = await res.json();
  const book = data.books.find(b => b.id === bookId);

  if (!book) {
    alert("Book not found");
    return;
  }

  const canvas = document.getElementById("pageCanvas");
  const ctx = canvas.getContext("2d");

  let pdfBlob = null;
  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;

  // Load PDF as blob
  const pdfResponse = await fetch(book.file);
  pdfBlob = await pdfResponse.blob();

  // Use browser's built-in PDF renderer
  const pdf = await navigator.pdfViewer.createDocument(pdfBlob);
  pdfDoc = pdf;
  totalPages = pdf.numPages;

  async function renderPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);

    // Convert PDF page to bitmap image
    const bitmap = await page.renderToBitmap();

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.drawImage(bitmap, 0, 0);

    document.getElementById("pageInfo").textContent =
      `Page ${pageNum} of ${totalPages}`;
  }

  document.getElementById("nextPage").onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  };

  document.getElementById("prevPage").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  };

  renderPage(currentPage);
});
