window.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("bookGrid");
  if (!grid) return;

  try {
    // Cloudflare Pages root path
    const res = await fetch("/books.json", { cache: "no-store" });
    const data = await res.json();
    const books = data.books || [];

    grid.innerHTML = "";

    books.forEach((book) => {
      // Normalize ID so reader ALWAYS gets correct format
      const cleanId = book.id
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, ""); // remove spaces, underscores, etc.

      const card = document.createElement("a");
      card.className = "comic-card";
      card.href = `/reader?id=${encodeURIComponent(cleanId)}`;

      card.innerHTML = `
        <div class="comic-card__cover ${book.coverClass || ""}"></div>
        <div class="comic-card__meta">
          <h3>${book.title}</h3>
          <p>${book.description || ""}</p>
          <span class="type-tag type-tag--${book.type}">
            ${book.type === "comic" ? "Comic" : "Book"}
          </span>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    console.error("books.json failed to load", err);
    grid.innerHTML = `<p class="error">Could not load your books. Check books.json.</p>`;
  }
});
