window.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("filmGrid");
  if (!grid) return;

  try {
    const res = await fetch("/films.json", { cache: "no-store" });
    const data = await res.json();
    const films = data.films || [];

    grid.innerHTML = "";

    films.forEach((film) => {
      const card = document.createElement("a");
      card.className = "comic-card";
      card.href = `watch-film.html?id=${encodeURIComponent(film.id)}`;

      card.innerHTML = `
        <div class="comic-card__cover ${film.coverClass || ""}"></div>
        <div class="comic-card__meta">
          <h3>${film.title}</h3>
          <p>${film.description || ""}</p>
          <span class="type-tag type-tag--film">Film</span>
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<p class="error">Could not load films.json</p>`;
  }
});
