'use strict';

/* ── Nav ─────────────────────────────────────── */
(function () {
    var navbar = document.getElementById('navbar');
    var navLinks = document.getElementById('navLinks');
    var hamburger = document.getElementById('hamburger');
    var links = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('section[id]');
    var open = false;

    function closeMenu() {
        if (!open) return;
        open = false;
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
        open = !open;
        navLinks.classList.toggle('open', open);
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });

    links.forEach(function (l) { l.addEventListener('click', closeMenu); });
    document.addEventListener('click', function (e) { if (open && !navbar.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

    var tick = false;
    window.addEventListener('scroll', function () {
        if (tick) return;
        tick = true;
        requestAnimationFrame(function () {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
            var y = window.scrollY + 100;
            var cur = '';
            for (var i = sections.length - 1; i >= 0; i--) {
                if (sections[i].offsetTop <= y) { cur = sections[i].id; break; }
            }
            links.forEach(function (l) { l.classList.toggle('active', l.dataset.section === cur); });
            tick = false;
        });
    }, { passive: true });
})();

/* ── Smooth Scroll ─────────────────────────── */
/* On mobile, let iOS native momentum scroll handle it (no JS override) */
if (window.innerWidth >= 768) {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var t = document.querySelector(a.getAttribute('href'));
            if (!t) return;
            e.preventDefault();
            window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
        });
    });
}

/* ── Particles ─────────────────────────────── */
(function () {
    var canvas = document.getElementById('particleCanvas');
    /* On mobile: remove canvas from DOM entirely — WebKit allocates render
    resources for position:fixed elements even when display:none */
    if (!canvas) return;
    if (window.innerWidth < 768) { canvas.parentNode.removeChild(canvas); return; }
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var isMobile = window.innerWidth < 768;
    var COUNT = isMobile ? 25 : 60;
    var MAX_D = isMobile ? 70 : 120;
    var MOUSE = { x: -9999, y: -9999 };
    var rafId = null;
    var running = false;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function mk() { return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, size: Math.random() * 1.5 + .4, alpha: Math.random() * .45 + .12 }; }

    function draw() {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function (p) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5; if (p.y > H + 5) p.y = -5;
            var dx = p.x - MOUSE.x, dy = p.y - MOUSE.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 80) { var f = (80 - d) / 80 * .3; p.vx += dx / d * f; p.vy += dy / d * f; var s = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (s > 1.4) { p.vx *= 1.4 / s; p.vy *= 1.4 / s; } }
        });
        /* Only draw connection lines on non-mobile — O(n²) is too heavy on phones */
        if (!isMobile) {
            for (var i = 0; i < particles.length; i++) for (var j = i + 1; j < particles.length; j++) {
                var a = particles[i], b = particles[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < MAX_D) { ctx.beginPath(); ctx.strokeStyle = 'rgba(11,125,218,' + (1 - d / MAX_D) * .18 + ')'; ctx.lineWidth = .8; ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
            }
        }
        particles.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = 'rgba(11,125,218,' + p.alpha + ')'; ctx.fill(); });
        rafId = requestAnimationFrame(draw);
    }

    function startLoop() {
        if (running) return;
        running = true;
        draw();
    }

    function stopLoop() {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    resize();
    for (var i = 0; i < COUNT; i++) particles.push(mk());
    startLoop();

    window.addEventListener('resize', function () {
        isMobile = window.innerWidth < 768;
        resize();
        particles.forEach(function (p) { if (p.x > W) p.x = Math.random() * W; if (p.y > H) p.y = Math.random() * H; });
    }, { passive: true });

    window.addEventListener('mousemove', function (e) { MOUSE.x = e.clientX; MOUSE.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', function () { MOUSE.x = -9999; MOUSE.y = -9999; });

    /* Pause the loop completely when the tab is hidden — critical for mobile battery */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stopLoop();
            canvas.style.opacity = '0';
        } else {
            canvas.style.opacity = '0.65';
            startLoop();
        }
    });
})();

/* ── Scroll Animations ─────────────────────── */
(function () {
    var els = document.querySelectorAll('[data-aos],.service-card,.portfolio-card,.process-card,.fade-in-left,.fade-in-right');
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
    }
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible', 'animated'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    els.forEach(function (el) { obs.observe(el); });
})();

