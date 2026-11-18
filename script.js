const fileInput = document.getElementById("videoFile");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const output = document.getElementById("output");
const statusText = document.getElementById("status");
const widthSlider = document.getElementById("width");
const fpsSlider = document.getElementById("fps");
const widthValue = document.getElementById("widthValue");
const fpsValue = document.getElementById("fpsValue");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

// Dari gelap ke terang.
const CHARS = "@%#*+=-:. ";

let videoURL = null;
let animationId = null;
let lastFrameTime = 0;
let stopped = true;

widthSlider.addEventListener("input", () => {
  widthValue.textContent = widthSlider.value;
  if (video.readyState >= 2 && video.paused) renderFrame();
});
fpsSlider.addEventListener("input", () => {
  fpsValue.textContent = `${fpsSlider.value} FPS`;
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (videoURL) URL.revokeObjectURL(videoURL);
  videoURL = URL.createObjectURL(file);
  video.src = videoURL;
  video.load();
  statusText.textContent = "LOADING VIDEO...";
  output.textContent = "LOADING...";
});

video.addEventListener("loadeddata", () => {
  playBtn.disabled = pauseBtn.disabled = stopBtn.disabled = false;
  stopped = true;
  statusText.textContent = "VIDEO READY";
  renderFrame();
});

function renderFrame() {
  if (!video.videoWidth || !video.videoHeight) return;

  const columns = Number(widthSlider.value);
  // Rasio karakter terminal dibuat lebih pendek agar gambar tidak gepeng.
  const rows = Math.max(1, Math.round(columns * video.videoHeight / video.videoWidth * 0.48));
  canvas.width = columns;
  canvas.height = rows;
  ctx.drawImage(video, 0, 0, columns, rows);

  const pixels = ctx.getImageData(0, 0, columns, rows).data;
  let result = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const index = (y * columns + x) * 4;
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const charIndex = Math.min(CHARS.length - 1, Math.floor(brightness * CHARS.length));
      result += CHARS[charIndex];
    }
    result += "\n";
  }
  output.textContent = result;
}

function animate(timestamp) {
  if (video.paused || video.ended) return;
  const interval = 1000 / Number(fpsSlider.value);
  if (timestamp - lastFrameTime >= interval) {
    renderFrame();
    lastFrameTime = timestamp;
  }
  animationId = requestAnimationFrame(animate);
}

playBtn.addEventListener("click", async () => {
  if (!video.src) return;
  if (video.ended) video.currentTime = 0;
  stopped = false;
  statusText.textContent = "PLAYING";
  try {
    await video.play();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animate);
  } catch (error) {
    statusText.textContent = "CANNOT PLAY VIDEO";
  }
});

pauseBtn.addEventListener("click", () => {
  video.pause();
  cancelAnimationFrame(animationId);
  statusText.textContent = "PAUSED";
  renderFrame();
});

stopBtn.addEventListener("click", () => {
  video.pause();
  video.currentTime = 0;
  cancelAnimationFrame(animationId);
  stopped = true;
  statusText.textContent = "STOPPED";
  renderFrame();
});

video.addEventListener("ended", () => {
  cancelAnimationFrame(animationId);
  statusText.textContent = "VIDEO ENDED";
  renderFrame();
});

video.addEventListener("seeked", renderFrame);
