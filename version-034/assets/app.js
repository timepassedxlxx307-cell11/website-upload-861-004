(function () {
  function each(list, callback) {
    Array.prototype.forEach.call(list, callback);
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-site-nav]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = hero.querySelectorAll("[data-hero-slide]");
      var dots = hero.querySelectorAll("[data-hero-dot]");
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        each(slides, function (slide, slideIndex) {
          slide.classList.toggle("hero-slide-active", slideIndex === current);
        });
        each(dots, function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function advance() {
        show(current + 1);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(advance, 5200);
      }

      if (slides.length > 1) {
        if (previous) {
          previous.addEventListener("click", function () {
            show(current - 1);
            restart();
          });
        }
        if (next) {
          next.addEventListener("click", function () {
            show(current + 1);
            restart();
          });
        }
        each(dots, function (dot) {
          dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            restart();
          });
        });
        restart();
      }
    }

    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput) {
      var cards = document.querySelectorAll("[data-filter]");
      filterInput.addEventListener("input", function () {
        var value = filterInput.value.trim().toLowerCase();
        each(cards, function (card) {
          var text = (card.getAttribute("data-filter") || "").toLowerCase();
          card.classList.toggle("is-hidden", value !== "" && text.indexOf(value) === -1);
        });
      });
    }

    each(document.querySelectorAll("[data-player]"), function (frame) {
      var video = frame.querySelector("video");
      var trigger = frame.querySelector("[data-play-trigger]");
      var started = false;
      var hlsInstance = null;

      function loadAndPlay() {
        if (!video) {
          return;
        }

        var stream = video.getAttribute("data-m3u8");

        if (!stream) {
          return;
        }

        if (!started) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          }
          video.setAttribute("controls", "controls");
          started = true;
        }

        frame.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", loadAndPlay);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            loadAndPlay();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
