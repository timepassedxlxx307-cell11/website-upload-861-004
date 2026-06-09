(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  const filterInput = document.querySelector('[data-filter-input]');
  const filterChips = Array.from(document.querySelectorAll('[data-filter-chip]'));
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  let activeChip = 'all';

  function filterCards() {
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      const text = card.getAttribute('data-search') || '';
      const genre = card.getAttribute('data-genre') || '';
      const matchText = !keyword || text.indexOf(keyword) !== -1;
      const matchGenre = activeChip === 'all' || genre.indexOf(activeChip) !== -1;
      card.style.display = matchText && matchGenre ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = chip.getAttribute('data-filter-chip') || 'all';
      filterChips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      filterCards();
    });
  });

  const searchPageInput = document.querySelector('[data-search-page-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchTitle = document.querySelector('[data-search-title]');
  const searchNote = document.querySelector('[data-search-note]');

  if (searchPageInput && searchResults && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (query) {
      searchPageInput.value = query;
      renderSearch(query);
    }

    searchPageInput.addEventListener('input', function () {
      renderSearch(searchPageInput.value.trim());
    });
  }

  function renderSearch(query) {
    const source = window.MOVIE_SEARCH_DATA || [];
    const value = query.toLowerCase();
    const matched = value
      ? source.filter(function (item) {
          return item.search.indexOf(value) !== -1;
        }).slice(0, 160)
      : source.slice(0, 60);

    if (searchTitle) {
      searchTitle.textContent = value ? '搜索结果' : '热门推荐';
    }

    if (searchNote) {
      searchNote.textContent = value ? '点击影片卡片进入详情播放。' : '输入关键词可继续筛选更多内容。';
    }

    searchResults.innerHTML = matched.map(function (item) {
      return [
        '<article class="movie-card movie-card-compact" data-movie-card>',
        '  <a class="movie-poster" href="' + item.url + '">',
        '    <img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</p>',
        '    <p class="movie-desc">' + escapeHtml(item.one) + '</p>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }
})();
