const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const zoom = 100000; // 2000;
const times = 2000;
const scaleX = 0.233; //0.12
const scaleY = 0.655; // 0.82

const atom = (x, y, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 3, 3);
};

function draw() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  const dimX = canvas.width;
  const dimY = canvas.height;
  const centerX = dimX / 2;
  const centerY = dimY / 2;

  for (let y = 0; y < dimY; y++) {
    for (let x = 0; x < dimX; x++) {
      const dx = (x - centerX) / zoom - scaleX;
      const dy = (y - centerY) / zoom - scaleY;

      let a = dx;
      let b = dy;

      for (let t = 0; t < times; t++) {

        const d = a ** 2 - b ** 2 + dx;
        b = 2 * (a * b) + dy;
        a = d;

        const H = d > 200;

        if (H) {
          let r = t * 3 * ((dimX - x) / dimX);
          let g = t * 1.5 * (y / dimY);
          let b = t * 2.5 * (x / dimX);
          atom(x, y, `rgb(${r},${g},${b})`);
          break;
        }
      }
    }
  }
}


draw();

let timer = null;

window.addEventListener("resize", () => {
  clearTimeout(timer);
  timer = setTimeout(draw, 400);
});