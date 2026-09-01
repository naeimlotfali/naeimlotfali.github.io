// Cursor glow effect
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// Scroll progress bar
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = progress + '%';
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

function setBurger(open) {
    const spans = mobileToggle.querySelectorAll('span');
    spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : 'none';
    spans[1].style.opacity = open ? '0' : '1';
    spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
}

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    setBurger(navLinks.classList.contains('open'));
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        setBurger(false);
    });
});

// Intersection Observer for reveal animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .timeline-item').forEach(el => observer.observe(el));

// Language bar animation
const langObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target.querySelector('.language-bar-fill');
            if (bar) {
                setTimeout(() => { bar.style.width = bar.dataset.width; }, 300);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.language-card').forEach(card => langObserver.observe(card));

// Smooth staggered animations for grid items
document.querySelectorAll('.competency-card, .skill-tag, .stat-card, .project-card').forEach((item, index) => {
    item.style.transitionDelay = (index % 4) * 0.1 + 's';
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Image galleries (swappable pages) ----------
// Each gallery declares its own images and captions on the element:
//   data-images    pipe-separated image paths
//   data-captions  pipe-separated captions, one per image
//   data-alt       prefix used to build each image's alt text
function initGallery(gallery) {
    if (!gallery) return null;
    const images = (gallery.dataset.images || '').split('|').filter(Boolean);
    const captions = (gallery.dataset.captions || '').split('|');
    const altPrefix = gallery.dataset.alt || '';
    const imgEl = gallery.querySelector('.gallery-img');
    const capEl = gallery.querySelector('.gallery-caption');
    const curEl = gallery.querySelector('.gallery-counter .cur');
    const dotsWrap = gallery.parentElement.querySelector('.gallery-dots');
    let index = 0;

    function render() {
        imgEl.src = images[index];
        imgEl.alt = `${altPrefix}${captions[index] || ''}`;
        // restart the fade animation
        imgEl.style.animation = 'none';
        void imgEl.offsetWidth;
        imgEl.style.animation = '';
        if (capEl) capEl.textContent = captions[index] || '';
        if (curEl) curEl.textContent = index + 1;
        if (dotsWrap) {
            [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
        }
    }

    function go(delta) {
        index = (index + delta + images.length) % images.length;
        render();
    }
    function goTo(i) { index = i; render(); }

    gallery.querySelector('.gallery-nav.prev').addEventListener('click', () => go(-1));
    gallery.querySelector('.gallery-nav.next').addEventListener('click', () => go(1));

    if (dotsWrap) {
        captions.forEach((_, i) => {
            const b = document.createElement('button');
            b.setAttribute('aria-label', `Screen ${i + 1}`);
            b.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(b);
        });
    }

    // open current image in the lightbox as a browsable gallery
    imgEl.addEventListener('click', () => {
        const items = images.map((src, i) => ({ src, caption: captions[i] || '' }));
        openLightbox(items, index);
    });

    render();
    return { el: gallery, go };
}

// ---------- Lightbox (single image or browsable gallery) ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let lbItems = [];
let lbIndex = 0;

function renderLightbox() {
    const item = lbItems[lbIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption || '';
    lightboxCaption.textContent = item.caption || '';
    const multi = lbItems.length > 1;
    lightboxPrev.hidden = !multi;
    lightboxNext.hidden = !multi;
}

// openLightbox accepts either (src, caption) or (itemsArray, startIndex)
function openLightbox(srcOrItems, captionOrIndex) {
    if (Array.isArray(srcOrItems)) {
        lbItems = srcOrItems;
        lbIndex = captionOrIndex || 0;
    } else {
        lbItems = [{ src: srcOrItems, caption: captionOrIndex || '' }];
        lbIndex = 0;
    }
    renderLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function lbGo(delta) {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    renderLightbox();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { if (!lightbox.classList.contains('open')) lightboxImg.src = ''; }, 300);
}

document.querySelectorAll('.project-card > img').forEach(img => {
    img.addEventListener('click', () => {
        const card = img.closest('.project-card');
        const title = card ? card.querySelector('h3')?.textContent.trim() : img.alt;
        openLightbox(img.src, title);
    });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lbGo(-1));
lightboxNext.addEventListener('click', () => lbGo(1));
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') lbGo(-1);
    else if (e.key === 'ArrowRight') lbGo(1);
});

const galleries = [...document.querySelectorAll('.gallery')].map(initGallery).filter(Boolean);

// arrow-key navigation for whichever inline gallery is on screen, when the
// lightbox is closed
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const visible = galleries.find(g => {
        const r = g.el.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
    });
    if (!visible) return;
    visible.go(e.key === 'ArrowLeft' ? -1 : 1);
});
