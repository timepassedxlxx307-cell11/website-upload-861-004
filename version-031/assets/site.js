(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = one('[data-mobile-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    all('[data-header-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = one('input[name="q"], input[type="search"]', form);
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    all('[data-filter-scope]').forEach(function (scope) {
      var input = one('[data-filter-input]', scope);
      var buttons = all('[data-filter-button]', scope);
      var cards = all('[data-card]', scope);
      var empty = one('[data-empty-state]', scope);
      var activeValue = '全部';
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var typeText = normalize(card.getAttribute('data-type'));
          var genreText = normalize(card.getAttribute('data-genre'));
          var regionText = normalize(card.getAttribute('data-region'));
          var tagsText = normalize(card.getAttribute('data-tags'));
          var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
          var matchButton = activeValue === '全部' || typeText.indexOf(normalize(activeValue)) !== -1 || genreText.indexOf(normalize(activeValue)) !== -1 || regionText.indexOf(normalize(activeValue)) !== -1 || tagsText.indexOf(normalize(activeValue)) !== -1;
          var shouldShow = matchKeyword && matchButton;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeValue = button.getAttribute('data-filter-value') || '全部';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          applyFilter();
        });
      });
      applyFilter();
    });
  }

  function setupPlayers() {
    all('[data-video-src]').forEach(function (shell) {
      var source = shell.getAttribute('data-video-src');
      var video = one('video', shell);
      var button = one('[data-play-button]', shell);
      var attached = false;
      var hlsInstance = null;
      if (!source || !video) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        attached = true;
      }

      function startPlayback() {
        attachSource();
        shell.classList.add('is-playing');
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            video.controls = true;
          });
        }
      }

      attachSource();
      if (button) {
        button.addEventListener('click', startPlayback);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeaderSearch();
    setupFilters();
    setupPlayers();
  });
})();
