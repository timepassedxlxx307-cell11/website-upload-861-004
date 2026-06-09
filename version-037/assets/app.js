const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      play();
    });
  });

  showSlide(0);
  play();
}

const normalize = (value) => String(value || '').trim().toLowerCase();

const filterInputs = document.querySelectorAll('[data-filter-input]');

filterInputs.forEach((input) => {
  const scope = input.closest('main') || document;
  const items = Array.from(scope.querySelectorAll('[data-filter-item]'));

  input.addEventListener('input', () => {
    const query = normalize(input.value);
    items.forEach((item) => {
      const title = normalize(item.getAttribute('data-title'));
      const tags = normalize(item.getAttribute('data-tags'));
      const matched = !query || title.includes(query) || tags.includes(query);
      item.classList.toggle('is-hidden', !matched);
    });
  });
});
