window.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  let id = params.get("id");

  if (!id) {
    document.body.innerHTML = "<p style='color:red;padding:40px;'>Missing ?id=</p>";
    return;
  }

  try {
    const res = await fetch("/films.json", { cache: "no-store" });
    const data = await res.json();
    const films = data.films || [];

    const film = films.find(f => f.id === id);

    if (!film) {
      document.body.innerHTML = "<p style='color:red;padding:40px;'>Film not found</p>";
      return;
    }

    document.getElementById("filmTitle").textContent = film.title;
    document.getElementById("filmSource").src = `/assets/${film.video}`;
    document.getElementById("filmPlayer").load();

  } catch (err) {
    document.body.innerHTML = "<p style='color:red;padding:40px;'>Error loading film</p>";
  }
});
