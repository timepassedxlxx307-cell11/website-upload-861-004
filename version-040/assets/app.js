(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(input, panel) {
    var query = normalize(input.value);
    if (!query || !window.SEARCH_ITEMS) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }

    var results = window.SEARCH_ITEMS.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.tags).indexOf(query) !== -1;
    }).slice(0, 9);

    if (!results.length) {
      panel.innerHTML = '<div class="search-item"><div></div><div><strong>暂无匹配内容</strong><span>试试其他片名、地区或类型</span></div></div>';
      panel.classList.add('open');
      return;
    }

    panel.innerHTML = results.map(function (item) {
      return '<a class="search-item" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('open');
  }

  function setupSearch() {
    $all('[data-search-box]').forEach(function (box) {
      var input = $('[data-search-input]', box);
      var panel = $('[data-search-results]', box);
      if (!input || !panel) {
        return;
      }

      input.addEventListener('input', function () {
        renderSearch(input, panel);
      });

      input.addEventListener('focus', function () {
        renderSearch(input, panel);
      });
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('[data-search-box]')) {
        $all('[data-search-results]').forEach(function (panel) {
          panel.classList.remove('open');
        });
      }
    });
  }

  function setupMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    $all('[data-filter-scope]').forEach(function (scope) {
      var input = $('[data-local-filter]', scope);
      var typeSelect = $('[data-filter-type]', scope);
      var regionSelect = $('[data-filter-region]', scope);
      var reset = $('[data-filter-reset]', scope);
      var container = scope.nextElementSibling;
      var cards = container ? $all('[data-movie-card]', container) : [];
      var empty = container ? $('.no-results', container) : null;

      function unique(attr) {
        var values = [];
        cards.forEach(function (card) {
          var value = card.getAttribute(attr);
          if (value && values.indexOf(value) === -1) {
            values.push(value);
          }
        });
        return values.sort();
      }

      function fill(select, attr) {
        if (!select) {
          return;
        }
        unique(attr).forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.appendChild(option);
        });
      }

      function apply() {
        var query = normalize(input && input.value);
        var type = typeSelect ? typeSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' '));
          var ok = (!query || haystack.indexOf(query) !== -1) &&
            (!type || card.getAttribute('data-type') === type) &&
            (!region || card.getAttribute('data-region') === region);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      fill(typeSelect, 'data-type');
      fill(regionSelect, 'data-region');

      [input, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          apply();
        });
      }
    });
  }

  function setupPlayers() {
    $all('[data-player]').forEach(function (shell) {
      var video = $('video', shell);
      var cover = $('[data-player-cover]', shell);
      var start = $('[data-player-start]', shell);
      var message = $('[data-player-message]', shell);
      var stream = shell.getAttribute('data-stream');
      var initialized = false;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function play() {
        if (!video || !stream) {
          setMessage('播放遇到问题，请稍后重试');
          return;
        }

        if (!initialized) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          initialized = true;
        }

        video.controls = true;
        if (cover) {
          cover.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setMessage('点击视频区域继续播放');
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      if (start) {
        start.addEventListener('click', function (event) {
          event.stopPropagation();
          play();
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearch();
    setupHero();
    setupLocalFilters();
    setupPlayers();
  });
})();
