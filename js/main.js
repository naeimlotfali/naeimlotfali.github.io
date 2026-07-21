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

// ---------- Solution+ web gallery (swappable pages) ----------
const solutionWebImages = Array.from({ length: 8 }, (_, i) => `assets/images/solution_web_${i + 1}.jpg`);

function initGallery(gallery) {
    if (!gallery) return null;
    const captions = (gallery.dataset.captions || '').split('|');
    const imgEl = gallery.querySelector('.gallery-img');
    const capEl = gallery.querySelector('.gallery-caption');
    const curEl = gallery.querySelector('.gallery-counter .cur');
    const dotsWrap = gallery.parentElement.querySelector('.gallery-dots');
    let index = 0;

    function render() {
        imgEl.src = solutionWebImages[index];
        imgEl.alt = `Solution+ web — ${captions[index] || ''}`;
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
        index = (index + delta + solutionWebImages.length) % solutionWebImages.length;
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
        const items = solutionWebImages.map((src, i) => ({ src, caption: captions[i] || '' }));
        openLightbox(items, index);
    });

    render();
    return { go };
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

const solutionGallery = initGallery(document.getElementById('solutionWebGallery'));

// arrow-key navigation for the inline gallery when the lightbox is closed
document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open') || !solutionGallery) return;
    const g = document.getElementById('solutionWebGallery');
    const r = g.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft') solutionGallery.go(-1);
    else if (e.key === 'ArrowRight') solutionGallery.go(1);
});
