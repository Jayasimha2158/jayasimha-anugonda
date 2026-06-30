// 1. Initialize Constellation Particles
particlesJS("particles-js", {
    particles: {
        number: { value: 35, density: { enable: true, value_area: 800 } },
        color: { value: "#38bdf8" },
        shape: { type: "circle" },
        opacity: { value: 0.25, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#818cf8", opacity: 0.15, width: 1 },
        move: { enable: true, speed: 1.0, out_mode: "out" }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, resize: true },
        modes: { grab: { distance: 140, line_linked: { opacity: 0.4 } } }
    }
});

// 2. High-Performance Focus Lens Cursor
const dot = document.querySelector('.focus-cursor-dot');
const ring = document.querySelector('.focus-cursor-ring');

let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
});

function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(renderCursor);
}
renderCursor();

// 3. Background ambience audio
const backgroundAudio = document.getElementById('background-audio');
const musicToggle = document.getElementById('music-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.getElementById('mainNav');
let backgroundMusicStarted = false;
let backgroundMusicAttempts = 0;
let isMusicMuted = false;

function isAnyEpisodePlaying() {
    return Array.from(document.querySelectorAll('.episode-audio')).some(audio => !audio.paused);
}

function attemptBackgroundMusic() {
    if (!backgroundAudio || backgroundMusicStarted) return;

    backgroundAudio.volume = 0.12;
    backgroundAudio.loop = true;

    const playPromise = backgroundAudio.play();
    if (playPromise) {
        playPromise.then(() => {
            backgroundMusicStarted = true;
            backgroundMusicAttempts = 0;
        }).catch(() => {
            backgroundMusicAttempts += 1;
            if (backgroundMusicAttempts < 4) {
                setTimeout(attemptBackgroundMusic, 600 + backgroundMusicAttempts * 300);
            }
        });
    }
}

function startBackgroundMusic() {
    if (!backgroundAudio || backgroundMusicStarted) return;
    attemptBackgroundMusic();
}

function pauseBackgroundMusic() {
    if (!backgroundAudio) return;
    backgroundAudio.pause();
}

function toggleBackgroundMusic() {
    if (!backgroundAudio) return;

    isMusicMuted = !isMusicMuted;
    backgroundAudio.muted = isMusicMuted;

    if (musicToggle) {
        musicToggle.classList.toggle('is-muted', isMusicMuted);
        const icon = musicToggle.querySelector('i');
        if (icon) {
            icon.className = isMusicMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
        }
        musicToggle.setAttribute('aria-label', isMusicMuted ? 'Unmute background music' : 'Mute background music');
        musicToggle.title = isMusicMuted ? 'Unmute background music' : 'Mute background music';
    }

    if (!isMusicMuted && !backgroundAudio.paused) {
        backgroundAudio.play().catch(() => {});
    }
}

function closeMobileNav() {
    if (!mainNav || !mobileMenuToggle) return;
    mainNav.classList.remove('open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    const icon = mobileMenuToggle.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';
}

function toggleMobileNav() {
    if (!mainNav || !mobileMenuToggle) return;
    const isOpen = mainNav.classList.toggle('open');
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    const icon = mobileMenuToggle.querySelector('i');
    if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
}

function resumeBackgroundMusic() {
    if (!backgroundAudio || backgroundMusicStarted === false) return;
    if (document.hidden) return;
    if (!isAnyEpisodePlaying()) {
        backgroundAudio.play().catch(() => {});
    }
}

['pointerdown', 'keydown', 'touchstart', 'click'].forEach(eventName => {
    window.addEventListener(eventName, startBackgroundMusic, { once: true });
});

window.addEventListener('focus', startBackgroundMusic);
window.addEventListener('pageshow', startBackgroundMusic);
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(startBackgroundMusic, 300);
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        resumeBackgroundMusic();
    }
});

if (musicToggle) {
    musicToggle.addEventListener('click', toggleBackgroundMusic);
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileNav);
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileNav();
    }
});

// 4. Tab Switching Engine
function switchTab(tabId) {
    closeMobileNav();

    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabId)) btn.classList.add('active');
    });

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    const target = document.getElementById(tabId);
    if(target) {
        target.classList.add('active-tab');
        target.classList.remove('page-entering');
        requestAnimationFrame(() => target.classList.add('page-entering'));
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    gsap.fromTo(`#${tabId} .reveal`, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", clearProps: "all" }
    );
}

