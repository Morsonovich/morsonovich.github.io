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
  let isPlaying = false;

  function startMusic() {
    if (!bgAudio) return;
    bgAudio.volume = 0.65;
    bgAudio.play().then(() => {
      isPlaying = true;
      if (musicStatusText) musicStatusText.textContent = 'MORGENSHTERN — Красный флаг';
      if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    }).catch(err => {
      console.log('Autoplay blocked by browser policy, awaiting interaction:', err);
    });
  }

  // Попытка запустить сразу при загрузке страницы
  startMusic();

  // Запуск при первом клике/касании в любом месте экрана (обход политики автоплея браузеров)
  const triggerAudioOnInteraction = () => {
    if (!isPlaying) {
      startMusic();
    }
  };
  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
    document.addEventListener(evt, triggerAudioOnInteraction, { once: true });
  });

  // Кнопка ручного переключения в шапке
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bgAudio) return;
      if (isPlaying) {
        bgAudio.pause();
        isPlaying = false;
        musicStatusText.textContent = 'Музыка на паузе';
        musicToggleBtn.classList.remove('playing');
      } else {
        startMusic();
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
