/**
 * =================================================================
 * MORSONOVICH BIOLINK - INTERACTIVE JAVASCRIPT
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= 1. АВТОЗАПУСК ФОНОВОГО ВИДЕО =================
  const bgVideo = document.getElementById('backgroundVideo');
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.setAttribute('playsinline', '');
    bgVideo.setAttribute('muted', '');
    bgVideo.setAttribute('autoplay', '');
    
    const playVid = () => {
      bgVideo.play().catch(e => console.log('Video play policy waiting:', e));
    };
    playVid();
    ['click', 'touchstart', 'pointerdown', 'scroll'].forEach(evt => {
      document.addEventListener(evt, playVid, { once: true });
    });
  }

  // ================= 2. АНИМАЦИЯ НАЗВАНИЯ ВКЛАДКИ =================
  const titleFrames = [
    '@M',
    '@Mo',
    '@Mor',
    '@Mors',
    '@Morso',
    '@Morson',
    '@Morsonov',
    '@Morsonovi',
    '@Morsonovic',
    '@Morsonovich',
    '@Morsonovich ⚡',
    '@Morsonovich',
    '@Morsonovic',
    '@Morsonovi',
    '@Morsonov',
    '@Morson',
    '@Morso',
    '@Mors',
    '@Mor',
    '@Mo'
  ];
  let titleIndex = 0;
  setInterval(() => {
    document.title = titleFrames[titleIndex % titleFrames.length];
    titleIndex++;
  }, 260);

  // ================= 3. АВТОЗАПУСК МУЗЫКИ (MORGENSHTERN — КРАСНЫЙ ФЛАГ) =================
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const enterOverlay = document.getElementById('enterOverlay');

  let isPlaying = false;
  let hasUnlocked = false;

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
    if (!bgAudio) return Promise.reject(new Error('bgAudio not found'));
    bgAudio.volume = 0.65;
    const p = bgAudio.play();
    if (p !== undefined) {
      return p;
    }
    return Promise.resolve();
  }

  let isUnlocking = false;

  function unlockAndPlay() {
    if (hasUnlocked && isPlaying) return;
    if (isUnlocking) return;
    isUnlocking = true;

    // Снимаем блокировку аудио-подсистемы Web Audio API (для iOS/Safari/Chrome)
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
      console.warn('Playback error on user gesture:', err);
      // Повторная попытка через 100мс
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

  // 1. Попытка немедленного автозапуска без клика (если браузер позволяет)
  startMusic().then(() => {
    // Автозапуск удался сразу при входе!
    hasUnlocked = true;
    handlePlaybackSuccess();
  }).catch((err) => {
    // Браузер заблокировал холодный автоплей без взаимодействия (NotAllowedError)
    console.log('Autoplay blocked by browser policy, awaiting user touch/click:', err);
  });

  // 2. Любой клик или тап в любом месте экрана мгновенно запускает трек
  if (enterOverlay) {
    enterOverlay.addEventListener('click', unlockAndPlay);
    enterOverlay.addEventListener('touchstart', unlockAndPlay, { passive: true });
    enterOverlay.addEventListener('pointerdown', unlockAndPlay);
  }
  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAndPlay, { passive: true });
  });

  // Слушатели событий самого аудио-элемента
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

    // Резервный перезапуск при завершении трека (гарантия непрерывного зацикливания)
    bgAudio.addEventListener('ended', () => {
      bgAudio.currentTime = 0;
      startMusic().catch(() => {});
    });

    // Обработка ошибок декодирования: автопереключение на резервный файл
    bgAudio.addEventListener('error', (e) => {
      console.warn('bgAudio error, attempting fallback source...', e);
      if (!bgAudio.src.includes('media/audio/background.mp3')) {
        bgAudio.src = 'media/audio/background.mp3';
        bgAudio.load();
        if (hasUnlocked) startMusic().catch(() => {});
      }
    });
  }

  // Возобновление при возвращении на вкладку
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasUnlocked && bgAudio && bgAudio.paused && isPlaying) {
      startMusic().catch(() => {});
    }
  });

  // Кнопка ручного переключения в шапке
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

  // ================= 4. РАСКРЫТИЕ ПОДРОБНОГО ДОСЬЕ =================
  const dossierToggleBtn = document.getElementById('dossierToggleBtn');
  const dossierPanel = document.getElementById('dossierPanel');

  if (dossierToggleBtn && dossierPanel) {
    dossierToggleBtn.addEventListener('click', () => {
      dossierToggleBtn.classList.toggle('open');
      dossierPanel.classList.toggle('open');
    });
  }

  // ================= 5. КОПИРОВАНИЕ ДИСКОРДА =================
  const discordCopyBtn = document.getElementById('discordCopyBtn');
  if (discordCopyBtn) {
    discordCopyBtn.addEventListener('click', () => {
      const discordTag = 'morsonovich';
      navigator.clipboard.writeText(discordTag).then(() => {
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
    }, 2500);
  }

  // ================= 6. БЕГУЩАЯ СТРОКА НА ОСНОВЕ ВАШЕГО ДОСЬЕ =================
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
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      roleTextElem.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      roleTextElem.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 30 : 65;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 350;
    }

    setTimeout(typeWriter, speed);
  }
  typeWriter();

  // ================= 7. ПОЛНОЭКРАННЫЙ РЕЖИМ (FULLSCREEN) =================
  const fullscreenBtn = document.getElementById('fullscreenToggleBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Fullscreen error:', err);
        });
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // ================= 8. СЧЁТЧИК ПРОСМОТРОВ =================
  const viewCountText = document.getElementById('viewCountText');
  let views = parseInt(localStorage.getItem('morsonovich-views') || '1341', 10);
  views += 1;
  localStorage.setItem('morsonovich-views', views);
  if (viewCountText) {
    viewCountText.textContent = views.toLocaleString();
  }

  // ================= 9. ЭФФЕКТ КУРСОРА =================
  if (window.fairyDustCursor) {
    try {
      new fairyDustCursor({
        colors: ['#00f0ff', '#ff2a55', '#ffffff']
      });
    } catch (e) {}
  }
});
