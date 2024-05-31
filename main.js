const ctx = document.getElementById("canvas").getContext("2d");

const atom = (x, y, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 3, 3);
};

const dim = 1000;
const centerX = dim / 2;
const centerY = dim / 2;

const zoom = 100000; // 2000;
const times = 2000;
const scaleX = 0.233; //0.12
const scaleY = 0.655; // 0.82

for (let y = 0; y < dim; y++) {
  for (let x = 0; x < dim; x++) {
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
        let r = t * 3 * ((dim - x) / dim);
        let g = t * 1.5 * (y / dim);
        let b = t * 2.5 * (x / dim);
        atom(x, y, `rgb(${r},${g},${b})`);
        break;
      }
    }
  }
}
