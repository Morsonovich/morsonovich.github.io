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
      bgVideo.play().catch(() => { });
    };
    playVid();
    ['click', 'touchstart', 'pointerdown', 'scroll'].forEach(evt => {
      document.addEventListener(evt, playVid, { once: true });
    });
  }

  // title ticker animation (NO '@', 35% chance for 'писька', otherwise 'morsonovich')
  let titleWord = Math.random() < 0.35 ? 'Писька :D' : 'Morsonovich';
  let titleCharIndex = 1;
  let titleIsDeleting = false;

  function updateTitleTicker() {
    if (!titleIsDeleting) {
      document.title = titleWord.slice(0, titleCharIndex);
      titleCharIndex++;
      if (titleCharIndex > titleWord.length) {
        titleIsDeleting = true;
        setTimeout(updateTitleTicker, 1600);
        return;
      }
    } else {
      titleCharIndex--;
      document.title = titleWord.slice(0, titleCharIndex) || titleWord[0];
      if (titleCharIndex <= 1) {
        titleIsDeleting = false;
        titleWord = Math.random() < 0.35 ? 'Писька :D' : 'Morsonovich';
        titleCharIndex = 1;
        setTimeout(updateTitleTicker, 320);
        return;
      }
    }
    setTimeout(updateTitleTicker, titleIsDeleting ? 150 : 230);
  }
  updateTitleTicker();

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
      bgVideo.play().catch(() => { });
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
    } catch (e) { }

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
      startMusic().catch(() => { });
    });

    bgAudio.addEventListener('error', () => {
      if (!bgAudio.src.includes('media/audio/background.mp3')) {
        bgAudio.src = 'media/audio/background.mp3';
        bgAudio.load();
        if (hasUnlocked) startMusic().catch(() => { });
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasUnlocked && bgAudio && bgAudio.paused && isPlaying) {
      startMusic().catch(() => { });
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

  // dossier accordion toggle (клик в любом месте по карточке, кнопке или экрану)
  const dossierToggleBtn = document.getElementById('dossierToggleBtn');
  const dossierPanel = document.getElementById('dossierPanel');
  const staticCard = document.getElementById('staticCard');

  function toggleDossier(e) {
    if (!dossierPanel) return;

    if (e) {
      // Игнорируем клики по соцсетям, ссылкам, музыке и экрану входа
      if (e.target.closest('a') || 
          e.target.closest('.social-card-btn') || 
          e.target.closest('#discordCopyBtn') || 
          e.target.closest('.top-actions') || 
          e.target.closest('#enterOverlay')) {
        return;
      }
      // Если досье уже открыто и кликают внутри для чтения/выделения — не закрываем
      if (dossierPanel.classList.contains('open') && e.target.closest('.dossier-inner')) {
        return;
      }
    }

    const isOpen = dossierPanel.classList.toggle('open');
    if (dossierToggleBtn) {
      dossierToggleBtn.classList.toggle('open', isOpen);
    }
  }

  if (dossierToggleBtn) {
    dossierToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDossier();
    });
  }

  if (staticCard) {
    staticCard.addEventListener('click', toggleDossier);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-card') && !e.target.closest('.top-nav')) {
      toggleDossier(e);
    }
  });

  // discord copy to clipboard
  const discordCopyBtn = document.getElementById('discordCopyBtn');
  if (discordCopyBtn) {
    discordCopyBtn.addEventListener('click', () => {
      const tag = 'morsonovich';
      navigator.clipboard.writeText(tag).then(() => {
        showToast('✅ Дискорд morsonovich скопирован!');
      }).catch(() => {
        showToast('Дискорд: morsonovich');
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

  // typewriter effect for roles
  const roleTextElem = document.getElementById('roleText');
  const roles = [
    'Артём • Морс • Морсонович',
    'Экс-создатель MintStudio (Minecraft)',
    'Python Developer (3 года опыта)',
    'Java Developer (2 года опыта)',
    'Rust Developer (2 года опыта)',
    'JavaScript Developer (2 года опыта)'
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
      speed = 2200;
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
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // ================= ЧЕРНЫЙ КОТИК С ФИОЛЕТОВЫМИ ГЛАЗАМИ =================
  const catContainer = document.createElement('div');
  catContainer.className = 'cursor-cat';
  catContainer.innerHTML = `
    <div class="cat-wrapper" id="catWrapper">
      <svg class="cat-svg" viewBox="0 0 48 42" width="50" height="44">
        <defs>
          <filter id="purpleCatGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Хвост -->
        <path class="cat-tail" d="M 8 26 C 2 24, 0 16, 5 12 C 7 10, 9 12, 7 15 C 4 19, 6 22, 10 24" fill="none" stroke="#1c1d2c" stroke-width="3.8" stroke-linecap="round" />
        <path d="M 8 26 C 2 24, 0 16, 5 12" fill="none" stroke="#a855f7" stroke-width="0.8" opacity="0.6" />

        <!-- Задние лапки -->
        <ellipse class="cat-paw back-paw" cx="13" cy="34" rx="4" ry="2.8" fill="#25273c" stroke="#a855f7" stroke-width="0.6" stroke-opacity="0.4" />
        <ellipse class="cat-paw back-paw-2" cx="19" cy="34" rx="4" ry="2.8" fill="#25273c" stroke="#a855f7" stroke-width="0.6" stroke-opacity="0.4" />
        
        <!-- Тело -->
        <ellipse cx="22" cy="25" rx="14" ry="10" fill="#1b1c2b" stroke="#a855f7" stroke-width="0.9" stroke-opacity="0.5" />
        
        <!-- Передние лапки -->
        <ellipse class="cat-paw front-paw" cx="28" cy="34" rx="4" ry="2.8" fill="#25273c" stroke="#a855f7" stroke-width="0.6" stroke-opacity="0.4" />
        <ellipse class="cat-paw front-paw-2" cx="34" cy="34" rx="4" ry="2.8" fill="#25273c" stroke="#a855f7" stroke-width="0.6" stroke-opacity="0.4" />
        
        <!-- Голова -->
        <circle cx="33" cy="18" r="9.5" fill="#1b1c2b" stroke="#a855f7" stroke-width="0.9" stroke-opacity="0.5" />
        
        <!-- Ушки с фиолетовыми вставками -->
        <polygon points="27,13 25,3 32,9" fill="#1b1c2b" stroke="#a855f7" stroke-width="0.6" />
        <polygon points="28,12 26,5 31,9" fill="#9333ea" />
        
        <polygon points="35,11 39,3 41,12" fill="#1b1c2b" stroke="#a855f7" stroke-width="0.6" />
        <polygon points="36,10 39,5 40,11" fill="#9333ea" />
        
        <!-- Яркие светящиеся фиолетовые глаза -->
        <g class="cat-eyes" filter="url(#purpleCatGlow)">
          <ellipse class="cat-eye" cx="30" cy="18" rx="2.8" ry="3.8" fill="#d8b4fe" />
          <ellipse class="cat-pupil" cx="30.2" cy="18" rx="0.9" ry="3" fill="#18042b" />
          <circle cx="31.2" cy="16.5" r="0.9" fill="#ffffff" />
          
          <ellipse class="cat-eye" cx="37" cy="18" rx="2.8" ry="3.8" fill="#d8b4fe" />
          <ellipse class="cat-pupil" cx="37.2" cy="18" rx="0.9" ry="3" fill="#18042b" />
          <circle cx="38.2" cy="16.5" r="0.9" fill="#ffffff" />
        </g>

        <!-- Закрытые глазки для сна -->
        <g class="cat-closed-eyes">
          <path d="M 28 19 Q 30 21.5 32 19" fill="none" stroke="#d8b4fe" stroke-width="1.5" stroke-linecap="round" />
          <path d="M 35 19 Q 37 21.5 39 19" fill="none" stroke="#d8b4fe" stroke-width="1.5" stroke-linecap="round" />
        </g>
        
        <!-- Носик и усики -->
        <polygon points="33,21.5 34.5,21.5 33.75,22.5" fill="#c084fc" />
        <line x1="26" y1="20" x2="20" y2="19" stroke="#94a3b8" stroke-width="0.9" stroke-opacity="0.8" />
        <line x1="26" y1="22" x2="19" y2="23" stroke="#94a3b8" stroke-width="0.9" stroke-opacity="0.8" />
        <line x1="41" y1="20" x2="47" y2="19" stroke="#94a3b8" stroke-width="0.9" stroke-opacity="0.8" />
        <line x1="41" y1="22" x2="48" y2="23" stroke="#94a3b8" stroke-width="0.9" stroke-opacity="0.8" />
      </svg>
      <div class="cat-sleep-z">z</div>
    </div>
  `;
  document.body.appendChild(catContainer);

  const catWrapper = document.getElementById('catWrapper');
  let catX = window.innerWidth / 2 + 60;
  let catY = window.innerHeight / 2 + 60;
  let targetX = catX;
  let targetY = catY;
  let lastMoveTime = Date.now();
  let isSleeping = false;
  let facingDirection = 1;

  const onPointerMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    lastMoveTime = Date.now();
    if (isSleeping) {
      isSleeping = false;
      catContainer.classList.remove('sleeping');
    }
  };

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  function updateCat() {
    const offsetX = facingDirection === 1 ? -28 : 28;
    const offsetY = 20;
    const desiredX = targetX + offsetX;
    const desiredY = targetY + offsetY;

    const dx = desiredX - catX;
    const dy = desiredY - catY;
    const dist = Math.hypot(dx, dy);

    if (dist > 14) {
      catContainer.classList.add('running');
      catContainer.classList.remove('sleeping');
      isSleeping = false;

      const speed = Math.min(15, Math.max(3.5, dist * 0.12));
      catX += (dx / dist) * speed;
      catY += (dy / dist) * speed;

      if (dx > 3) {
        facingDirection = 1;
        catWrapper.style.transform = 'scaleX(1)';
      } else if (dx < -3) {
        facingDirection = -1;
        catWrapper.style.transform = 'scaleX(-1)';
      }
    } else {
      catContainer.classList.remove('running');

      if (!isSleeping && Date.now() - lastMoveTime > 3000) {
        isSleeping = true;
        catContainer.classList.add('sleeping');
      }
    }

    catContainer.style.transform = `translate3d(${catX}px, ${catY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateCat);
  }
  requestAnimationFrame(updateCat);
});
