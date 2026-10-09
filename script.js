/**
 * =================================================================
 * MORSONOVICH BIOLINK - INTERACTIVE LOGIC & EFFECTS
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Элементы страницы
  const welcomeScreen = document.getElementById('welcomeScreen');
  const bgAudio = document.getElementById('backgroundAudio');
  const bgVideo = document.getElementById('backgroundVideo');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeBtn = document.getElementById('volumeBtn');
  const volIconHigh = document.getElementById('volIconHigh');
  const volIconLow = document.getElementById('volIconLow');
  const volIconMuted = document.getElementById('volIconMuted');

  const tiltCard = document.getElementById('tiltCard');
  const cardGlare = document.getElementById('cardGlare');

  const infoBtn = document.getElementById('infoBtn');
  const infoModal = document.getElementById('infoModal');
  const closeInfoBtn = document.getElementById('closeInfoBtn');

  const openCabinetBtn = document.getElementById('openCabinetBtn');
  const closeCabinetBtn = document.getElementById('closeCabinetBtn');
  const cabinetOverlay = document.getElementById('cabinetOverlay');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const projectCards = document.querySelectorAll('.project-card');

  const viewsCountElem = document.getElementById('viewsCount');
  const roleTextElem = document.getElementById('roleText');

  // ================= 1. АНИМАЦИЯ НАЗВАНИЯ ВКЛАДКИ (DOCUMENT.TITLE) =================
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
  }, 280);

  // ================= 2. ЭКРАН ВХОДА (CLICK TO ENTER) =================
  welcomeScreen.addEventListener('click', handleEnter);
  welcomeScreen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') handleEnter();
  });

  function handleEnter() {
    welcomeScreen.classList.add('hidden');

    // Запуск фонового видео
    if (bgVideo) {
      bgVideo.play().catch(e => console.log('Video play error:', e));
    }

    // Запуск фоновой музыки
    if (bgAudio) {
      const savedVolume = localStorage.getItem('morsonovich-volume');
      const targetVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
      bgAudio.volume = targetVolume;
      volumeSlider.value = targetVolume;
      updateVolumeIcon(targetVolume);

      bgAudio.play().catch(err => {
        console.log('Audio autoplay blocked, requires manual interaction:', err);
      });
    }

    // Инициализация шлейфа курсора с частицами (fairy dust)
    if (window.fairyDustCursor) {
      try {
        new fairyDustCursor({
          colors: ['#00f0ff', '#ffffff', '#a855f7']
        });
      } catch (err) {
        console.log('Cursor effects init:', err);
      }
    }
  }

  // ================= 3. РЕГУЛЯТОР ГРОМКОСТИ =================
  function updateVolumeIcon(vol) {
    if (vol <= 0.01) {
      volIconHigh.style.display = 'none';
      volIconLow.style.display = 'none';
      volIconMuted.style.display = 'block';
    } else if (vol <= 0.45) {
      volIconHigh.style.display = 'none';
      volIconLow.style.display = 'block';
      volIconMuted.style.display = 'none';
    } else {
      volIconHigh.style.display = 'block';
      volIconLow.style.display = 'none';
      volIconMuted.style.display = 'none';
    }
  }

  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (bgAudio) {
      bgAudio.volume = val;
      bgAudio.muted = (val <= 0.01);
    }
    localStorage.setItem('morsonovich-volume', val);
    updateVolumeIcon(val);
  });

  let previousVolume = 0.5;
  volumeBtn.addEventListener('click', () => {
    if (!bgAudio) return;
    if (bgAudio.volume > 0.01 && !bgAudio.muted) {
      previousVolume = bgAudio.volume;
      bgAudio.volume = 0;
      bgAudio.muted = true;
      volumeSlider.value = 0;
      updateVolumeIcon(0);
      localStorage.setItem('morsonovich-volume', 0);
    } else {
      const restore = previousVolume > 0.05 ? previousVolume : 0.5;
      bgAudio.volume = restore;
      bgAudio.muted = false;
      volumeSlider.value = restore;
      updateVolumeIcon(restore);
      localStorage.setItem('morsonovich-volume', restore);
      bgAudio.play().catch(() => {});
    }
  });

  // ================= 4. 3D TILT-ЭФФЕКТ КАРТОЧКИ =================
  let isHoveringCard = false;

  document.addEventListener('mousemove', (e) => {
    if (!tiltCard) return;

    const rect = tiltCard.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
    const deltaY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

    const maxTilt = 14; // градусы
    const rotateY = deltaX * maxTilt;
    const rotateX = -deltaY * maxTilt;

    tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

    // Динамический блик света
    if (cardGlare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      cardGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)`;
    }
  });

  document.addEventListener('mouseleave', () => {
    if (tiltCard) {
      tiltCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    }
  });

  // ================= 5. АНИМАЦИЯ СМЕНЫ РОЛЕЙ (TYPEWRITER) =================
  const roles = [
    'Senior Fullstack & Java Architect',
    'MORSPVO Lead Developer',
    'HighLoad Minecraft Architect',
    'Founder of EZ Clan',
    'Custom GUI & Raytracing Specialist'
  ];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeWriterEffect() {
    const currentRole = roles[roleIndex];
    if (isDeleting) {
      roleTextElem.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      roleTextElem.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentRole.length) {
      typeSpeed = 2200; // Пауза после завершения строки
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400; // Пауза перед новым словом
    }

    setTimeout(typeWriterEffect, typeSpeed);
  }
  typeWriterEffect();

  // ================= 6. ИНФО МОДАЛКА =================
  infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    infoModal.classList.toggle('active');
  });

  closeInfoBtn.addEventListener('click', () => {
    infoModal.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (!infoModal.contains(e.target) && !infoBtn.contains(e.target)) {
      infoModal.classList.remove('active');
    }
  });

  // ================= 7. ЛИЧНЫЙ КАБИНЕТ (SHOWCASE) =================
  openCabinetBtn.addEventListener('click', () => {
    cabinetOverlay.classList.add('active');
  });

  closeCabinetBtn.addEventListener('click', () => {
    cabinetOverlay.classList.remove('active');
  });

  cabinetOverlay.addEventListener('click', (e) => {
    if (e.target === cabinetOverlay) {
      cabinetOverlay.classList.remove('active');
    }
  });

  // Фильтрация проектов по табам
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.tab;
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ================= 8. РЕАЛИСТИЧНЫЙ СЧЁТЧИК ПРОСМОТРОВ =================
  let views = parseInt(localStorage.getItem('morsonovich-views') || '1337', 10);
  views += 1;
  localStorage.setItem('morsonovich-views', views);
  if (viewsCountElem) {
    viewsCountElem.textContent = views.toLocaleString();
  }

  // ================= 9. СЕКРЕТНЫЙ РЕЖИМ (E + Z) =================
  const pressedKeys = new Set();
  document.addEventListener('keydown', (e) => {
    pressedKeys.add(e.key.toLowerCase());
    if (pressedKeys.has('e') && pressedKeys.has('z')) {
      showToast('🔥 Режим разработчика EZ активирован!');
    }
  });
  document.addEventListener('keyup', (e) => {
    pressedKeys.delete(e.key.toLowerCase());
  });

  function showToast(msg) {
    const existing = document.querySelector('.mors-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'mors-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 240, 255, 0.95);
      color: #000;
      font-weight: 700;
      padding: 10px 24px;
      border-radius: 30px;
      box-shadow: 0 0 25px rgba(0, 240, 255, 0.6);
      z-index: 10000;
      font-size: 13px;
      letter-spacing: 0.5px;
      animation: toastFade 3s ease forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
