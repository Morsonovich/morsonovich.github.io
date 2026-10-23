document.addEventListener('DOMContentLoaded', () => {
  // cache cleanup
  if ('caches' in window) {
    try {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => { });
    } catch (e) { }
  }

  // sound effects (web audio)
  let audioCtx = null;
  let sfxEnabled = localStorage.getItem('mors_sfx_enabled') !== 'false';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  const sfx = {
    hover() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      } catch (e) { }
    },
    click() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch (e) { }
    },
    tab() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch (e) { }
    },
    modal() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        [520, 680, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
          gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.04);
          osc.stop(ctx.currentTime + idx * 0.04 + 0.12);
        });
      } catch (e) { }
    },
    meow() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.28);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } catch (e) { }
    }
  };

  // sfx toggle
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const sfxIcon = document.getElementById('sfxIcon');
  if (sfxToggleBtn) {
    if (!sfxEnabled) {
      sfxToggleBtn.classList.remove('active');
      if (sfxIcon) sfxIcon.textContent = '🔇';
    }
    sfxToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('mors_sfx_enabled', sfxEnabled);
      sfxToggleBtn.classList.toggle('active', sfxEnabled);
      if (sfxIcon) sfxIcon.textContent = sfxEnabled ? '🔊' : '🔇';
      if (sfxEnabled) sfx.click();
      showToast(sfxEnabled ? 'Звуковые эффекты включены' : 'Звуковые эффекты выключены');
    });
  }

  // hover sounds
  document.querySelectorAll('button, .nav-tab, .social-card-btn, .filter-pill, .term-chip').forEach(el => {
    el.addEventListener('mouseenter', () => sfx.hover());
  });

  // title ticker animation (35% chance for 'Писька :D', otherwise 'Morsonovich')
  let titleWord = Math.random() < 0.35 ? 'Писька :D' : 'Morsonovich';
  let titleCharIndex = 1;
  let titleIsDeleting = false;

  function updateTitleTicker() {
    if (!titleIsDeleting) {
      document.title = titleWord.slice(0, titleCharIndex);
      titleCharIndex++;
      if (titleCharIndex > titleWord.length) {
        titleIsDeleting = true;
        setTimeout(updateTitleTicker, 1800);
        return;
      }
    } else {
      titleCharIndex--;
      document.title = titleWord.slice(0, titleCharIndex) || titleWord[0];
      if (titleCharIndex <= 1) {
        titleIsDeleting = false;
        titleWord = Math.random() < 0.35 ? 'Писька :D' : 'Morsonovich';
        titleCharIndex = 1;
        setTimeout(updateTitleTicker, 350);
        return;
      }
    }
    setTimeout(updateTitleTicker, titleIsDeleting ? 140 : 220);
  }
  updateTitleTicker();

  // video autoplay
  const bgVideo = document.getElementById('backgroundVideo');
  if (bgVideo) {
    bgVideo.muted = true;
    bgVideo.defaultMuted = true;
    bgVideo.setAttribute('playsinline', '');
    bgVideo.setAttribute('muted', '');
    bgVideo.setAttribute('autoplay', '');

    const playVid = () => bgVideo.play().catch(() => {});
    playVid();
    ['click', 'touchstart', 'pointerdown', 'scroll'].forEach(evt => {
      document.addEventListener(evt, playVid, { once: true });
    });
  }

  // audio player & unlock
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const volumeSlider = document.getElementById('volumeSlider');
  const volValText = document.getElementById('volValText');
  const enterOverlay = document.getElementById('enterOverlay');

  if (bgAudio) {
    const savedVol = localStorage.getItem('mors_audio_volume');
    const initVol = savedVol !== null ? parseFloat(savedVol) : 0.65;
    bgAudio.volume = initVol;
    if (volumeSlider) volumeSlider.value = initVol;
    if (volValText) volValText.textContent = Math.round(initVol * 100) + '%';
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      e.stopPropagation();
      const val = parseFloat(e.target.value);
      if (bgAudio) bgAudio.volume = val;
      if (volValText) volValText.textContent = Math.round(val * 100) + '%';
      localStorage.setItem('mors_audio_volume', val);
    });
  }

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
    if (musicStatusText) musicStatusText.textContent = 'MORGENSHTERN — Бременские музыканты';
    if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    if (bgVideo && bgVideo.paused) {
      bgVideo.play().catch(() => {});
    }
  }

  function startMusic() {
    if (!bgAudio) return Promise.reject(new Error('audio not found'));
    getAudioContext();
    const p = bgAudio.play();
    if (p !== undefined) return p;
    return Promise.resolve();
  }

  function unlockAndPlay() {
    if (hasUnlocked && isPlaying) return;
    getAudioContext();
    startMusic().then(() => {
      hasUnlocked = true;
      handlePlaybackSuccess();
      sfx.click();
    }).catch(err => {
      setTimeout(() => {
        startMusic().then(() => {
          hasUnlocked = true;
          handlePlaybackSuccess();
        }).catch(() => {});
      }, 100);
    });
    hideOverlay();
  }

  startMusic().then(() => {
    hasUnlocked = true;
    handlePlaybackSuccess();
  }).catch(() => {});

  if (enterOverlay) {
    enterOverlay.addEventListener('click', unlockAndPlay);
    enterOverlay.addEventListener('touchstart', unlockAndPlay, { passive: true });
    enterOverlay.addEventListener('pointerdown', unlockAndPlay);
  }
  ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (!hasUnlocked) unlockAndPlay();
    }, { once: true, passive: true });
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
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.click();
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

  // theme switcher
  const themePickerBtn = document.getElementById('themePickerBtn');
  const themePopover = document.getElementById('themePopover');
  const themeChoices = document.querySelectorAll('.theme-choice');

  const savedTheme = localStorage.getItem('mors_theme') || 'cyan';
  applyTheme(savedTheme);

  function applyTheme(themeName) {
    document.body.dataset.theme = themeName;
    themeChoices.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.setTheme === themeName);
    });
    localStorage.setItem('mors_theme', themeName);
  }

  if (themePickerBtn && themePopover) {
    themePickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.click();
      themePopover.classList.toggle('open');
    });

    themeChoices.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sfx.click();
        const theme = btn.dataset.setTheme;
        applyTheme(theme);
        themePopover.classList.remove('open');
        showToast('Тема: ' + theme);
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-dropdown-wrap')) {
        themePopover.classList.remove('open');
      }
    });
  }

  // tabs navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  const portfolioViews = {
    bio: document.getElementById('viewBio'),
    projects: document.getElementById('viewProjects'),
    skills: document.getElementById('viewSkills'),
    mint: document.getElementById('viewMint'),
    terminal: document.getElementById('viewTerminal')
  };

  function switchTab(tabKey) {
    if (!portfolioViews[tabKey]) return;
    sfx.tab();

    navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabKey);
    });

    Object.keys(portfolioViews).forEach(key => {
      const view = portfolioViews[key];
      if (view) {
        if (key === tabKey) {
          view.classList.add('active');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (key === 'terminal') {
            setTimeout(() => {
              const termInp = document.getElementById('terminalInput');
              if (termInp) termInp.focus();
            }, 100);
          }
        } else {
          view.classList.remove('active');
        }
      }
    });

    history.replaceState(null, '', '#' + tabKey);
  }

  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  const exploreProjectsBtn = document.getElementById('exploreProjectsBtn');
  if (exploreProjectsBtn) {
    exploreProjectsBtn.addEventListener('click', () => switchTab('projects'));
  }

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && portfolioViews[initialHash]) {
    switchTab(initialHash);
  }

  // typewriter effect
  const roleTextElem = document.getElementById('roleText');
  const roles = [
    'Артём • Морсонович',
    'Экс-создатель студии MintStudio',
    'Python разработчик (3 года)',
    'Java / Minecraft разработчик (2 года)',
    'Rust разработчик (2 года)',
    'JavaScript разработчик (2 года)'
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

    let speed = isDeleting ? 25 : 50;

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

  // dossier accordion
  const dossierToggleBtn = document.getElementById('dossierToggleBtn');
  const dossierPanel = document.getElementById('dossierPanel');

  if (dossierToggleBtn && dossierPanel) {
    dossierToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.click();
      const isOpen = dossierPanel.classList.toggle('open');
      dossierToggleBtn.classList.toggle('open', isOpen);
    });
  }

  // 3d tilt
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 850) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // projects filter & search
  const filterPills = document.querySelectorAll('#projectFilterPills .filter-pill');
  const projectCards = document.querySelectorAll('.project-card');
  const projectSearchInput = document.getElementById('projectSearchInput');
  let currentFilter = 'all';

  function applyProjectFilters() {
    const query = (projectSearchInput ? projectSearchInput.value : '').toLowerCase().trim();

    projectCards.forEach(card => {
      const category = card.dataset.category || '';
      const text = card.textContent.toLowerCase();
      const matchesCategory = currentFilter === 'all' || category.includes(currentFilter);
      const matchesQuery = !query || text.includes(query);

      if (matchesCategory && matchesQuery) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sfx.click();
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      applyProjectFilters();
    });
  });

  if (projectSearchInput) {
    projectSearchInput.addEventListener('input', applyProjectFilters);
  }

  // project details modal
  const projectData = {
    telecord: {
      title: 'TeleCord — Discord & Telegram Bridge',
      category: 'Python • aiohttp • WebSockets',
      year: '2026',
      badge: 'В разработке • v2.0',
      img: 'media/images/telecord_preview.jpg',
      desc: 'Шлюз для синхронизации Discord и Telegram. Транслирует сообщения, статусы активности, мониторит запущенные процессы и пушит события в реальном времени через вебсокеты.',
      features: [
        'Двусторонняя синхронизация через WebSockets с минимальной задержкой',
        'Веб-панель с кастомными анимированными рамками аватарок',
        'Автоматический трекинг процессов и игр',
        'Поддержка Discord Nitro бейджей и вебхуков Telegram',
        'Асинхронный бэкенд на Python (aiohttp)'
      ],
      tags: ['Python 3.12', 'aiohttp', 'WebSockets', 'Telegram API', 'discord.py', 'asyncio'],
      link: 'https://github.com/morsonovich'
    },
    anticheat: {
      title: 'MintAntiCheat',
      category: 'Java • PaperMC • PacketEvents',
      year: '2025',
      badge: 'Релиз',
      img: 'media/images/anticheat_preview.jpg',
      desc: 'Самописный серверный античит для Minecraft (Paper / Spigot). Перехватывает пакеты через PacketEvents и вычисляет аномалии движения и кликов без нагрузки на сервер.',
      features: [
        'Детекты на Fly, Speed, Step, Jesus, NoSlow',
        'Анализ распределения CPS и клик-паттернов (AutoClicker, Killaura)',
        'Инспектор инвентаря и перемещений в GUI для админов',
        'Логирование и алерты в Discord вебхуки',
        'Стабильные 20.0 TPS при высоком онлайне'
      ],
      tags: ['Java 21', 'PaperMC', 'PacketEvents', 'Heuristics', 'Admin GUI'],
      link: 'https://github.com/morsonovich'
    },
    morspvo: {
      title: 'MORSPVO & MTownyRaid',
      category: 'Java • Nexo & ItemsAdder',
      year: '2025',
      badge: 'ПВО и рейды',
      img: 'media/images/morspvo_preview.jpg',
      desc: 'Плагин ПВО и боевых механик для Towny. Реализует радарный экран в GUI (54 слота), зенитно-ракетные комплексы, перехват воздушных целей и звуки сирен.',
      features: [
        'Радарный экран в инвентаре с азимутом и дистанцией до цели',
        'Управляемые ракеты перехвата и ПВО комплексы',
        'Кастомные 3D-модели, текстуры и звуки сирены под Nexo / ItemsAdder',
        'Интеграция с Towny и клановыми рейдами'
      ],
      tags: ['Java', 'Nexo Pack', 'ItemsAdder', 'Radar Math', 'Sound FX'],
      link: 'https://black-minecraft.com/members/retr0gradn1y.259287/'
    },
    towny: {
      title: 'MintTowny — Модульная империя',
      category: 'Java • Towny Advanced',
      year: '2024-2025',
      badge: '6 плагинов',
      img: 'media/images/towny_preview.jpg',
      desc: 'Связка из 6 модулей для Towny серверов: Babel, Camps, Colonists, Blueprint, Builds и Levels.',
      features: [
        'MintTownyBabel: постройка башен с зональными баффами',
        'MintTownyCamps: военные лагеря для осад и рейдов',
        'MintTownyColonists: NPC-рабочие и сборщики ресурсов',
        'MintTownyBlueprint: постройка зданий по чертежам через FAWE',
        'MintTownyLevels: дерево развития города'
      ],
      tags: ['Java 21', 'Towny API', 'Citizens', 'FAWE', 'SQLite'],
      link: 'https://github.com/morsonovich'
    },
    guns: {
      title: 'MorsGuns',
      category: 'Java • Оружие и баллистика',
      year: '2025',
      badge: 'Оружие',
      img: 'media/images/morspvo_preview.jpg',
      desc: 'Модульный оружейный движок с физикой пули, процедурной отдачей, кастомными звуками перезарядки и 3D-моделями.',
      features: [
        'Raycast баллистика с рикошетом и разбросом',
        'Процедурные кривые отдачи',
        'Кастомные звуки затвора, выстрелов и вспышки',
        'Поддержка Nexo и ItemsAdder'
      ],
      tags: ['Java', 'Raycasting', 'Nexo', 'ItemsAdder', '3D Models'],
      link: 'https://github.com/morsonovich'
    },
    metaupgrades: {
      title: 'MetaUpgrades',
      category: 'Java • RPG механики',
      year: '2025',
      badge: 'RPG древо',
      img: 'media/images/towny_preview.jpg',
      desc: 'Разветвленное древо навыков персонажа с отрисовкой связей в кастомном инвентаре, частицами и удобным YAML-конфигом.',
      features: [
        'Визуальное дерево прокачки в GUI',
        'Эффекты частиц и звуки при изучении перков',
        'Удобный конфиг в YAML',
        'Интеграция с Vault, PlayerPoints и PlaceholderAPI'
      ],
      tags: ['Java', 'GUI Canvas', 'Skill Tree', 'Vault', 'YAML'],
      link: 'https://github.com/morsonovich'
    },
    rustparser: {
      title: 'Rust Data Parsers',
      category: 'Rust • CLI & Tools',
      year: '2025-2026',
      badge: 'CLI утилиты',
      img: 'media/images/telecord_preview.jpg',
      desc: 'Небольшие утилиты на расте для быстрого парсинга, валидации и перегона тяжелых массивов данных (JSON, бинарные дампы, логи).',
      features: [
        'Высокая скорость работы и низкое потребление памяти',
        'Асинхронная обработка на Tokio',
        'Быстрый парсинг JSON/дампов без GC пауз',
        'Кроссплатформенная сборка'
      ],
      tags: ['Rust', 'Tokio', 'Serde', 'CLI'],
      link: 'https://github.com/morsonovich'
    }
  };

  const projectModalOverlay = document.getElementById('projectModalOverlay');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
  const modalImg = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const modalCategory = document.getElementById('modalCategory');
  const modalYear = document.getElementById('modalYear');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalFeaturesList = document.getElementById('modalFeaturesList');
  const modalTagsWrap = document.getElementById('modalTagsWrap');
  const modalLinkBtn = document.getElementById('modalLinkBtn');
  const modalOrderBtn = document.getElementById('modalOrderBtn');

  function openProjectModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;
    sfx.modal();

    if (modalImg) modalImg.src = data.img;
    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalCategory) modalCategory.textContent = data.category;
    if (modalYear) modalYear.textContent = data.year;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;

    if (modalFeaturesList) {
      modalFeaturesList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');
    }

    if (modalTagsWrap) {
      modalTagsWrap.innerHTML = data.tags.map(t => `<span class="tag">${t}</span>`).join('');
    }

    if (modalLinkBtn) {
      modalLinkBtn.href = data.link;
    }

    if (projectModalOverlay) {
      projectModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProjectModal() {
    if (projectModalOverlay) {
      sfx.click();
      projectModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openProjectModal(btn.dataset.modal);
    });
  });

  if (closeProjectModalBtn) {
    closeProjectModalBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModalOverlay) {
    projectModalOverlay.addEventListener('click', (e) => {
      if (e.target === projectModalOverlay) closeProjectModal();
    });
  }

  // contact modal
  const contactModalOverlay = document.getElementById('contactModalOverlay');
  const openContactBtn = document.getElementById('openContactBtn');
  const heroHireBtn = document.getElementById('heroHireBtn');
  const closeContactModalBtn = document.getElementById('closeContactModalBtn');
  const sendTgMsgBtn = document.getElementById('sendTgMsgBtn');
  const modalCopyDiscordBtn = document.getElementById('modalCopyDiscordBtn');
  const serviceOptions = document.querySelectorAll('.service-option');

  const serviceMessages = {
    minecraft_plugin: 'Привет, Артём! Хочу заказать плагин для Minecraft. Давай обсудим ТЗ!',
    bot_development: 'Привет! Мне нужен бот для Telegram/Discord с бэкендом. Когда сможем начать?',
    web_service: 'Привет! Интересует разработка веб-сервиса / бэкенда. Какие сроки?',
    audit_consult: 'Привет! Нужен аудит кода или оптимизация TPS сервера. Готов обсудить детали.'
  };

  let selectedService = 'minecraft_plugin';

  function updateTgLink() {
    if (sendTgMsgBtn) {
      const text = encodeURIComponent(serviceMessages[selectedService] || serviceMessages.minecraft_plugin);
      sendTgMsgBtn.href = `https://t.me/retr0gradn1y?text=${text}`;
    }
  }
  updateTgLink();

  serviceOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      sfx.click();
      serviceOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const radio = opt.querySelector('input');
      if (radio) {
        radio.checked = true;
        selectedService = radio.value;
        updateTgLink();
      }
    });
  });

  function openContactModal() {
    sfx.modal();
    if (contactModalOverlay) {
      contactModalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeContactModal() {
    sfx.click();
    if (contactModalOverlay) {
      contactModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (openContactBtn) openContactBtn.addEventListener('click', openContactModal);
  if (heroHireBtn) heroHireBtn.addEventListener('click', openContactModal);
  if (modalOrderBtn) {
    modalOrderBtn.addEventListener('click', () => {
      closeProjectModal();
      setTimeout(openContactModal, 250);
    });
  }
  if (closeContactModalBtn) closeContactModalBtn.addEventListener('click', closeContactModal);
  if (contactModalOverlay) {
    contactModalOverlay.addEventListener('click', (e) => {
      if (e.target === contactModalOverlay) closeContactModal();
    });
  }

  // escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModalOverlay && projectModalOverlay.classList.contains('open')) closeProjectModal();
      if (contactModalOverlay && contactModalOverlay.classList.contains('open')) closeContactModal();
    }
  });

  // toast
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

  const copyDiscordAction = () => {
    sfx.click();
    navigator.clipboard.writeText('morsonovich').then(() => {
      showToast('Discord скопирован: morsonovich');
    }).catch(() => {
      showToast('Discord: morsonovich');
    });
  };

  const discordCopyBtn = document.getElementById('discordCopyBtn');
  if (discordCopyBtn) discordCopyBtn.addEventListener('click', copyDiscordAction);
  if (modalCopyDiscordBtn) modalCopyDiscordBtn.addEventListener('click', copyDiscordAction);

  // fullscreen
  const fullscreenBtn = document.getElementById('fullscreenToggleBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      sfx.click();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  // dev terminal
  const terminalScreen = document.getElementById('terminalScreen');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const clearTermBtn = document.getElementById('clearTermBtn');
  const matrixCanvas = document.getElementById('matrixCanvas');

  let matrixRunning = false;
  let matrixInterval = null;
  const cmdHistory = [];
  let historyIdx = -1;

  function printTermLine(text, className = '') {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = 'term-line ' + className;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    if (terminalScreen) terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function handleTermCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;
    cmdHistory.push(cmd);
    historyIdx = cmdHistory.length;

    printTermLine(`<span class="term-prompt">mors@pc:~$</span> ${escapeHtml(cmd)}`);
    const parts = cmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (mainCmd) {
      case 'help':
        printTermLine('<span class="text-cyan">Доступные команды:</span>');
        printTermLine('  <span class="term-highlight">whoami</span>       - обо мне и контакты');
        printTermLine('  <span class="term-highlight">projects</span>     - список моих проектов');
        printTermLine('  <span class="term-highlight">skills</span>       - навыки и технологии');
        printTermLine('  <span class="term-highlight">cat</span>          - погладить котика');
        printTermLine('  <span class="term-highlight">matrix</span>       - эффект матрицы');
        printTermLine('  <span class="term-highlight">theme &lt;name&gt;</span> - сменить тему (cyan, purple, mint, red)');
        printTermLine('  <span class="term-highlight">music</span>        - управление музыкой (play, pause, vol)');
        printTermLine('  <span class="term-highlight">contact</span>      - ссылки для связи');
        printTermLine('  <span class="term-highlight">clear</span>        - очистить консоль');
        break;

      case 'whoami':
        printTermLine('👤 <span class="term-highlight">Артём (Морсонович / Морс)</span>');
        printTermLine('   Стек: Python (3г), Java / Minecraft Paper (2г), Rust (2г), JS (2г)');
        printTermLine('   Проекты: TeleCord, MintAntiCheat, MORSPVO, MintTowny, MorsGuns');
        printTermLine('   Связь: TG @retr0gradn1y | Discord: morsonovich');
        break;

      case 'projects':
        printTermLine('🚀 <span class="text-cyan">Проекты:</span>');
        Object.keys(projectData).forEach(id => {
          const p = projectData[id];
          printTermLine(`  • <span class="term-highlight">${p.title}</span> [${p.year}] - ${p.category}`);
        });
        break;

      case 'skills':
        printTermLine('⚡ <span class="text-cyan">Стек:</span>');
        printTermLine('  🐍 Python     [==================] 95% (aiohttp, asyncio, боты)');
        printTermLine('  ☕ Java       [================= ] 90% (PaperMC, PacketEvents, GUI)');
        printTermLine('  ⚡ JavaScript [================  ] 85% (ES6+, WebSockets, Canvas)');
        printTermLine('  🦀 Rust       [===============   ] 80% (Tokio, CLI, парсеры)');
        printTermLine('  🛡️ Security   [================  ] 85% (Античит, аудит плагинов)');
        break;

      case 'cat':
        triggerCatPlay();
        printTermLine('🐾 <span class="text-cyan">Котик мяукнул и сделал сальто!</span>');
        break;

      case 'matrix':
        toggleMatrixRain();
        printTermLine(matrixRunning ? '🟢 <span class="text-green">Матрица включена.</span>' : '⚪ Матрица выключена.');
        break;

      case 'theme':
        if (args[0] && ['cyan', 'purple', 'mint', 'red'].includes(args[0].toLowerCase())) {
          applyTheme(args[0].toLowerCase());
          printTermLine(`Тема переключена на <span class="text-cyan">${args[0]}</span>`);
        } else {
          printTermLine('Использование: <span class="term-highlight">theme &lt;cyan | purple | mint | red&gt;</span>');
        }
        break;

      case 'music':
        if (args[0] === 'pause') {
          if (bgAudio) bgAudio.pause();
          printTermLine('Музыка на паузе.');
        } else if (args[0] === 'play') {
          startMusic().then(handlePlaybackSuccess).catch(() => {});
          printTermLine('Воспроизведение.');
        } else if (args[0] === 'vol' && args[1]) {
          const v = Math.max(0, Math.min(100, parseInt(args[1], 10))) / 100;
          if (bgAudio) bgAudio.volume = v;
          if (volumeSlider) volumeSlider.value = v;
          if (volValText) volValText.textContent = Math.round(v * 100) + '%';
          printTermLine(`Громкость: ${Math.round(v * 100)}%`);
        } else {
          printTermLine('Использование: <span class="term-highlight">music play | pause | vol &lt;0-100&gt;</span>');
        }
        break;

      case 'contact':
        printTermLine('📬 <span class="text-cyan">Контакты:</span>');
        printTermLine('  Telegram: <a href="https://t.me/retr0gradn1y" target="_blank" style="color:var(--accent);">@retr0gradn1y</a>');
        printTermLine('  Discord: <span class="term-highlight">morsonovich</span>');
        printTermLine('  GitHub: <a href="https://github.com/morsonovich" target="_blank" style="color:var(--accent);">github.com/morsonovich</a>');
        break;

      case 'clear':
        if (terminalOutput) terminalOutput.innerHTML = '';
        break;

      case 'sudo':
        printTermLine('🚫 <span class="text-red">[sudo] password for mors: Permission denied (publickey).</span>');
        break;

      default:
        printTermLine(`Команда не найдена: <span class="text-red">${escapeHtml(cmd)}</span>. Введите <span class="term-highlight">help</span>`);
        break;
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      terminalInput.value = '';
      handleTermCommand(val);
    });

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (historyIdx > 0) {
          historyIdx--;
          terminalInput.value = cmdHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          terminalInput.value = cmdHistory[historyIdx] || '';
        } else {
          historyIdx = cmdHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  if (clearTermBtn) {
    clearTermBtn.addEventListener('click', () => {
      sfx.click();
      if (terminalOutput) terminalOutput.innerHTML = '';
    });
  }

  document.querySelectorAll('.term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sfx.click();
      const cmd = chip.dataset.cmd;
      if (cmd) handleTermCommand(cmd);
    });
  });

  // matrix rain
  function toggleMatrixRain() {
    if (!matrixCanvas) return;
    matrixRunning = !matrixRunning;
    matrixCanvas.classList.toggle('active', matrixRunning);

    if (matrixRunning) {
      const ctx = matrixCanvas.getContext('2d');
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;

      const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
      const fontSize = 16;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = Array(columns).fill(1);

      matrixInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(5, 6, 12, 0.08)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = document.body.dataset.theme === 'red' ? '#ff2a55' : (document.body.dataset.theme === 'purple' ? '#c084fc' : '#00f0ff');
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }, 33);
    } else {
      if (matrixInterval) clearInterval(matrixInterval);
      const ctx = matrixCanvas.getContext('2d');
      ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
  }

  window.addEventListener('resize', () => {
    if (matrixRunning && matrixCanvas) {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    }
  });

  // views counter
  const viewCountText = document.getElementById('viewCountText');
  if (viewCountText) {
    let savedViews = parseInt(localStorage.getItem('mors_visitor_count') || '2480', 10);
    savedViews += 1;
    localStorage.setItem('mors_visitor_count', savedViews);
    viewCountText.textContent = savedViews.toLocaleString();
  }

  // oneko cat pet
  let triggerCatPlay = () => {};

  (function initBlackCatPet() {
    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const nekoEl = document.createElement('div');
    nekoEl.id = 'onekoCat';
    nekoEl.setAttribute('aria-label', 'Кот');
    nekoEl.setAttribute('title', 'Кликните по котику!');

    const catBubble = document.getElementById('catSpeechBubble');
    const SPRITE_SIZE = 42;

    let nekoPosX = Math.max(SPRITE_SIZE, window.innerWidth / 2 + 90);
    let nekoPosY = Math.max(SPRITE_SIZE, window.innerHeight / 2 + 90);
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
      scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
      scratchWallN: [[0, 0], [0, -1]],
      scratchWallS: [[-7, -1], [-6, -2]],
      scratchWallE: [[-2, -2], [-2, -3]],
      scratchWallW: [[-4, 0], [-4, -1]],
      tired: [[-3, -2]],
      sleeping: [[-2, 0], [-2, -1]],
      N: [[-1, -2], [-1, -3]],
      NE: [[0, -2], [0, -3]],
      E: [[-3, 0], [-3, -1]],
      SE: [[-5, -1], [-5, -2]],
      S: [[-6, -3], [-7, -2]],
      SW: [[-5, -3], [-6, -1]],
      W: [[-4, -2], [-4, -3]],
      NW: [[-1, 0], [-1, -1]],
    };

    function setSprite(name, frame) {
      const set = spriteSets[name] || spriteSets.idle;
      const sprite = set[frame % set.length];
      nekoEl.style.backgroundPosition = (sprite[0] * SPRITE_SIZE) + 'px ' + (sprite[1] * SPRITE_SIZE) + 'px';
    }

    function showCatBubble(text) {
      if (!catBubble) return;
      catBubble.textContent = text;
      catBubble.style.left = (nekoPosX - 30) + 'px';
      catBubble.style.top = (nekoPosY - 55) + 'px';
      catBubble.classList.add('show');
      setTimeout(() => {
        catBubble.classList.remove('show');
      }, 2000);
    }

    triggerCatPlay = function() {
      sfx.meow();
      const phrases = [
        'Мяу! 🐾',
        'Муррр~',
        'Морсонович',
        'Поймал курсор!',
        ':3'
      ];
      showCatBubble(phrases[Math.floor(Math.random() * phrases.length)]);
      nekoEl.style.transition = 'transform 0.4s ease';
      nekoEl.style.transform = 'scale(1.25) rotate(360deg)';
      setTimeout(() => {
        nekoEl.style.transform = 'scale(1) rotate(0deg)';
      }, 450);
    };

    nekoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCatPlay();
    });

    function resetIdleAnimation() {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function handleIdle(timestamp) {
      idleTime += 1;
      if (idleTime > 60 && Math.floor(Math.random() * 200) === 0 && idleAnimation === null) {
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
          if (idleAnimationFrame > 260) resetIdleAnimation();
          break;
        case 'scratchWallN':
        case 'scratchWallS':
        case 'scratchWallE':
        case 'scratchWallW':
        case 'scratchSelf':
          setSprite(idleAnimation, Math.floor(idleAnimationFrame / 3));
          if (idleAnimationFrame > 20) resetIdleAnimation();
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

      if (distance < 32) {
        handleIdle(timestamp);
      } else {
        if (idleTime > 30 && alertUntil === 0) {
          alertUntil = timestamp + 220;
          idleTime = 0;
          resetIdleAnimation();
        }

        if (timestamp < alertUntil) {
          setSprite('alert', 0);
        } else {
          alertUntil = 0;
          idleTime = 0;
          resetIdleAnimation();

          if (timestamp - lastStrideTimestamp > 100) {
            lastStrideTimestamp = timestamp;
            frameCount += 1;
          }

          let direction = '';
          if (diffY / distance > 0.42) direction += 'N';
          else if (diffY / distance < -0.42) direction += 'S';
          if (diffX / distance > 0.42) direction += 'W';
          else if (diffX / distance < -0.42) direction += 'E';

          if (!direction) {
            direction = Math.abs(diffX) > Math.abs(diffY) ? (diffX > 0 ? 'W' : 'E') : (diffY > 0 ? 'N' : 'S');
          }

          setSprite(direction, frameCount);

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

    requestAnimationFrame(loop);
  })();
});
