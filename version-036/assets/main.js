(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initCarousel() {
        var carousels = document.querySelectorAll("[data-carousel]");
        carousels.forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-dot]"));
            var next = carousel.querySelector("[data-next]");
            var prev = carousel.querySelector("[data-prev]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function play() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    play();
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    play();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    play();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", play);
            show(0);
            play();
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function uniqueCardsValue(cards, key) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(key) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                return Number(b) - Number(a);
            }
            return a.localeCompare(b, "zh-Hans-CN");
        });
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var queryInput = panel.querySelector("[data-filter-query]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var sortSelect = panel.querySelector("[data-filter-sort]");
        var empty = document.querySelector("[data-empty-result]");

        fillSelect(regionSelect, uniqueCardsValue(cards, "data-region"));
        fillSelect(yearSelect, uniqueCardsValue(cards, "data-year"));
        fillSelect(typeSelect, uniqueCardsValue(cards, "data-type"));

        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get("q");
        if (urlQuery && queryInput) {
            queryInput.value = urlQuery;
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
        }

        function applySort() {
            var mode = sortSelect ? sortSelect.value : "default";
            var sorted = cards.slice();
            if (mode === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            }
            if (mode === "score-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
                });
            }
            if (mode === "title-asc") {
                sorted.sort(function (a, b) {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilter() {
            var q = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var matches = true;
                if (q && cardText(card).indexOf(q) === -1) {
                    matches = false;
                }
                if (region && card.getAttribute("data-region") !== region) {
                    matches = false;
                }
                if (year && card.getAttribute("data-year") !== year) {
                    matches = false;
                }
                if (type && card.getAttribute("data-type") !== type) {
                    matches = false;
                }
                card.classList.toggle("is-hidden", !matches);
                if (matches) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-active", visibleCount === 0);
            }
        }

        [queryInput, regionSelect, yearSelect, typeSelect, sortSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", function () {
                applySort();
                applyFilter();
            });
            control.addEventListener("change", function () {
                applySort();
                applyFilter();
            });
        });

        applySort();
        applyFilter();
    }

    function initSearchForms() {
        var forms = document.querySelectorAll(".site-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initCarousel();
        initFilters();
        initSearchForms();
    });
})();
