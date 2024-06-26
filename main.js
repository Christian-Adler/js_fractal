const zoomDiv = document.getElementById("zoom");
const translateXDiv = document.getElementById("translateX");
const translateYDiv = document.getElementById("translateY");
const timesDiv = document.getElementById("times");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let zoom = 1; // 100000 // 2000;
let times = 10; // 2000;
let translateX = 0; // 0.233; //0.12
let translateY = 0; // 0.655; // 0.82

const atom = (x, y, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 3, 3);
};

function calcTData(yStart, yEnd, dimX, centerX, centerY) {
  const tData = [];

  // calc t values
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < dimX; x++) {
      const dx = (x - centerX) / zoom - translateX;
      const dy = (y - centerY) / zoom - translateY;

      let a = dx;
      let b = dy;

      let tDat = -1;
      for (let t = 0; t < times; t++) {

        const d = a ** 2 - b ** 2 + dx;
        b = 2 * (a * b) + dy;
        a = d;

        const H = d > 200;

        if (H) {
          tDat = t;
          break;
        }
      }

      tData.push(tDat);
    }
  }
  return tData;
}

function draw() {
  times = Math.max(200, zoom / 100 * 2);
  zoomDiv.innerHTML = zoom;
  translateXDiv.innerHTML = translateX;
  translateYDiv.innerHTML = translateY;
  timesDiv.innerHTML = times;

  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const dimX = canvas.width;
  const dimY = canvas.height;
  const centerX = Math.floor(dimX / 2);
  const centerY = Math.floor(dimY / 2);

  // ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, dimX, dimY);

  const tData = [
    ...calcTData(0, dimY / 4, dimX, centerX, centerY),
    ...calcTData(dimY / 4, dimY, dimX, centerX, centerY)
  ];

  // draw
  for (let i = 0; i < tData.length; i++) {
    const t = tData[i];
    if (t < 0) continue;

    const x = i % dimX;
    const y = Math.floor(i / dimX);

    let r, g, b;
    r = g = b = t;

    // colorize by position
    r = r * ((dimX - x) / dimX); //
    b = b * (x / dimX); //
    g = g * (y / dimY); //

    r *= 3;

    atom(x, y, `rgb(${r},${g},${b})`);
  }
}


draw();

let timer = null;

window.addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(draw, 400);
});

window.addEventListener("click", (evt) => {
  translateX += (window.innerWidth / 2 - evt.x) * (1 / zoom);
  translateY += (window.innerHeight / 2 - evt.y) * (1 / zoom);
  zoom *= 10;
  draw();
});
window.addEventListener("contextmenu", (evt) => {
  if (zoom >= 10) {
    translateX -= (window.innerWidth / 2 - evt.x) * (1 / zoom);
    translateY -= (window.innerHeight / 2 - evt.y) * (1 / zoom);
    zoom /= 10;
    draw();
  }
  evt.preventDefault();
  return false;
});