// 5. Audio player controls for each episode
const audioButtons = document.querySelectorAll('.play-btn');
audioButtons.forEach(button => {
    const audioId = button.dataset.audio;
    const audio = document.getElementById(audioId);
    const icon = button.querySelector('i');

    if (!audio || !icon) return;

    button.addEventListener('click', () => {
        const allAudios = document.querySelectorAll('.episode-audio');

        allAudios.forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
                const otherButton = document.querySelector(`[data-audio="${otherAudio.id}"]`);
                if (otherButton) {
                    otherButton.classList.remove('is-playing');
                    const otherIcon = otherButton.querySelector('i');
                    if (otherIcon) otherIcon.className = 'fa-solid fa-play';
                }
            }
        });

        if (audio.paused) {
            pauseBackgroundMusic();
            audio.play().catch(() => {});
            button.classList.add('is-playing');
            icon.className = 'fa-solid fa-pause';
        } else {
            audio.pause();
            button.classList.remove('is-playing');
            icon.className = 'fa-solid fa-play';
            resumeBackgroundMusic();
        }
    });

    audio.addEventListener('ended', () => {
        button.classList.remove('is-playing');
        icon.className = 'fa-solid fa-play';
        resumeBackgroundMusic();
    });

    audio.addEventListener('pause', () => {
        if (!isAnyEpisodePlaying()) {
            resumeBackgroundMusic();
        }
    });
});

// 6. Thoughts cards open a full-screen story overlay
const thoughtOverlay = document.getElementById('thought-overlay');
const thoughtOverlayTitle = document.getElementById('thought-overlay-title');
const thoughtOverlayBody = document.getElementById('thought-overlay-body');
const thoughtCloseButton = document.querySelector('.thought-close');

function closeThoughtOverlay() {
    if (!thoughtOverlay) return;
    thoughtOverlay.classList.remove('is-open');
    thoughtOverlay.setAttribute('aria-hidden', 'true');
}

function createThoughtPreview(fullText) {
    if (!fullText) return '';
    const cleanedText = fullText.replace(/\s+/g, ' ').trim();
    if (cleanedText.length <= 140) return cleanedText;
    return `${cleanedText.slice(0, 137).trimEnd()}...`;
}

function openThoughtOverlay(title, body) {
    if (!thoughtOverlay || !thoughtOverlayTitle || !thoughtOverlayBody) return;
    thoughtOverlayTitle.textContent = title;
    thoughtOverlayBody.textContent = body;
    thoughtOverlay.classList.add('is-open');
    thoughtOverlay.setAttribute('aria-hidden', 'false');
}

document.querySelectorAll('.thought-card').forEach(card => {
    const toggle = card.querySelector('.thought-toggle');
    const preview = card.querySelector('.thought-preview');
    const heading = card.querySelector('h3');

    if (!toggle) return;

    const title = card.dataset.thoughtTitle || (heading ? heading.textContent : '');
    const fullText = card.dataset.thoughtFull || '';
    const previewText = card.dataset.thoughtPreview || createThoughtPreview(fullText);

    if (heading) {
        heading.textContent = title;
    }

    if (preview) {
        preview.textContent = previewText;
    }

    toggle.addEventListener('click', () => {
        openThoughtOverlay(title, fullText);
    });
});

if (thoughtCloseButton) {
    thoughtCloseButton.addEventListener('click', closeThoughtOverlay);
}

if (thoughtOverlay) {
    thoughtOverlay.addEventListener('click', (event) => {
        if (event.target === thoughtOverlay || event.target.classList.contains('thought-overlay-backdrop')) {
            closeThoughtOverlay();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && thoughtOverlay && thoughtOverlay.classList.contains('is-open')) {
        closeThoughtOverlay();
    }
});

// 7. Custom Form Submit (No Alert Popups)
async function handleFormSubmit(event) {
    event.preventDefault();

    const form = document.getElementById('dispatchForm');
    const btn = document.getElementById('submitBtn');
    const originalText = btn ? btn.innerHTML : 'Transmit Note';

    if (!form || !btn) return;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.classList.remove('btn-success', 'btn-error');

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: new FormData(form)
        });

        const result = await response.json();

        if (result.success) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Transmitted Successfully';
            btn.classList.add('btn-success');
            form.reset();
        } else {
            btn.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Transmission Failed';
            btn.classList.add('btn-error');
        }
    } catch (error) {
        btn.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Transmission Failed';
        btn.classList.add('btn-error');
    }

    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.classList.remove('btn-success', 'btn-error');
    }, 3000);
}

// 7. Initial Load Reveal
window.addEventListener('DOMContentLoaded', () => {
    gsap.from('.glass-header', { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('#home .reveal', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, delay: 0.2 });

    document.querySelectorAll('.tab-content').forEach((tab, index) => {
        tab.addEventListener('mouseenter', () => {
            gsap.to(tab, { y: -2, duration: 0.25, ease: 'power2.out' });
        });
        tab.addEventListener('mouseleave', () => {
            gsap.to(tab, { y: 0, duration: 0.25, ease: 'power2.out' });
        });
    });

    const initialTab = document.querySelector('.tab-content.active-tab');
    if (initialTab) {
        initialTab.classList.add('page-entering');
        setTimeout(() => initialTab.classList.remove('page-entering'), 800);
    }
});