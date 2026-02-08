// =========================
// SOUNDTRACK EMBED
// =========================

const soundtracks = {
  khalid: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2187301982&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
};

const scPlayer = document.getElementById("scPlayer");
if (scPlayer) scPlayer.src = soundtracks.khalid;


// =========================
// IMAGE-BASED COMIC READER
// =========================

let book = new URLSearchParams(window.location.search).get("id");
if (!book) throw new Error("Missing ?id=");

let currentPage = 1;
let isTurning = false;

const flipWrapper = document.getElementById("flipWrapper");
const pageA = document.getElementById("pageA");
const pageB = document.getElementById("pageB");

const ctxA = pageA.getContext("2d");
const ctxB = pageB.getContext("2d");

let showingA = true;


// LOAD IMAGE INTO CANVAS
function loadImage(pageNum, canvas, ctx) {
  return new Promise(resolve => {
    const img = new Image();
    img.src = `/comic/assets/books/${book}/${pageNum}.jpg`;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(true);
    };

    img.onerror = () => resolve(false);
  });
}


// PAGE TURN
async function turnTo(pageNum) {
  if (isTurning) return;
  if (pageNum < 1) return;

  isTurning = true;

  const front = showingA ? pageA : pageB;
  const back = showingA ? pageB : pageA;
  const backCtx = showingA ? ctxB : ctxA;

  const exists = await loadImage(pageNum, back, backCtx);
  if (!exists) {
    isTurning = false;
    return;
  }

  // Bring back canvas to front
  front.style.zIndex = 1;
  back.style.zIndex = 2;

  // Trigger animation
  flipWrapper.classList.add("turning");

  setTimeout(() => {
    flipWrapper.classList.remove("turning");
    showingA = !showingA;
    currentPage = pageNum;
    isTurning = false;
  }, 1500);
}


// LOAD FIRST PAGE
loadImage(1, pageA, ctxA);


// BUTTONS
document.getElementById("nextBtn").onclick = () => turnTo(currentPage + 1);
document.getElementById("prevBtn").onclick = () => turnTo(currentPage - 1);
