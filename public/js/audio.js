window.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("audioGrid");
  if (!grid) return;

  try {
    const res = await fetch("books.json");
    const data = await res.json();
    const books = data.books || [];

    grid.innerHTML = "";

    books.forEach((book) => {
      if (!book.audioFile) return;

      const card = document.createElement("article");
      card.className = "audio-card";
      card.innerHTML = `
        <h2>${book.title}</h2>
        <p>${book.description || ""}</p>
        <span class="type-tag type-tag--${book.type}">
          ${book.type === "comic" ? "Comic" : "Book"}
        </span>
        <audio controls src="${book.audioFile}" class="audio-player"></audio>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Failed to load books.json", e);
    grid.innerHTML = "<p>Could not load audio list. Check books.json.</p>";
  }
});
