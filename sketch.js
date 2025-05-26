let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = ""; // 儲存手勢結果

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 FaceMesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, handposeReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture(); // 偵測手勢
  });
}

function modelReady() {
  console.log("FaceMesh 模型載入完成");
}

function handposeReady() {
  console.log("Handpose 模型載入完成");
}

// 偵測手勢並設定 gesture
function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單的手勢判斷邏輯 (剪刀、石頭、布)
    const thumbTip = landmarks[4]; // 大拇指指尖
    const indexTip = landmarks[8]; // 食指指尖
    const middleTip = landmarks[12]; // 中指指尖

    const thumbIndexDist = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    const indexMiddleDist = dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]);

    if (thumbIndexDist < 30 && indexMiddleDist < 30) {
      gesture = "石頭"; // Fist
    } else if (thumbIndexDist > 50 && indexMiddleDist > 50) {
      gesture = "布"; // Open hand
    } else {
      gesture = "剪刀"; // Scissors
    }
  }
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let x, y;

    // 根據手勢移動圓圈位置
    if (gesture === "石頭") {
      // 額頭 (第10點)
      [x, y] = keypoints[10];
    } else if (gesture === "剪刀") {
      // 左右眼睛 (第33點和第263點的中間)
      const leftEye = keypoints[33];
      const rightEye = keypoints[263];
      x = (leftEye[0] + rightEye[0]) / 2;
      y = (leftEye[1] + rightEye[1]) / 2;
    } else if (gesture === "布") {
      // 左右臉頰 (第234點和第454點的中間)
      const leftCheek = keypoints[234];
      const rightCheek = keypoints[454];
      x = (leftCheek[0] + rightCheek[0]) / 2;
      y = (leftCheek[1] + rightCheek[1]) / 2;
    } else {
      // 預設為鼻子 (第94點)
      [x, y] = keypoints[94];
    }

    // 繪製圓圈
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }

  // 顯示手勢
  fill(255);
  noStroke();
  textSize(24);
  text(`手勢: ${gesture}`, 10, height - 20);
}