/* ── Stat Counters ─────────────────────────── */
(function () {
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            var el = e.target, target = parseInt(el.dataset.count, 10);
            var start = 0, step = target / (1800 / 16);
            var t = setInterval(function () {
                start += step;
                if (start >= target) { el.textContent = target; clearInterval(t); }
                else { el.textContent = Math.floor(start); }
            }, 16);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { obs.observe(c); });
})();

/* ── Testimonials ──────────────────────────── */
(function () {
    var cards = document.querySelectorAll('.testimonial-card');
    var dots = document.querySelectorAll('.t-dot');
    var prev = document.getElementById('tPrev');
    var next = document.getElementById('tNext');
    var counter = document.getElementById('tCounter');
    var cur = 0, timer, total = cards.length;

    function update() {
        cards.forEach(function (c, i) {
            c.classList.remove('t-active', 't-prev-card', 't-next-card');
            if (i === cur) c.classList.add('t-active');
            else if (i === (cur - 1 + total) % total) c.classList.add('t-prev-card');
            else if (i === (cur + 1) % total) c.classList.add('t-next-card');
        });
        dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); d.setAttribute('aria-selected', String(i === cur)); });
        if (counter) counter.textContent = (cur + 1) + ' / ' + total;
    }

    function goTo(i) { cur = ((i % total) + total) % total; update(); clearInterval(timer); timer = setInterval(function () { goTo(cur + 1); }, 5000); }

    if (!cards.length) return;
    update();
    timer = setInterval(function () { goTo(cur + 1); }, 5000);
    prev && prev.addEventListener('click', function () { goTo(cur - 1); });
    next && next.addEventListener('click', function () { goTo(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });

    var scene = document.getElementById('testimonialScene');
    if (scene) {
        var sx = 0, sy = 0;
        scene.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
        scene.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) dx < 0 ? goTo(cur + 1) : goTo(cur - 1); }, { passive: true });
        scene.addEventListener('mouseenter', function () { clearInterval(timer); });
        scene.addEventListener('mouseleave', function () { timer = setInterval(function () { goTo(cur + 1); }, 5000); });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') goTo(cur - 1); if (e.key === 'ArrowRight') goTo(cur + 1); });
})();

/* ── Portfolio Filter ──────────────────────── */
(function () {
    var btns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.portfolio-card');
    var search = document.getElementById('portfolioSearch');
    var noRes = document.getElementById('noResults');
    var active = 'all';

    function apply() {
        var q = (search ? search.value : '').toLowerCase().trim();
        var vis = 0;
        cards.forEach(function (card) {
            var cat = card.dataset.category || '';
            var kw = (card.dataset.keywords || '') + ' ' + (card.querySelector('h3') ? card.querySelector('h3').textContent : '') + ' ' + (card.querySelector('p') ? card.querySelector('p').textContent : '');
            var ok = (active === 'all' || cat === active) && (!q || kw.toLowerCase().includes(q));
            card.classList.toggle('hidden', !ok);
            if (ok) vis++;
        });
        if (noRes) noRes.classList.toggle('visible', vis === 0);
    }

    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            btns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            active = btn.dataset.filter;
            apply();
        });
    });
    if (search) search.addEventListener('input', apply);
})();

/* ── Modal Manager ─────────────────────────── */
(function () {
    function openModal(id) {
        var overlay = document.getElementById('modal-' + id);
        if (!overlay) return;
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        var closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    }

    function closeModal(overlay) {
        if (!overlay) return;
        overlay.classList.remove('is-open');
        var anyOpen = document.querySelector('.modal-overlay.is-open');
        if (!anyOpen) document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-modal]').forEach(function (btn) {
        btn.addEventListener('click', function () { openModal(btn.dataset.modal); });
    });

    document.querySelectorAll('.modal-close').forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal(btn.closest('.modal-overlay')); });
    });

    document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(overlay); });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal-overlay.is-open').forEach(function (o) { closeModal(o); });
    });
})();

