if (window.Worker) {
  const numWorkers = 8;

  const zoomDiv = document.getElementById("zoom");
  const translateXDiv = document.getElementById("translateX");
  const translateYDiv = document.getElementById("translateY");
  const timesDiv = document.getElementById("times");
  const inProgressDiv = document.getElementById("inProgress");
  const durationCalcDiv = document.getElementById("durationCalc");
  const durationDrawDiv = document.getElementById("durationDraw");

  const workers = [];
  let workerAnswersReceived = 0;
  let inProgress = false;
  let reCalc = false;
  let startCalc = 0;

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker("worker.js");
    const w = {num: i, tData: [], worker};
    worker.onmessage = function (e) {
      // console.log('Message received from worker: ' + e.data);
      w.tData = JSON.parse(e.data);
      workerAnswersReceived++;
      if (workerAnswersReceived === numWorkers) {
        durationCalcDiv.innerHTML = '' + (new Date().getTime() - startCalc);
        drawTData();
        if (reCalc) {
          reCalc = false;
          calcTData();
        }
      }
    }
    workers.push(w);
  }

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let zoom = 1;
  let times = 10;
  let translateX = 0;
  let translateY = 0;

  function calcTData() {
    if (inProgress) return;
    inProgress = true;
    inProgressDiv.innerHTML = `${inProgress}`;
    workerAnswersReceived = 0;
    startCalc = new Date().getTime();

    times = Math.min(20000, Math.max(200, zoom / 100 * 2));
    zoomDiv.innerHTML = zoom;
    translateXDiv.innerHTML = translateX;
    translateYDiv.innerHTML = translateY;
    timesDiv.innerHTML = times;

    if (canvas.height !== window.innerHeight)
      canvas.height = window.innerHeight;
    if (canvas.width !== window.innerWidth)
      canvas.width = window.innerWidth;

    const dimX = canvas.width;
    const dimY = canvas.height;
    const centerX = Math.floor(dimX / 2);
    const centerY = Math.floor(dimY / 2);

    const yRange = Math.ceil(dimY / numWorkers);
    for (let i = 0; i < numWorkers; i++) {
      const workersItem = workers[i];
      workersItem.worker.postMessage(JSON.stringify({
            yStart: i * yRange,
            yEnd: (i + 1) * yRange,
            dimX, centerX, centerY, translateX, translateY, zoom, times
          })
      );
    }
  }

  function drawTData() {
    const t1 = new Date().getTime();
    const dimX = canvas.width;
    const dimY = canvas.height;

    let tData = [];
    for (const workersItem of workers) {
      tData = [...tData, ...workersItem.tData];
    }

    if (canvas.height !== window.innerHeight || canvas.width !== window.innerWidth) {
      console.log('Data not matching to size...');
      inProgress = false;
      inProgressDiv.innerHTML = `${inProgress}`;
      calcTData();
      return;
    }

    // draw

    const data = ctx.createImageData(dimX, dimY);
    const buf = new Uint32Array(data.data.buffer);

    function drawIntoBuffer(i, colorValue) {
      const idxs = [i, i - dimX, i + dimX];
      for (const idx of idxs) {
        if (idx >= 0 && idx < tData.length) {
          buf[idx] = colorValue;

          if (idx > 0)
            buf[idx - 1] = colorValue;
          if (idx < tData.length - 1)
            buf[idx + 1] = colorValue;
        }
      }
    }

    for (let i = 0; i < tData.length; i++) {
      const t = tData[i];
      if (t < 0) {
        buf[i] = 0xFFFFFFFF;
        continue;
      }

      const x = i % dimX;
      const y = Math.floor(i / dimX);

      let r, g, b;
      r = g = b = t;

      // colorize by position
      r = r * ((dimX - x) / dimX); //
      b = b * (x / dimX); //
      g = g * (y / dimY); //

      r *= 3;

      // buf[i] = 0xa00000F0;
      const colorValue = (255 << 24) |    // alpha
          (b << 16) |    // blue
          (g << 8) |    // green
          r; // red
      drawIntoBuffer(i, colorValue);
    }


    ctx.putImageData(data, 0, 0);

    const t2 = new Date().getTime();
    durationDrawDiv.innerHTML = '' + (t2 - t1);
    inProgress = false;
    inProgressDiv.innerHTML = `${inProgress}`;
  }

  calcTData();

  let timer = null;

  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      reCalc = true;
      calcTData();
    }, 400);
  });

  window.addEventListener("click", (evt) => {
    if (inProgress) return;
    translateX += (window.innerWidth / 2 - evt.x) * (1 / zoom);
    translateY += (window.innerHeight / 2 - evt.y) * (1 / zoom);
    zoom *= 10;
    calcTData();
  });
  window.addEventListener("contextmenu", (evt) => {
    if (zoom >= 10 && !inProgress) {
      translateX -= (window.innerWidth / 2 - evt.x) * (1 / zoom);
      translateY -= (window.innerHeight / 2 - evt.y) * (1 / zoom);
      zoom /= 10;
      calcTData();
    }
    evt.preventDefault();
    return false;
  });

} else {
  console.log('Your browser doesn\'t support web workers.');
}
