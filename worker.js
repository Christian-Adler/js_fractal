function calcTData({yStart, yEnd, dimX, centerX, centerY, translateX, translateY, zoom, times}) {
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

onmessage = function (e) {
  // console.log('Worker: Message received from main script');
  const data = e.data;
  const tData = calcTData(JSON.parse(data));
  postMessage(JSON.stringify(tData));
}