/* ── Reusable Modal Sliders (manual, no auto-timer) ── */
/*
* Each slider uses the class "js-modal-slider" and data-total="N".
* To add images to a slider in the future:
*   1. Add a new <div class="mslide"><img src="..." /></div> inside .mslider-track
*   2. Add a new <button class="mslider-dot" ...> inside .mslider-dots
*   3. Update data-total on the .modal-slider element
*   4. Update the counter text (e.g. "1 / 3" → "1 / 4")
* No JS changes needed.
*/
(function () {
    document.querySelectorAll('.js-modal-slider').forEach(function (slider) {
        var total = parseInt(slider.dataset.total, 10) || 1;
        var track = slider.querySelector('.mslider-track');
        var prevBtn = slider.querySelector('.mslider-prev');
        var nextBtn = slider.querySelector('.mslider-next');
        var dots = slider.querySelectorAll('.mslider-dot');
        var counter = slider.querySelector('.mslider-counter');
        var cur = 0;

        function goTo(i) {
            cur = Math.max(0, Math.min(i, total - 1));
            if (track) track.style.transform = 'translateX(-' + (cur * 100) + '%)';

            dots.forEach(function (d, idx) {
                d.classList.toggle('active', idx === cur);
                d.setAttribute('aria-selected', String(idx === cur));
            });

            if (counter) counter.textContent = (cur + 1) + ' / ' + total;

            // Disable prev/next at boundaries
            if (prevBtn) prevBtn.disabled = (cur === 0);
            if (nextBtn) nextBtn.disabled = (cur === total - 1);
        }

        // Wire up buttons — click only, no auto-timer
        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(cur - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(cur + 1); });

        dots.forEach(function (d) {
            d.addEventListener('click', function () { goTo(parseInt(d.dataset.slide, 10)); });
        });

        // Swipe support on touch devices
        var sx = 0, sy = 0;
        slider.addEventListener('touchstart', function (e) {
            sx = e.changedTouches[0].clientX;
            sy = e.changedTouches[0].clientY;
        }, { passive: true });
        slider.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - sx;
            var dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                dx < 0 ? goTo(cur + 1) : goTo(cur - 1);
            }
        }, { passive: true });

        // Initialise
        goTo(0);
    });
})();

/* ── Card Tilt ─────────────────────────────── */
(function () {
    if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    document.querySelectorAll('.service-card,.portfolio-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
            var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
            card.style.transform = 'translateY(-6px) perspective(600px) rotateX(' + (dy * -4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
        });
        card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
})();

/* ── Typed Badge ───────────────────────────── */
(function () {
    /* Skip the typing effect on small phones — avoids infinite setTimeout chain on low-memory devices */
    if (window.innerWidth < 480) return;
    var phrases = ['⚡ Taking on New Clients', '⚡ Funnel Designer & GHL System Builder'];
    var badge = document.querySelector('.hero-badge');
    if (!badge || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var pi = 0, ci = 0, del = false;
    var typeTimer = null;
    var stopped = false;
    function type() {
        if (stopped) return;
        var p = phrases[pi];
        var cur = del ? p.substring(0, ci - 1) : p.substring(0, ci + 1);
        ci = del ? ci - 1 : ci + 1;
        badge.innerHTML = '<span class="badge-dot" aria-hidden="true"></span>' + cur;
        var d = del ? 40 : 70;
        if (!del && ci === p.length) { d = 2800; del = true; }
        else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; d = 400; }
        typeTimer = setTimeout(type, d);
    }
    typeTimer = setTimeout(type, 2400);
    /* Stop typing when tab is hidden to prevent timer accumulation */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stopped = true;
            if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
        } else {
            stopped = false;
            typeTimer = setTimeout(type, 400);
        }
    });
})();

/* ── Cursor Glow ───────────────────────────── */
(function () {
    if (window.innerWidth < 1024 || window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var g = document.createElement('div');
    g.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(11,125,218,0.08) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .12s ease,top .12s ease;';
    document.body.appendChild(g);
    window.addEventListener('mousemove', function (e) { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });
})();

/* ── Init ──────────────────────────────────── */
document.getElementById('currentYear').textContent = new Date().getFullYear();

window.addEventListener('load', function () {
    document.body.classList.add('loaded');
    window.dispatchEvent(new Event('scroll'));
});

/* ── Calendly Lazy Loader ───────────────────
Calendly JS is ~3MB. On iOS, loading it eagerly pushes total
tab memory over WebKit limit → browser kills the tab.
Only load it when the user scrolls near the contact section.  */
(function () {
    var contactSection = document.getElementById('contact');
    var calendlyWidget = document.querySelector('.calendly-inline-widget');
    if (!contactSection || !calendlyWidget) return;
    var loaded = false;
    var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !loaded) {
            loaded = true;
            obs.disconnect();
            var s = document.createElement('script');
            s.src = 'https://assets.calendly.com/assets/external/widget.js';
            s.async = true;
            document.body.appendChild(s);
        }
    }, { rootMargin: '200px' });
    obs.observe(contactSection);
})();

/* visibilitychange for canvas is handled inside the particle IIFE above */
