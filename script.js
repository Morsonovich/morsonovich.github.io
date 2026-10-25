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
    }};

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
    anticheat: {
      title: 'MintAntiCheat',
      category: 'Java • PaperMC • PacketEvents',
      badge: 'Релиз',
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
      badge: 'ПВО и рейды',
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
      badge: '6 плагинов',
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
      badge: 'Оружие',
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
      badge: 'RPG древо',
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
      badge: 'CLI утилиты',
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
  const modalBadge = document.getElementById('modalBadge');
  const modalCategory = document.getElementById('modalCategory');
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

    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalCategory) modalCategory.textContent = data.category;
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
        printTermLine('  <span class="term-highlight">matrix</span>       - эффект матрицы');
        printTermLine('  <span class="term-highlight">theme &lt;name&gt;</span> - сменить тему (cyan, purple, mint, red)');
        printTermLine('  <span class="term-highlight">music</span>        - управление музыкой (play, pause, vol)');
        printTermLine('  <span class="term-highlight">contact</span>      - ссылки для связи');
        printTermLine('  <span class="term-highlight">clear</span>        - очистить консоль');
        break;

      case 'whoami':
        printTermLine('👤 <span class="term-highlight">Артём (Морсонович / Морс)</span>');
        printTermLine('   Стек: Python (3г), Java / Minecraft Paper (2г), Rust (2г), JS (2г)');
        printTermLine('   Проекты: MintAntiCheat, MORSPVO, MintTowny, MorsGuns, MetaUpgrades, Rust Parsers');
        printTermLine('   Связь: TG @retr0gradn1y | Discord: morsonovich');
        break;

      case 'projects':
        printTermLine('🚀 <span class="text-cyan">Проекты:</span>');
        Object.keys(projectData).forEach(id => {
          const p = projectData[id];
          printTermLine(`  • <span class="term-highlight">${p.title}</span> - ${p.category}`);
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
});
