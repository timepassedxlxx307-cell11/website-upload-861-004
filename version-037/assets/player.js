const Hls = window.Hls;

const players = document.querySelectorAll('[data-player]');

players.forEach((wrap) => {
  const video = wrap.querySelector('video');
  const button = wrap.querySelector('[data-play-button]');
  const status = wrap.querySelector('[data-player-status]');

  const setStatus = (text) => {
    if (status) {
      status.textContent = text || '';
    }
  };

  const start = async () => {
    if (!video) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    if (!stream) {
      setStatus('播放暂时不可用');
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }

    video.controls = true;

    if (!video.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
      video.dataset.ready = '1';
    }

    try {
      await video.play();
      setStatus('');
    } catch (error) {
      setStatus('点击视频继续播放');
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('error', () => {
      setStatus('播放暂时不可用，请稍后重试');
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }
});
