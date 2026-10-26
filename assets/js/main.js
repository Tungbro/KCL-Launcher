(() => {
  'use strict';

  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const toast = document.querySelector('#toast');
  const toastText = document.querySelector('#toast-text');

  /* ---------- Header + mobile navigation ---------- */

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    mobileMenu.classList.toggle('is-open', open);
  };

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (window.scrollY < 120) {
      navLinks.forEach((link) => {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      });
    }
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('click', (event) => {
      if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
      if (mobileMenu.contains(event.target) || menuToggle.contains(event.target)) return;
      setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  /* ---------- Active section in navigation ---------- */

  if ('IntersectionObserver' in window && navLinks.length) {
    const sections = navLinks
      .map((link) => {
        const id = link.getAttribute('href');
        return id && id.startsWith('#') ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is-active', active);
            if (active) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Copy to clipboard ---------- */

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    } catch (error) {
      return false;
    }
  };

  const copyText = async (text) => {
    if (!text) return false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Some local-file contexts deny the async clipboard; use the legacy path.
      }
    }

    return fallbackCopy(text);
  };

  let toastTimer;
  const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  };

  const copyMessage = (value) => {
    if (value.includes(':')) return '服务器地址已复制';
    if (/^[a-f0-9]{64}$/i.test(value)) return 'SHA-256 校验值已复制';
    if (/^\d+$/.test(value)) return 'QQ 群号已复制';
    return '已复制到剪贴板';
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy');
      const copied = await copyText(value);

      if (!copied) {
        showToast('复制失败，请手动选择文本');
        return;
      }

      button.classList.add('is-copied');
      window.setTimeout(() => button.classList.remove('is-copied'), 1300);
      showToast(copyMessage(value || ''));
    });
  });

  /* ---------- Screenshot lightbox ---------- */

  const shots = [...document.querySelectorAll('.shot')];
  const lightbox = document.querySelector('#lightbox');

  if (shots.length && lightbox) {
    const lightboxImage = document.querySelector('#lightbox-image');
    const lightboxCaption = document.querySelector('#lightbox-caption');
    const lightboxCount = document.querySelector('#lightbox-count');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    const focusable = [closeButton, prevButton, nextButton].filter(Boolean);
    let currentIndex = 0;
    let lastFocused = null;

    const renderShot = (index) => {
      currentIndex = (index + shots.length) % shots.length;
      const shot = shots[currentIndex];
      const source = shot.getAttribute('data-full');
      const caption = shot.getAttribute('data-caption') || '';
      const image = shot.querySelector('img');

      if (lightboxImage) {
        lightboxImage.src = source;
        lightboxImage.alt = image ? image.alt : caption;
      }
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxCount) lightboxCount.textContent = `${currentIndex + 1} / ${shots.length}`;
    };

    const openLightbox = (index, trigger) => {
      lastFocused = trigger instanceof HTMLElement ? trigger : document.activeElement;
      renderShot(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      closeButton?.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lastFocused instanceof HTMLElement) lastFocused.focus();
    };

    shots.forEach((shot, index) => {
      shot.addEventListener('click', () => openLightbox(index, shot));
    });

    lightbox.querySelectorAll('[data-close]').forEach((element) => {
      element.addEventListener('click', closeLightbox);
    });

    prevButton?.addEventListener('click', () => renderShot(currentIndex - 1));
    nextButton?.addEventListener('click', () => renderShot(currentIndex + 1));

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderShot(currentIndex - 1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderShot(currentIndex + 1);
        return;
      }

      if (event.key !== 'Tab' || !focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }
})();
