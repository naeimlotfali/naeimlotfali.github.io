(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Theme ----------
    const themeBtn = $('#themeToggle');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

    function syncThemeButton() {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
    }

    themeBtn.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        // switch instantly instead of letting every link fade through the wrong colour
        root.classList.add('theme-switching');
        root.dataset.theme = next;
        requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
        syncThemeButton();
    });
    darkQuery.addEventListener('change', syncThemeButton);
    syncThemeButton();

    // ---------- Header: scrolled state + mobile menu ----------
    const header = $('#siteHeader');
    const menuBtn = $('#menuBtn');
    const nav = $('#nav');
    const mobileQuery = window.matchMedia('(max-width: 860px)');

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            header.classList.toggle('scrolled', window.scrollY > 8);
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
        header.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && header.classList.contains('open')) {
            setMenu(false);
            menuBtn.focus();
        }
    });
    mobileQuery.addEventListener('change', () => setMenu(false));

    // ---------- Active section in the nav ----------
    const navLinks = new Map($$('a', nav).map(a => [a.getAttribute('href').slice(1), a]));
    // "Earlier work" lives under the Work nav item
    const navTarget = id => (id === 'earlier' ? 'work' : id);

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const active = navTarget(entry.target.id);
                navLinks.forEach((link, id) => {
                    if (id === active) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('main section[id]').forEach(s => sectionObserver.observe(s));

        // ---------- Reveal on scroll ----------
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
        $$('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        $$('.reveal').forEach(el => el.classList.add('in'));
    }

    // ---------- Local time in Tehran ----------
    const timeEl = $('#localTime');
    function updateTime() {
        try {
            const t = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tehran'
            }).format(new Date());
            timeEl.textContent = `${t} local`;
        } catch (e) { /* keep the static fallback */ }
    }
    updateTime();
    setInterval(updateTime, 30000);

    $('#year').textContent = new Date().getFullYear();

    // ---------- Toast + copy email ----------
    const toast = $('#toast');
    let toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    const copyBtn = $('#copyEmail');
    copyBtn.addEventListener('click', async () => {
        const email = copyBtn.dataset.email;
        let ok = false;
        try {
            await navigator.clipboard.writeText(email);
            ok = true;
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = email;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
            ta.remove();
        }
        showToast(ok ? 'Email address copied' : 'Could not copy — please select it manually');
        const label = $('span', copyBtn);
        if (ok) {
            label.textContent = 'Copied';
            setTimeout(() => { label.textContent = 'Copy'; }, 2000);
        }
    });

    // ---------- Lightbox (native <dialog>) ----------
    const lightbox = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCaption = $('#lbCaption');
    const lbPrev = $('#lbPrev');
    const lbNext = $('#lbNext');
    let lbItems = [];
    let lbIndex = 0;

    function preload(src) {
        if (!src) return;
        const img = new Image();
        img.src = src;
    }

    function renderLightbox() {
        const item = lbItems[lbIndex];
        lbImg.src = item.src;
        lbImg.alt = item.alt || item.caption || '';
        const multi = lbItems.length > 1;
        lbCaption.textContent = multi
            ? `${item.caption} — ${lbIndex + 1} / ${lbItems.length}`
            : item.caption;
        lbPrev.hidden = !multi;
        lbNext.hidden = !multi;
        if (multi) {
            preload(lbItems[(lbIndex + 1) % lbItems.length].src);
            preload(lbItems[(lbIndex - 1 + lbItems.length) % lbItems.length].src);
        }
    }

    function openLightbox(items, index = 0) {
        lbItems = items;
        lbIndex = index;
        renderLightbox();
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
        else lightbox.setAttribute('open', '');
        document.body.style.overflow = 'hidden';
    }

    function lbGo(delta) {
        if (lbItems.length < 2) return;
        lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
        renderLightbox();
    }

    lightbox.addEventListener('close', () => {
        document.body.style.overflow = '';
        lbImg.removeAttribute('src');
    });
    $('#lbClose').addEventListener('click', () => lightbox.close());
    lbPrev.addEventListener('click', () => lbGo(-1));
    lbNext.addEventListener('click', () => lbGo(1));
    // a click on the dialog itself (not its contents) is a click on the backdrop
    lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') lbGo(-1);
        else if (e.key === 'ArrowRight') lbGo(1);
    });

    $$('[data-zoom]').forEach(btn => {
        btn.addEventListener('click', () => {
            const img = $('img', btn);
            openLightbox([{ src: btn.dataset.zoom, caption: btn.dataset.caption || '', alt: img ? img.alt : '' }]);
        });
    });

    // ---------- Galleries ----------
    // A gallery declares its own content on the <figure>:
    //   data-images    pipe-separated image paths
    //   data-captions  pipe-separated captions, one per image
    //   data-alt       prefix used to build each image's alt text
    function initGallery(gallery) {
        const images = (gallery.dataset.images || '').split('|').filter(Boolean);
        const captions = (gallery.dataset.captions || '').split('|');
        const altPrefix = gallery.dataset.alt || '';
        const stage = $('.gallery-stage', gallery);
        const img = $('img', stage);
        const caption = $('.gallery-caption', gallery);
        const cur = $('[data-cur]', gallery);
        const total = $('[data-total]', gallery);
        let index = 0;
        let preloaded = false;

        if (total) total.textContent = images.length;

        function render(animate) {
            img.src = images[index];
            img.alt = `${altPrefix}${captions[index] || ''}`;
            if (caption) caption.textContent = captions[index] || '';
            if (cur) cur.textContent = index + 1;
            if (animate && !reduceMotion) {
                img.classList.remove('swap');
                void img.offsetWidth; // restart the animation
                img.classList.add('swap');
            }
        }

        function warm() {
            if (preloaded) return;
            preloaded = true;
            images.forEach(preload);
        }

        function go(delta) {
            warm();
            index = (index + delta + images.length) % images.length;
            render(true);
        }

        $('[data-prev]', gallery).addEventListener('click', () => go(-1));
        $('[data-next]', gallery).addEventListener('click', () => go(1));
        gallery.addEventListener('pointerenter', warm, { once: true });
        gallery.addEventListener('focusin', warm, { once: true });

        // arrow keys only while focus is inside this gallery
        gallery.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        });

        // swipe on touch; a drag must not also count as a click
        let startX = null;
        let swiped = false;
        stage.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse') return;
            startX = e.clientX;
            swiped = false;
        });
        stage.addEventListener('pointerup', e => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 40) {
                swiped = true;
                go(dx < 0 ? 1 : -1);
            }
        });
        stage.addEventListener('pointercancel', () => { startX = null; });

        stage.addEventListener('click', () => {
            if (swiped) { swiped = false; return; }
            warm();
            openLightbox(
                images.map((src, i) => ({ src, caption: captions[i] || '', alt: `${altPrefix}${captions[i] || ''}` })),
                index
            );
        });

        render(false);
    }

    $$('[data-gallery]').forEach(initGallery);
})();
