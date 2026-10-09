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

  // ================= АНИМИРОВАННЫЙ ЧЕРНЫЙ КОТИК С ФИОЛЕТОВЫМИ ГЛАЗАМИ (ONEKO PET) =================
  (function initBlackCatPet() {
    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const nekoEl = document.createElement('div');
    nekoEl.id = 'onekoCat';
    nekoEl.setAttribute('aria-hidden', 'true');

    const SPRITE_SIZE = 42;

    let nekoPosX = Math.max(SPRITE_SIZE, window.innerWidth / 2 + 80);
    let nekoPosY = Math.max(SPRITE_SIZE, window.innerHeight / 2 + 80);
    let mousePosX = nekoPosX;
    let mousePosY = nekoPosY;

    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation = null;
    let idleAnimationFrame = 0;
    let lastStrideTimestamp = 0;
    let alertUntil = 0;

    const spriteSets = {
      idle: [[-3, -3]],
      alert: [[-7, -3]],
      scratchSelf: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
      ],
      scratchWallN: [
        [0, 0],
        [0, -1],
      ],
      scratchWallS: [
        [-7, -1],
        [-6, -2],
      ],
      scratchWallE: [
        [-2, -2],
        [-2, -3],
      ],
      scratchWallW: [
        [-4, 0],
        [-4, -1],
      ],
      tired: [[-3, -2]],
      sleeping: [
        [-2, 0],
        [-2, -1],
      ],
      N: [
        [-1, -2],
        [-1, -3],
      ],
      NE: [
        [0, -2],
        [0, -3],
      ],
      E: [
        [-3, 0],
        [-3, -1],
      ],
      SE: [
        [-5, -1],
        [-5, -2],
      ],
      S: [
        [-6, -3],
        [-7, -2],
      ],
      SW: [
        [-5, -3],
        [-6, -1],
      ],
      W: [
        [-4, -2],
        [-4, -3],
      ],
      NW: [
        [-1, 0],
        [-1, -1],
      ],
    };

    function setSprite(name, frame) {
      const set = spriteSets[name] || spriteSets.idle;
      const sprite = set[frame % set.length];
      nekoEl.style.backgroundPosition = (sprite[0] * SPRITE_SIZE) + 'px ' + (sprite[1] * SPRITE_SIZE) + 'px';
    }

    function resetIdleAnimation() {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function handleIdle(timestamp) {
      idleTime += 1;

      // Периодически случайная анимация отдыха
      if (idleTime > 60 && Math.floor(Math.random() * 220) === 0 && idleAnimation === null) {
        const available = ['sleeping', 'scratchSelf'];
        if (nekoPosX < SPRITE_SIZE + 20) available.push('scratchWallW');
        if (nekoPosY < SPRITE_SIZE + 20) available.push('scratchWallN');
        if (nekoPosX > window.innerWidth - SPRITE_SIZE - 20) available.push('scratchWallE');
        if (nekoPosY > window.innerHeight - SPRITE_SIZE - 20) available.push('scratchWallS');
        idleAnimation = available[Math.floor(Math.random() * available.length)];
      }

      switch (idleAnimation) {
        case 'sleeping':
          if (idleAnimationFrame < 12) {
            setSprite('tired', 0);
            break;
          }
          setSprite('sleeping', Math.floor(idleAnimationFrame / 6));
          if (idleAnimationFrame > 260) {
            resetIdleAnimation();
          }
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(idleAnimation, Math.floor(idleAnimationFrame / 3));
          if (idleAnimationFrame > 20) {
            resetIdleAnimation();
          }
          break;
        default:
          setSprite('idle', 0);
          return;
      }
      idleAnimationFrame += 1;
    }

    function loop(timestamp) {
      if (!nekoEl.isConnected) return;
      if (!lastStrideTimestamp) lastStrideTimestamp = timestamp;

      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const distance = Math.hypot(diffX, diffY);

      // Котик рядом с курсором
      if (distance < 30) {
        handleIdle(timestamp);
      } else {
        // Котик бежит за курсором!
        if (idleTime > 30 && alertUntil === 0) {
          // Эффект "заметил курсор!" (Alert на 220мс)
          alertUntil = timestamp + 220;
          idleTime = 0;
          idleAnimation = null;
          idleAnimationFrame = 0;
        }

        if (timestamp < alertUntil) {
          setSprite('alert', 0);
        } else {
          alertUntil = 0;
          idleTime = 0;
          idleAnimation = null;

          // Шаг лапок (каждые 100мс)
          if (timestamp - lastStrideTimestamp > 100) {
            lastStrideTimestamp = timestamp;
            frameCount += 1;
          }

          // 8 направлений бега
          let direction = '';
          if (diffY / distance > 0.42) direction += 'N';
          else if (diffY / distance < -0.42) direction += 'S';
          if (diffX / distance > 0.42) direction += 'W';
          else if (diffX / distance < -0.42) direction += 'E';

          if (!direction) {
            direction = Math.abs(diffX) > Math.abs(diffY) ? (diffX > 0 ? 'W' : 'E') : (diffY > 0 ? 'N' : 'S');
          }

          setSprite(direction, frameCount);

          // Плавное 60fps движение к курсору
          const speed = distance > 350 ? Math.min(18, 7.5 + distance * 0.02) : (distance > 100 ? 7.5 : 5.0);

          nekoPosX -= (diffX / distance) * speed;
          nekoPosY -= (diffY / distance) * speed;

          nekoPosX = Math.min(Math.max(SPRITE_SIZE / 2, nekoPosX), window.innerWidth - SPRITE_SIZE / 2);
          nekoPosY = Math.min(Math.max(SPRITE_SIZE / 2, nekoPosY), window.innerHeight - SPRITE_SIZE / 2);

          nekoEl.style.left = (nekoPosX - SPRITE_SIZE / 2) + 'px';
          nekoEl.style.top = (nekoPosY - SPRITE_SIZE / 2) + 'px';
        }
      }

      requestAnimationFrame(loop);
    }

    // Единственный фоновый спрайт через чистый Data URI
    const CAT_SPRITE_B64 = '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';
    const catDataUri = 'data:image/png;base64,' + CAT_SPRITE_B64;
    nekoEl.style.width = SPRITE_SIZE + 'px';
    nekoEl.style.height = SPRITE_SIZE + 'px';
    nekoEl.style.backgroundSize = (SPRITE_SIZE * 8) + 'px ' + (SPRITE_SIZE * 4) + 'px';
    nekoEl.style.backgroundImage = 'url("' + catDataUri + '")';
    setSprite('idle', 0);
    nekoEl.style.left = (nekoPosX - SPRITE_SIZE / 2) + 'px';
    nekoEl.style.top = (nekoPosY - SPRITE_SIZE / 2) + 'px';

    document.body.appendChild(nekoEl);

    const updateTarget = (x, y) => {
      mousePosX = x;
      mousePosY = y;
    };

    window.addEventListener('mousemove', (e) => updateTarget(e.clientX, e.clientY), { passive: true });
    window.addEventListener('pointermove', (e) => updateTarget(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    requestAnimationFrame(loop);
  })();
});
