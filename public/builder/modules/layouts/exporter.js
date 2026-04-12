import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js";

export async function exportAsPdf(canvases, { filename }) {
  if (!canvases || !canvases.length) return;

  const firstCanvas = canvases[0];
  const pdf = new jsPDF({
    orientation: firstCanvas.width > firstCanvas.height ? "l" : "p",
    unit: "pt",
    format: [firstCanvas.width, firstCanvas.height]
  });

  for (let i = 0; i < canvases.length; i++) {
    if (i > 0) {
      pdf.addPage();
    }
    const canvas = canvases[i];
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    pdf.addImage(dataUrl, "JPEG", 0, 0, canvas.width, canvas.height);
  }

  pdf.save(filename || "comic.pdf");
}
