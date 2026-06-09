import { H as Hls } from './hls-vendor-bbsaiqh1.js';

const video = document.querySelector('[data-video]');
const layer = document.querySelector('[data-player-layer]');
const sourceUrl = window.playUri;
let prepared = false;
let hlsInstance = null;

function prepareVideo() {
  if (!video || !sourceUrl || prepared) {
    return;
  }

  prepared = true;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = sourceUrl;
    return;
  }

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(sourceUrl);
    hlsInstance.attachMedia(video);
    const parsedEvent = Hls.Events && Hls.Events.MANIFEST_PARSED ? Hls.Events.MANIFEST_PARSED : 'hlsManifestParsed';
    hlsInstance.on(parsedEvent, function () {
      video.play().catch(function () {});
    });
    return;
  }

  video.src = sourceUrl;
}

function startPlayback() {
  prepareVideo();

  if (layer) {
    layer.classList.add('is-hidden');
  }

  if (video) {
    video.play().catch(function () {});
  }
}

if (layer) {
  layer.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (!prepared) {
      startPlayback();
    }
  });
}

window.addEventListener('pagehide', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});
