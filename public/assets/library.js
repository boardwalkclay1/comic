window.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("bookGrid");
  if (!grid) return;

  try {
    const res = await fetch("books.json");
    const data = await res.json();
    const books = data.books || [];

    grid.innerHTML = "";

    books.forEach((book) => {
      const card = document.createElement("article");
      card.className = "comic-card";

      card.innerHTML = `
        <div class="comic-card__cover ${book.coverClass || ""}"></div>
        <div class="comic-card__meta">
          <h2>${book.title}</h2>
          <p>${book.description || ""}</p>
          <span class="type-tag type-tag--${book.type}">
            ${book.type === "comic" ? "Comic" : "Book"}
          </span>
        </div>
        <a href="reader.html?id=${encodeURIComponent(book.id)}" class="btn btn--small">
          Read
        </a>
      `;

      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Failed to load books.json", e);
    grid.innerHTML = "<p>Could not load your books. Check books.json.</p>";
  }
});
