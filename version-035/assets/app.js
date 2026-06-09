const SELECTORS = {
  hero: '[data-hero]',
  heroSlide: '[data-hero-slide]',
  filterPanel: '[data-filter-panel]',
  player: '[data-player]',
  mobileButton: '[data-mobile-menu]',
  mobileNav: '[data-mobile-nav]',
  backTop: '[data-back-top]'
};

function setupMobileNavigation() {
  const button = document.querySelector(SELECTORS.mobileButton);
  const nav = document.querySelector(SELECTORS.mobileNav);

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector(SELECTORS.hero);

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll(SELECTORS.heroSlide));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const previous = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
  let timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function schedule() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5500);
  }

  previous?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    schedule();
  });

  next?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    schedule();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      schedule();
    });
  });

  schedule();
}

function getCardSearchText(card) {
  const values = [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genre,
    card.dataset.category,
    card.textContent
  ];

  return values.filter(Boolean).join(' ').toLowerCase();
}

function setupFilters() {
  const panels = document.querySelectorAll(SELECTORS.filterPanel);

  panels.forEach((panel) => {
    const list = panel.parentElement?.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-movie-id]'));
    const search = panel.querySelector('.movie-search');
    const year = panel.querySelector('.year-filter');
    const region = panel.querySelector('.region-filter');
    const type = panel.querySelector('.type-filter');
    const count = panel.querySelector('[data-filter-count]');
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get('q') || '';

    if (search && queryValue) {
      search.value = queryValue;
    }

    function applyFilter() {
      const keyword = (search?.value || '').trim().toLowerCase();
      const yearValue = year?.value || '';
      const regionValue = region?.value || '';
      const typeValue = type?.value || '';
      let visibleCount = 0;

      cards.forEach((card) => {
        const matchesKeyword = !keyword || getCardSearchText(card).includes(keyword);
        const matchesYear = !yearValue || card.dataset.year === yearValue;
        const matchesRegion = !regionValue || card.dataset.region === regionValue;
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const visible = matchesKeyword && matchesYear && matchesRegion && matchesType;

        card.classList.toggle('is-hidden-by-filter', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = `显示 ${visibleCount} 部 / 共 ${cards.length} 部`;
      }
    }

    [search, year, region, type].forEach((control) => {
      control?.addEventListener('input', applyFilter);
      control?.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
}

let hlsModulePromise = null;

function loadHlsModule() {
  if (!hlsModulePromise) {
    hlsModulePromise = import('./hls-vendor.js');
  }

  return hlsModulePromise;
}

async function attachHls(video, source, message) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    await video.play();
    return;
  }

  const module = await loadHlsModule();
  const Hls = module.H;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {
        if (message) {
          message.textContent = '浏览器阻止了自动播放，请再次点击视频播放。';
        }
      });
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal && message) {
        message.textContent = '播放源连接异常，请稍后刷新重试。';
      }
    });
    return;
  }

  video.src = source;
  await video.play();
}

function setupPlayers() {
  const players = document.querySelectorAll(SELECTORS.player);

  players.forEach((player) => {
    const source = player.dataset.m3u8;
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const message = player.querySelector('[data-player-message]');

    if (!source || !video || !button) {
      return;
    }

    let initialized = false;

    async function startPlayback() {
      if (initialized) {
        video.play();
        return;
      }

      initialized = true;
      button.classList.add('hidden');

      if (message) {
        message.textContent = '正在初始化 HLS 播放器…';
      }

      try {
        await attachHls(video, source, message);
        if (message) {
          message.textContent = '';
        }
      } catch (error) {
        initialized = false;
        button.classList.remove('hidden');
        if (message) {
          message.textContent = '播放器启动失败，请检查网络或稍后重试。';
        }
        console.error(error);
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', () => {
      if (!initialized) {
        startPlayback();
      }
    });
  });
}

function setupBackToTop() {
  document.querySelectorAll(SELECTORS.backTop).forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });
}

setupMobileNavigation();
setupHeroCarousel();
setupFilters();
setupPlayers();
setupBackToTop();
