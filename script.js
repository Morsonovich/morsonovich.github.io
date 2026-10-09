document.addEventListener('DOMContentLoaded', () => {
  // background video autoplay
  const bgVideo = document.getElementById('backgroundVideo');
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.setAttribute('playsinline', '');
    bgVideo.setAttribute('muted', '');
    bgVideo.setAttribute('autoplay', '');
    
    const playVid = () => {
      bgVideo.play().catch(() => {});
    };
    playVid();
    ['click', 'touchstart', 'pointerdown', 'scroll'].forEach(evt => {
      document.addEventListener(evt, playVid, { once: true });
    });
  }

  // title ticker animation
  const titleFrames = [
    '@m',
    '@mo',
    '@mor',
    '@mors',
    '@morso',
    '@morson',
    '@morsonov',
    '@morsonovi',
    '@morsonovic',
    '@morsonovich',
    '@morsonovich ⚡',
    '@morsonovich',
    '@morsonovic',
    '@morsonovi',
    '@morsonov',
    '@morson',
    '@morso',
    '@mors',
    '@mor',
    '@mo'
  ];
  let titleIndex = 0;
  setInterval(() => {
    document.title = titleFrames[titleIndex % titleFrames.length];
    titleIndex++;
  }, 260);

  // audio autoplay & unlock manager
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const enterOverlay = document.getElementById('enterOverlay');

  let isPlaying = false;
  let hasUnlocked = false;
  let isUnlocking = false;

  function hideOverlay() {
    if (enterOverlay && !enterOverlay.classList.contains('hidden')) {
      enterOverlay.classList.add('hidden');
      setTimeout(() => {
        enterOverlay.style.display = 'none';
      }, 500);
    }
  }

  function handlePlaybackSuccess() {
    isPlaying = true;
    hideOverlay();
    if (musicStatusText) musicStatusText.textContent = 'MORGENSHTERN — Красный флаг';
    if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    if (bgVideo && bgVideo.paused) {
      bgVideo.play().catch(() => {});
    }
  }

  function startMusic() {
    if (!bgAudio) return Promise.reject(new Error('audio element not found'));
    bgAudio.volume = 0.65;
    const p = bgAudio.play();
    if (p !== undefined) {
      return p;
    }
    return Promise.resolve();
  }

  function unlockAndPlay() {
    if (hasUnlocked && isPlaying) return;
    if (isUnlocking) return;
    isUnlocking = true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    } catch (e) {}

    startMusic().then(() => {
      hasUnlocked = true;
      isUnlocking = false;
      handlePlaybackSuccess();
    }).catch(err => {
      console.warn('Playback error on gesture:', err);
      setTimeout(() => {
        startMusic().then(() => {
          hasUnlocked = true;
          isUnlocking = false;
          handlePlaybackSuccess();
        }).catch(e => {
          isUnlocking = false;
          console.error('Final playback attempt failed:', e);
        });
      }, 100);
    });

    hideOverlay();
  }

  // initial attempt (if browser allows cold autoplay)
  startMusic().then(() => {
    hasUnlocked = true;
    handlePlaybackSuccess();
  }).catch(() => {
    // waiting for interaction
  });

  // gesture triggers
  if (enterOverlay) {
    enterOverlay.addEventListener('click', unlockAndPlay);
    enterOverlay.addEventListener('touchstart', unlockAndPlay, { passive: true });
    enterOverlay.addEventListener('pointerdown', unlockAndPlay);
  }
  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAndPlay, { passive: true });
  });

  if (bgAudio) {
    bgAudio.addEventListener('playing', () => {
      isPlaying = true;
      handlePlaybackSuccess();
    });

    bgAudio.addEventListener('pause', () => {
      if (hasUnlocked) {
        isPlaying = false;
        if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
        if (musicStatusText) musicStatusText.textContent = 'Музыка на паузе';
      }
    });

    bgAudio.addEventListener('ended', () => {
      bgAudio.currentTime = 0;
      startMusic().catch(() => {});
    });

    bgAudio.addEventListener('error', () => {
      if (!bgAudio.src.includes('media/audio/background.mp3')) {
        bgAudio.src = 'media/audio/background.mp3';
        bgAudio.load();
        if (hasUnlocked) startMusic().catch(() => {});
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasUnlocked && bgAudio && bgAudio.paused && isPlaying) {
      startMusic().catch(() => {});
    }
  });

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bgAudio) return;
      if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
        if (musicStatusText) musicStatusText.textContent = 'Музыка на паузе';
        if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
      } else {
        hasUnlocked = true;
        startMusic().then(handlePlaybackSuccess).catch(console.error);
      }
    });
  }

  // bio / dossier accordion
  const dossierToggleBtn = document.getElementById('dossierToggleBtn');
  const dossierPanel = document.getElementById('dossierPanel');

  if (dossierToggleBtn && dossierPanel) {
    dossierToggleBtn.addEventListener('click', () => {
      const isOpen = dossierPanel.classList.toggle('open');
      const stateSpan = dossierToggleBtn.querySelector('.bio-toggle-state');
      if (stateSpan) {
        stateSpan.textContent = isOpen ? 'свернуть' : 'инфо';
      }
    });
  }

  // discord copy
  const discordCopyBtn = document.getElementById('discordCopyBtn');
  if (discordCopyBtn) {
    discordCopyBtn.addEventListener('click', () => {
      const tag = 'morsonovich';
      navigator.clipboard.writeText(tag).then(() => {
        showToast('✓ скопировано: morsonovich');
      }).catch(() => {
        showToast('discord: morsonovich');
      });
    });
  }

  function showToast(text) {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // typewriter effect
  const roleTextElem = document.getElementById('roleText');
  const roles = [
    'Артём • Морс • Морсонович',
    'Minecraft plugin dev',
    'ex-founder @ MintStudio',
    'Python / Rust / Java / JS',
    't.me/retr0gradn1y'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeWriter() {
    if (!roleTextElem) return;
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      roleTextElem.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      roleTextElem.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 25 : 55;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 300;
    }

    setTimeout(typeWriter, speed);
  }
  typeWriter();

  // fullscreen toggle
  const fullscreenBtn = document.getElementById('fullscreenToggleBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // view counter
  const viewCountText = document.getElementById('viewCountText');
  let views = parseInt(localStorage.getItem('morsonovich-views') || '1341', 10);
  views += 1;
  localStorage.setItem('morsonovich-views', views);
  if (viewCountText) {
    viewCountText.textContent = views.toLocaleString();
  }

  // bespoke smooth custom cursor (desktop only)
  const cursorDot = document.getElementById('cursorDot');
  const cursorOutline = document.getElementById('cursorOutline');

  if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // hover reactions on links/buttons
    const hoverTargets = document.querySelectorAll('a, button, .social-card-btn, .bio-toggle, .enter-box');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorOutline.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hovered'));
    });
  }
});
