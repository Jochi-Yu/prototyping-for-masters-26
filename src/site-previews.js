export const studentPreviewPath = (name) => `/previews/sites/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}.jpg`;

export function initSitePreviews() {
  const preview = document.querySelector('.site-preview');
  const image = preview.querySelector('.preview-image');
  const message = preview.querySelector('.preview-message');
  const links = document.querySelectorAll('.student-row-link');
  const enabled = window.matchMedia('(hover: hover) and (min-width: 48.01rem)');
  const cache = new Map();
  let activeLink = null;
  let timer;

  const load = (link) => {
    const src = studentPreviewPath(link.dataset.studentName);
    if (!cache.has(src)) {
      const screenshot = new Image();
      screenshot.src = src;
      cache.set(src, screenshot.decode().then(() => src).catch(() => null));
    }
    return cache.get(src);
  };

  const hide = () => {
    window.clearTimeout(timer);
    activeLink = null;
    preview.classList.remove('is-visible');
  };

  const show = async (link) => {
    if (!enabled.matches) return;
    activeLink = link;
    image.hidden = true;
    message.hidden = false;
    message.textContent = 'Loading preview…';
    preview.classList.add('is-visible');
    const src = await load(link);
    // A slow image must never replace the student currently being previewed.
    if (activeLink !== link) return;
    if (src) {
      image.src = src;
      image.hidden = false;
      message.hidden = true;
    } else {
      message.textContent = 'Preview unavailable — select the name to visit the site ↗';
    }
  };

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      window.clearTimeout(timer);
      if (enabled.matches) {
        load(link);
        timer = window.setTimeout(() => show(link), 100);
      }
    });
    link.addEventListener('mouseleave', hide);
    link.addEventListener('focus', () => {
      window.clearTimeout(timer);
      show(link);
    });
    link.addEventListener('blur', hide);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
  enabled.addEventListener('change', hide);

  // Warm only nearby images, without executing students' sites in hidden frames.
  const observer = new IntersectionObserver((entries) => {
    if (!enabled.matches) return;
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        load(target);
        observer.unobserve(target);
      }
    });
  }, { rootMargin: '240px 0px' });
  links.forEach((link) => observer.observe(link));
}
