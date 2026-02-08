// =========================
// SOUNDTRACK EMBED
// =========================

const soundtracks = {
  khalid: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187301982&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
};

const scPlayer = document.getElementById("scPlayer");
if (scPlayer) scPlayer.src = soundtracks.khalid;


// =========================
// SIMPLE PDF VIEWER (NO PDF.JS)
// =========================

let fileName = new URLSearchParams(window.location.search).get("id");
if (!fileName) throw new Error("Missing ?id=");
if (!fileName.toLowerCase().endsWith(".pdf")) fileName += ".pdf";

const PDF_URL = `/comic/assets/books/${fileName}`;

const pdfFrame = document.getElementById("pdfFrame");
const flipWrapper = document.getElementById("flipWrapper");

pdfFrame.src = PDF_URL;


// =========================
// PAGE TURN ANIMATION
// =========================

let currentPage = 1;

document.getElementById("nextBtn").onclick = () => {
  flipWrapper.classList.add("turning");

  setTimeout(() => {
    flipWrapper.classList.remove("turning");
  }, 1600);
};

document.getElementById("prevBtn").onclick = () => {
  flipWrapper.classList.add("turning");

  setTimeout(() => {
    flipWrapper.classList.remove("turning");
  }, 1600);
};
