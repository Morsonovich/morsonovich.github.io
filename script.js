document.addEventListener('DOMContentLoaded', () => {
  // Cache cleanup
  if ('caches' in window) {
    try {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
    } catch (e) {}
  }

  // ==========================================
  // UI SOUND EFFECTS (WEB AUDIO API)
  // ==========================================
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
        osc.frequency.setValueAtTime(920, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1180, ctx.currentTime + 0.025);
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.025);
      } catch (e) {}
    },
    click() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.045);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.045);
      } catch (e) {}
    },
    tab() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } catch (e) {}
    },
    modal() {
      if (!sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        [480, 640].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.035);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.035);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.035 + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.035);
          osc.stop(ctx.currentTime + idx * 0.035 + 0.09);
        });
      } catch (e) {}
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
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.26);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}
    }
  };

  // SFX Toggle button
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const sfxSvgOn = document.getElementById('sfxSvgOn');
  const sfxSvgOff = document.getElementById('sfxSvgOff');

  function syncSfxUi() {
    if (!sfxToggleBtn) return;
    sfxToggleBtn.classList.toggle('active', sfxEnabled);
    if (sfxSvgOn) sfxSvgOn.style.display = sfxEnabled ? 'block' : 'none';
    if (sfxSvgOff) sfxSvgOff.style.display = sfxEnabled ? 'none' : 'block';
  }
  syncSfxUi();

  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('mors_sfx_enabled', sfxEnabled);
      syncSfxUi();
      if (sfxEnabled) sfx.click();
      showToast(sfxEnabled ? 'UI SFX: Включены' : 'UI SFX: Выключены');
    });
  }

  document.querySelectorAll('button, .nav-tab, .social-card-btn, .filter-pill, .term-chip, .bento-proj-item').forEach(el => {
    el.addEventListener('mouseenter', () => sfx.hover());
  });

  // ==========================================
  // SPOTLIGHT CARDS CURSOR TRACKING
  // ==========================================
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left - 120 &&
        e.clientX <= rect.right + 120 &&
        e.clientY >= rect.top - 120 &&
        e.clientY <= rect.bottom + 120
      ) {
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
    });
  }, { passive: true });

  // ==========================================
  // TITLE TICKER & LOCAL CLOCK
  // ==========================================
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

  const localClockBadge = document.getElementById('localClockBadge');
  function updateClock() {
    if (!localClockBadge) return;
    const now = new Date();
    localClockBadge.textContent = now.toTimeString().slice(0, 8);
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ==========================================
  // VIDEO AUTOPLAY
  // ==========================================
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

  // ==========================================
  // AUDIO PLAYER, DECK & SPECTRUM VISUALIZER
  // ==========================================
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  const volumeSlider = document.getElementById('volumeSlider');
  const volValText = document.getElementById('volValText');
  const enterOverlay = document.getElementById('enterOverlay');

  // Bento Audio Deck elements
  const deckPlayBtn = document.getElementById('deckPlayBtn');
  const deckStateBadge = document.getElementById('deckStateBadge');
  const deckPauseIcon = document.getElementById('deckPauseIcon');
  const deckPlayIcon = document.getElementById('deckPlayIcon');
  const audioSeekSlider = document.getElementById('audioSeekSlider');
  const audioCurrentTime = document.getElementById('audioCurrentTime');
  const audioDurationTime = document.getElementById('audioDurationTime');
  const audioSpectrumCanvas = document.getElementById('audioSpectrumCanvas');

  function formatTime(sec) {
    if (!sec || !isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

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
  let isSeeking = false;

  function hideOverlay() {
    if (enterOverlay && !enterOverlay.classList.contains('hidden')) {
      enterOverlay.classList.add('hidden');
      setTimeout(() => {
        enterOverlay.style.display = 'none';
      }, 460);
    }
  }

  function syncAudioUiState(playing) {
    isPlaying = playing;
    if (musicToggleBtn) musicToggleBtn.classList.toggle('playing', playing);
    if (musicStatusText) {
      musicStatusText.textContent = playing
        ? 'MORGENSHTERN — Бременские музыканты'
        : 'Музыка на паузе';
    }
    if (deckStateBadge) {
      deckStateBadge.textContent = playing ? 'PLAYING' : 'PAUSED';
      deckStateBadge.classList.toggle('paused', !playing);
    }
    if (deckPauseIcon) deckPauseIcon.style.display = playing ? 'block' : 'none';
    if (deckPlayIcon) deckPlayIcon.style.display = playing ? 'none' : 'block';
  }

  function handlePlaybackSuccess() {
    hideOverlay();
    syncAudioUiState(true);
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

  function toggleMusicPlayback() {
    sfx.click();
    if (!bgAudio) return;
    if (isPlaying) {
      bgAudio.pause();
      syncAudioUiState(false);
    } else {
      hasUnlocked = true;
      startMusic().then(handlePlaybackSuccess).catch(console.error);
    }
  }

  function unlockAndPlay() {
    if (hasUnlocked && isPlaying) return;
    getAudioContext();
    startMusic().then(() => {
      hasUnlocked = true;
      handlePlaybackSuccess();
      sfx.click();
    }).catch(() => {
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
    bgAudio.addEventListener('loadedmetadata', () => {
      if (audioDurationTime) audioDurationTime.textContent = formatTime(bgAudio.duration);
    });
    bgAudio.addEventListener('timeupdate', () => {
      if (audioCurrentTime) audioCurrentTime.textContent = formatTime(bgAudio.currentTime);
      if (audioDurationTime && bgAudio.duration) {
        audioDurationTime.textContent = formatTime(bgAudio.duration);
      }
      if (audioSeekSlider && !isSeeking && bgAudio.duration) {
        audioSeekSlider.value = ((bgAudio.currentTime / bgAudio.duration) * 100).toFixed(2);
      }
    });
    bgAudio.addEventListener('playing', () => {
      handlePlaybackSuccess();
    });
    bgAudio.addEventListener('pause', () => {
      if (hasUnlocked) {
        syncAudioUiState(false);
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
      toggleMusicPlayback();
    });
  }

  if (deckPlayBtn) {
    deckPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusicPlayback();
    });
  }

  if (audioSeekSlider && bgAudio) {
    audioSeekSlider.addEventListener('pointerdown', () => { isSeeking = true; });
    audioSeekSlider.addEventListener('pointerup', () => { isSeeking = false; });
    audioSeekSlider.addEventListener('input', (e) => {
      if (bgAudio.duration) {
        const pct = parseFloat(e.target.value) / 100;
        bgAudio.currentTime = pct * bgAudio.duration;
      }
    });
  }

  // Audio Spectrum Canvas Animation
  if (audioSpectrumCanvas) {
    const sCtx = audioSpectrumCanvas.getContext('2d');
    const barCount = 34;
    const barHeights = new Array(barCount).fill(3);

    function renderSpectrum(ts) {
      const w = audioSpectrumCanvas.width;
      const h = audioSpectrumCanvas.height;
      sCtx.clearRect(0, 0, w, h);

      const accentColor = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00e5ff';
      const vol = bgAudio ? bgAudio.volume : 0.65;
      const gap = 3;
      const barWidth = (w - gap * (barCount - 1) - 16) / barCount;

      for (let i = 0; i < barCount; i++) {
        let target = 3;
        if (isPlaying && vol > 0.01) {
          const wave1 = Math.sin(ts * 0.008 + i * 0.42) * 0.5 + 0.5;
          const wave2 = Math.cos(ts * 0.013 - i * 0.27) * 0.5 + 0.5;
          const centerWeight = 1 - Math.abs(i - barCount / 2) / (barCount / 1.6);
          target = Math.max(4, (wave1 * 0.6 + wave2 * 0.4) * (h - 10) * Math.max(0.3, centerWeight) * Math.min(1, vol + 0.25));
        }
        barHeights[i] += (target - barHeights[i]) * 0.22;
        const bh = Math.max(3, barHeights[i]);
        const x = 8 + i * (barWidth + gap);
        const y = h - bh - 4;

        sCtx.fillStyle = accentColor;
        sCtx.globalAlpha = isPlaying ? 0.85 : 0.28;
        sCtx.beginPath();
        sCtx.roundRect(x, y, barWidth, bh, 1.5);
        sCtx.fill();
      }
      sCtx.globalAlpha = 1;
      requestAnimationFrame(renderSpectrum);
    }
    requestAnimationFrame(renderSpectrum);
  }

  // ==========================================
  // THEME SWITCHER
  // ==========================================
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
        showToast('Акцентная тема: ' + theme.toUpperCase());
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-dropdown-wrap')) {
        themePopover.classList.remove('open');
      }
    });
  }

  // ==========================================
  // WORKSPACE MODE SWITCH (BENTO vs CARD ONLY)
  // ==========================================
  const bentoLayout = document.getElementById('bentoLayout');
  const modeBentoBtn = document.getElementById('modeBentoBtn');
  const modeCardBtn = document.getElementById('modeCardBtn');

  if (modeBentoBtn && modeCardBtn && bentoLayout) {
    modeBentoBtn.addEventListener('click', () => {
      sfx.click();
      bentoLayout.classList.remove('card-only-mode');
      modeBentoBtn.classList.add('active');
      modeCardBtn.classList.remove('active');
    });

    modeCardBtn.addEventListener('click', () => {
      sfx.click();
      bentoLayout.classList.add('card-only-mode');
      modeCardBtn.classList.add('active');
      modeBentoBtn.classList.remove('active');
    });
  }

  // ==========================================
  // TABS NAVIGATION
  // ==========================================
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

  document.querySelectorAll('[data-goto-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.gotoTab);
    });
  });

  const brandHomeBtn = document.getElementById('brandHomeBtn');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => switchTab('bio'));
  }

  const exploreProjectsBtn = document.getElementById('exploreProjectsBtn');
  if (exploreProjectsBtn) {
    exploreProjectsBtn.addEventListener('click', () => switchTab('projects'));
  }

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && portfolioViews[initialHash]) {
    switchTab(initialHash);
  }

  // ==========================================
  // TYPEWRITER EFFECT
  // ==========================================
  const roleTextElem = document.getElementById('roleText');
  const roles = [
    'Артём • Морс • Морсонович',
    'Ex-создатель студии MintStudio',
    'Python Developer (3 года опыта)',
    'Java / PaperMC Developer (2 года опыта)',
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

    let speed = isDeleting ? 22 : 45;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 280;
    }

    setTimeout(typeWriter, speed);
  }
  typeWriter();

  // ==========================================
  // DOSSIER ACCORDION
  // ==========================================
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

  // ==========================================
  // PROJECTS FILTER & SEARCH
  // ==========================================
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

      card.style.display = (matchesCategory && matchesQuery) ? 'flex' : 'none';
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

  // ==========================================
  // PROJECT TECHNICAL CASE STUDY MODAL (ZERO PHOTOS)
  // ==========================================
  const projectData = {
    telecord: {
      codeId: 'PRJ-01',
      title: 'TeleCord — Discord & Telegram Bridge',
      category: 'Python 3.12 • aiohttp • WebSockets',
      year: '2026',
      badge: 'v2.0 • В разработке',
      desc: 'Асинхронный шлюз для двусторонней синхронизации Discord и Telegram. Транслирует сообщения, вложения и статусы активности (Rich Presence), сканирует запущенные процессы на ПК и раздаёт события в реальном времени по WebSockets.',
      specs: [
        { label: 'АРХИТЕКТУРА', val: 'Async Event Loop' },
        { label: 'ПРОТОКОЛ', val: 'WebSockets + RPC' },
        { label: 'ЗАДЕРЖКА', val: '< 15 ms' }
      ],
      codeFile: 'telecord/bridge/ws_engine.py',
      codeLang: 'Python 3.12 (aiohttp)',
      codeSnippet: `class TeleCordBridge:
    def __init__(self, tg_client: Bot, dc_rpc: PresenceMonitor):
        self.tg = tg_client
        self.rpc = dc_rpc
        self.ws_Subscribers: set[web.WebSocketResponse] = set()

    async def broadcast_event(self, event_type: str, payload: dict) -> None:
        packet = {"op": event_type, "ts": time.time(), "d": payload}
        dead = []
        for ws in self.ws_Subscribers:
            try:
                await ws.send_json(packet)
            except ConnectionResetError:
                dead.append(ws)
        for ws in dead:
            self.ws_Subscribers.discard(ws)`,
      features: [
        'Двусторонняя синхронизация сообщений и медиа между Telegram и Discord с минимальным пингом',
        'Автоматический мониторинг запущенных процессов и игр с трансляцией в статус',
        'Раздача живой телеметрии на веб-клиенты через WebSockets',
        'Поддержка кастомных профилей, бейджей и вебхуков',
        'Неблокирующий бэкенд на Python 3.12 (aiohttp + asyncio)'
      ],
      tags: ['Python 3.12', 'aiohttp', 'WebSockets', 'Telegram API', 'discord.py', 'asyncio'],
      link: 'https://github.com/morsonovich'
    },
    anticheat: {
      codeId: 'PRJ-02',
      title: 'MintAntiCheat',
      category: 'Java 21 • PaperMC • PacketEvents',
      year: '2025',
      badge: 'Релиз • 20.0 TPS',
      desc: 'Серверный античит для Minecraft (Paper / Spigot), работающий напрямую с сетевыми пакетами через PacketEvents. Вычисляет аномалии движения, ротации и CPS-распределения вне основного потока сервера.',
      specs: [
        { label: 'ПЕРЕХВАТ', val: 'Netty PacketEvents' },
        { label: 'НАГРУЗКА', val: '< 0.04 ms / tick' },
        { label: 'ДЕТЕКТЫ', val: 'Movement + Combat' }
      ],
      codeFile: 'me/mors/anticheat/check/impl/FlightPrediction.java',
      codeLang: 'Java 21 (PaperMC)',
      codeSnippet: `@Override
public void onPacketReceive(PacketReceiveEvent event) {
    if (!WrapperPlayClientPlayerFlying.isFlying(event.getPacketType())) return;
    PlayerData data = profileManager.get(event.getUser());
    double deltaY = data.getMoveProcessor().getDeltaY();
    double predicted = (data.getMoveProcessor().getLastDeltaY() - 0.08D) * 0.9800000190734863D;

    if (!data.isExempt() && Math.abs(deltaY - predicted) > 1e-4) {
        if (increaseBuffer() > MAX_THRESHOLD) flag(data, String.format("dY=%.4f", deltaY));
    } else {
        decayBuffer(0.25);
    }
}`,
      features: [
        'Предиктивный анализ физики движения: Fly, Speed, Step, Jesus, NoSlow',
        'Статистический анализ интервалов кликов и углов атаки (AutoClicker, Killaura, Reach)',
        'Встроенный GUI-инспектор для администраторов с историей флагов и пингом игрока',
        'Мгновенные уведомления в Discord через Webhook с деталями срабатывания',
        'Стабильные 20.0 TPS даже при высоком онлайне за счёт выноса математики из main thread'
      ],
      tags: ['Java 21', 'PaperMC', 'PacketEvents', 'Heuristics', 'Netty', 'Admin GUI'],
      link: 'https://github.com/morsonovich'
    },
    morspvo: {
      codeId: 'PRJ-03',
      title: 'MORSPVO & MTownyRaid',
      category: 'Java • Nexo & ItemsAdder • Towny',
      year: '2025',
      badge: 'ПВО и рейды',
      desc: 'Военно-технический плагин ПВО и рейдовых механик для серверов Towny. Реализует 54-слотовый радарный экран в GUI инвентаря, зенитно-ракетные комплексы, ракеты перехвата и кастомные 3D-модели.',
      specs: [
        { label: 'ИНТЕРФЕЙС', val: '54-Slot Radar GUI' },
        { label: 'РЕСУРСПАК', val: 'Nexo & ItemsAdder' },
        { label: 'НАВЕДЕНИЕ', val: '3D Vector Homing' }
      ],
      codeFile: 'me/mors/pvo/radar/RadarSession.java',
      codeLang: 'Java 21',
      codeSnippet: `public void updateRadarMatrix(Inventory radarGui, Location stationLoc, double range) {
    for (TrackedTarget target : airspaceTracker.getTargetsInRadius(stationLoc, range)) {
        double dx = target.getLocation().getX() - stationLoc.getX();
        double dz = target.getLocation().getZ() - stationLoc.getZ();
        int col = Math.clamp(4 + (int) Math.round((dx / range) * 4.0), 0, 8);
        int row = Math.clamp(2 + (int) Math.round((dz / range) * 2.5), 0, 5);
        radarGui.setItem(row * 9 + col, buildTargetBlip(target, stationLoc));
    }
}`,
      features: [
        'Динамический 54-слотовый радар в GUI с расчётом азимута, высоты и скорости цели',
        'Зенитно-ракетные комплексы с перехватом воздушных целей и баллистических угроз',
        'Полная интеграция с 3D-моделями, текстурами и звуками сирен через Nexo / ItemsAdder',
        'Связка с дипломатией Towny: автоматическое определение союзников и вражеских наций'
      ],
      tags: ['Java', 'Nexo Pack', 'ItemsAdder', 'Towny API', 'Radar Math', 'Sound FX'],
      link: 'https://black-minecraft.com/members/retr0gradn1y.259287/'
    },
    towny: {
      codeId: 'PRJ-04',
      title: 'MintTowny — Модульная империя',
      category: 'Java 21 • Towny Advanced Ecosystem',
      year: '2024–2025',
      badge: '6 Модулей',
      desc: 'Комплекс из 6 взаимосвязанных плагинов, расширяющих экономику, градостроительство и военные механики серверов на базе Towny Advanced.',
      specs: [
        { label: 'МОДУЛИ', val: '6 Плагинов в связке' },
        { label: 'СХЕМЫ', val: 'FAWE Async Paste' },
        { label: 'БАЗА ДАННЫХ', val: 'SQLite / HikariCP' }
      ],
      codeFile: 'me/mors/towny/blueprint/AsyncStructureBuilder.java',
      codeLang: 'Java 21 (FAWE + Towny)',
      codeSnippet: `public CompletableFuture<BuildStageResult> pasteStageAsync(Town town, Clipboard stageClip, BlockVector3 origin) {
    return CompletableFuture.supplyAsync(() -> {
        try (EditSession session = WorldEdit.getInstance().newEditSession(adapWorld)) {
            Operation op = new ClipboardHolder(stageClip).createPaste(session)
                .to(origin).ignoreAirBlocks(true).build();
            Operations.complete(op);
            return BuildStageResult.success(town.getUUID());
        }
    }, faweExecutor);
}`,
      features: [
        'MintTownyBabel: постройка Вавилонских башен с глобальными и зональными баффами',
        'MintTownyCamps: развёртывание временных осадных лагерей во время войн',
        'MintTownyColonists: NPC-рабочие на базе Citizens для добычи и логистики ресурсов',
        'MintTownyBlueprint & Builds: поэтапная постройка зданий по чертежам через FAWE',
        'MintTownyLevels: древо развития города, лимитов жителей и бонусов территории'
      ],
      tags: ['Java 21', 'Towny API', 'Citizens NPC', 'FAWE', 'SQLite', 'HikariCP'],
      link: 'https://github.com/morsonovich'
    },
    guns: {
      codeId: 'PRJ-05',
      title: 'MorsGuns',
      category: 'Java • Raycasting & Ballistics',
      year: '2025',
      badge: 'Оружейный движок',
      desc: 'Модульный оружейный движок для Minecraft с расчётом траектории выстрела, процедурной отдачей камеры, разбросом от движения и поддержкой 3D-моделей.',
      specs: [
        { label: 'БАЛЛИСТИКА', val: 'RayTrace + Penetration' },
        { label: 'ОТДАЧА', val: 'Packet Camera Recoil' },
        { label: 'МОДЕЛИ', val: 'Nexo / ItemsAdder' }
      ],
      codeFile: 'me/mors/guns/mechanic/WeaponFireHandler.java',
      codeLang: 'Java 21',
      codeSnippet: `Vector spreadDir = applyGaussianSpread(player.getEyeLocation().getDirection(),
    weapon.getBaseSpread() * (player.isSprinting() ? 1.65 : 1.0));
RayTraceResult hit = world.rayTrace(eyeLoc, spreadDir, weapon.getRange(),
    FluidCollisionMode.NEVER, true, 0.12, ent -> !ent.equals(player));
sendRecoilPacket(player, weapon.getVerticalRecoil(), weapon.getHorizontalRecoil());`,
      features: [
        'Высокоточный Raycast с учётом хитбоксов, хедшотов и прострела тонких блоков',
        'Плавная процедурная отдача камеры через пакеты ротации',
        'Кастомные звуки выстрелов, затвора, падения гильз и перезарядки',
        'Настройка любого оружия через чистые YAML-конфигурации без перекомпиляции'
      ],
      tags: ['Java', 'Raycasting', 'Nexo', 'ItemsAdder', '3D Models', 'Sound Design'],
      link: 'https://github.com/morsonovich'
    },
    metaupgrades: {
      codeId: 'PRJ-06',
      title: 'MetaUpgrades',
      category: 'Java • RPG Skill Tree GUI',
      year: '2025',
      badge: 'RPG Древо',
      desc: 'Система прокачки персонажа с визуальным древом навыков в кастомном интерфейсе, проверкой зависимостей узлов, эффектами частиц и поддержкой внешних валют.',
      specs: [
        { label: 'ГРАФ', val: 'Directed Skill Tree' },
        { label: 'РЕНДЕР', val: 'Custom GUI Canvas' },
        { label: 'ХРАНЕНИЕ', val: 'Async SQL / YAML' }
      ],
      codeFile: 'me/mors/upgrades/tree/SkillGraph.java',
      codeLang: 'Java 21',
      codeSnippet: `public UnlockStatus tryUnlockNode(Player player, String nodeId) {
    SkillNode node = nodes.get(nodeId);
    PlayerSkills profile = storage.getProfile(player.getUniqueId());
    if (!profile.containsAll(node.requiredParents())) return UnlockStatus.LOCKED_PARENT;
    if (!economy.withdraw(player, node.cost())) return UnlockStatus.INSUFFICIENT_FUNDS;
    profile.unlock(nodeId);
    node.applyModifiers(player);
    return UnlockStatus.SUCCESS;
}`,
      features: [
        'Отрисовка связей между открытыми и закрытыми ветками навыков прямо в инвентаре',
        'Гибкая система условий: уровень, валюта Vault / PlayerPoints, родительские перки',
        'Визуальные эффекты частиц и звуковое сопровождение при прокачке',
        'Экспорт плейсхолдеров в PlaceholderAPI для скорбордов и табов'
      ],
      tags: ['Java', 'GUI Canvas', 'Skill Tree', 'Vault API', 'PlaceholderAPI', 'YAML'],
      link: 'https://github.com/morsonovich'
    },
    anomalies: {
      codeId: 'PRJ-07',
      title: 'MintAnomalies & MintSpheres',
      category: 'Java • PaperMC • Particle Physics',
      year: '2024',
      badge: 'MintStudio Релиз',
      desc: 'Комплекс плагинов для анархии и сталкер/RPG серверов: генерация динамических аномальных зон с векторной физикой, спавн редких артефактов и боевые сферы с кастомными NBT/PDC-атрибутами.',
      specs: [
        { label: 'ФИЗИКА', val: 'Vector Force Fields' },
        { label: 'ЧАСТИЦЫ', val: 'Async Packet Spawn' },
        { label: 'ДАННЫЕ', val: 'PDC / Custom NBT' }
      ],
      codeFile: 'me/mors/anomalies/zone/GravitationalAnomaly.java',
      codeLang: 'Java',
      codeSnippet: `for (LivingEntity target : center.getNearbyLivingEntities(radius)) {
    Vector delta = center.toVector().subtract(target.getLocation().toVector());
    double dist = Math.max(0.75, delta.length());
    target.setVelocity(target.getVelocity().add(delta.normalize().multiply(pullForce / dist)));
}`,
      features: [
        'Несколько типов аномалий: гравитационные воронки, термические, кислотные и радиационные зоны',
        'Спавн артефактов и боевых сфер (MintSpheres) с уникальными пассивными бонусами в левой руке',
        'Отрисовка сложных геометрических фигур из частиц без просадки FPS и TPS'
      ],
      tags: ['Java', 'PaperMC', 'Particle Math', 'PersistentDataContainer', 'RPG'],
      link: 'https://black-minecraft.com/members/retr0gradn1y.259287/'
    },
    alchemy: {
      codeId: 'PRJ-08',
      title: 'MintAlchemy & MintDrugs',
      category: 'Java • Spigot / Paper • Brewing Engine',
      year: '2024',
      badge: 'MintStudio Релиз',
      desc: 'Система многоэтапной алхимии и кастомной варки для RP и анархия-серверов. Включает контроль температуры котла, времени выдержки, чистоты продукта и комбинированные эффекты.',
      specs: [
        { label: 'ДВИЖОК', val: 'Brewing State Machine' },
        { label: 'КАЧЕСТВО', val: 'Purity % Rating' },
        { label: 'КОНФИГ', val: 'Custom Recipes YAML' }
      ],
      codeFile: 'me/mors/alchemy/brew/CauldronProcess.java',
      codeLang: 'Java',
      codeSnippet: `public void tickBrewingStep() {
    int currentHeat = heatSource.measureTemperature(block.getRelative(BlockFace.DOWN));
    if (currentHeat >= activeStage.minHeat() && currentHeat <= activeStage.maxHeat()) {
        purity = Math.min(100.0, purity + activeStage.purityGainPerTick());
    } else {
        purity = Math.max(0.0, purity - 1.5);
    }
}`,
      features: [
        'Пошаговые рецепты с интерактивной проверкой температуры, ингредиентов и времени перемешивания',
        'Динамический расчёт чистоты и качества итогового предмета (влияет на силу и длительность баффов)',
        'Кастомные визуальные и звуковые эффекты при применении'
      ],
      tags: ['Java', 'Spigot / Paper', 'State Machine', 'Custom Brewing', 'YAML'],
      link: 'https://black-minecraft.com/members/retr0gradn1y.259287/'
    },
    rustparser: {
      codeId: 'PRJ-09',
      title: 'Rust Data Parsers & CLI Tools',
      category: 'Rust 2021 • Tokio • Serde • Rayon',
      year: '2025–2026',
      badge: 'CLI Утилиты',
      desc: 'Высокоскоростные утилиты и парсеры на Rust для потоковой обработки, фильтрации и агрегации тяжёлых массивов данных (большие JSON-выгрузки, логи серверов, дампы).',
      specs: [
        { label: 'МНОГОПОТОЧНОСТЬ', val: 'Tokio + Rayon' },
        { label: 'ПАМЯТЬ', val: 'Zero-Copy Slices' },
        { label: 'ПАУЗЫ GC', val: '0 ms (Native)' }
      ],
      codeFile: 'src/parser/stream_worker.rs',
      codeLang: 'Rust 2021',
      codeSnippet: `pub fn process_log_buffer<'a>(buf: &'a [u8], pattern: &str) -> Vec<LogEntry<'a>> {
    buf.par_split(|&b| b == b'\n')
       .filter(|line| !line.is_empty())
       .filter_map(|line| serde_json::from_slice::<LogEntry<'a>>(line).ok())
       .filter(|entry| entry.event.contains(pattern))
       .collect()
}`,
      features: [
        'Параллельный разбор многогигабайтных файлов за счёт Rayon и потокового чтения',
        'Десериализация без лишних аллокаций памяти (Zero-Copy Serde)',
        'Минимальный размер скомпилированного бинарника и кроссплатформенная сборка (Linux / Windows)'
      ],
      tags: ['Rust 2021', 'Tokio', 'Serde', 'Rayon', 'CLI', 'Zero-Copy'],
      link: 'https://github.com/morsonovich'
    },
    pybots: {
      codeId: 'PRJ-10',
      title: 'Telegram & Discord Боты / FastUI Бэкенды',
      category: 'Python • aiogram 3 • discord.py • FastUI',
      year: '2023–2026',
      badge: 'Production • 3 года',
      desc: 'Разработка асинхронных ботов для Telegram и Discord, веб-бэкендов на aiohttp и реактивных админ-панелей на FastUI с привязкой к базам данных и игровым серверам.',
      specs: [
        { label: 'СТЕК БОТОВ', val: 'aiogram 3 + discord.py' },
        { label: 'ВЕБ-СЛОЙ', val: 'aiohttp + FastUI' },
        { label: 'БАЗЫ ДАННЫХ', val: 'PostgreSQL / SQLite' }
      ],
      codeFile: 'app/api/admin_panel.py',
      codeLang: 'Python 3.12 (FastUI + aiohttp)',
      codeSnippet: `@router.get("/api/nodes", response_model=FastUI, response_model_exclude_none=True)
async def render_nodes_dashboard(repo: NodeRepository = Depends(get_repo)) -> list[AnyComponent]:
    stats = await repo.fetch_cluster_metrics()
    return [
        c.Page(components=[
            c.Heading(text="Cluster Telemetry", level=2),
            c.Table(data=stats, data_model=NodeMetricSchema),
        ])
    ]`,
      features: [
        'Боты для магазинов, техподдержки, модерации и привязки аккаунтов Minecraft ↔ TG/Discord',
        'Интеграция платёжных систем, вебхуков и очередей задач',
        'Построение админ-дашбордов и внутренних сервисов на базе FastUI и aiohttp'
      ],
      tags: ['Python 3.12', 'aiogram 3', 'discord.py', 'FastUI', 'aiohttp', 'PostgreSQL'],
      link: 'https://github.com/morsonovich'
    }
  };

  const projectModalOverlay = document.getElementById('projectModalOverlay');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
  const modalCodeId = document.getElementById('modalCodeId');
  const modalBadge = document.getElementById('modalBadge');
  const modalCategory = document.getElementById('modalCategory');
  const modalYear = document.getElementById('modalYear');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalSpecsGrid = document.getElementById('modalSpecsGrid');
  const modalCodeFile = document.getElementById('modalCodeFile');
  const modalCodeLang = document.getElementById('modalCodeLang');
  const modalCodeSnippet = document.getElementById('modalCodeSnippet');
  const modalFeaturesList = document.getElementById('modalFeaturesList');
  const modalTagsWrap = document.getElementById('modalTagsWrap');
  const modalLinkBtn = document.getElementById('modalLinkBtn');
  const modalOrderBtn = document.getElementById('modalOrderBtn');

  function openProjectModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;
    sfx.modal();

    if (modalCodeId) modalCodeId.textContent = data.codeId;
    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalCategory) modalCategory.textContent = data.category;
    if (modalYear) modalYear.textContent = data.year;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalDesc) modalDesc.textContent = data.desc;

    if (modalSpecsGrid && data.specs) {
      modalSpecsGrid.innerHTML = data.specs.map(s => `
        <div class="modal-spec-box">
          <span class="ms-label">${s.label}</span>
          <span class="ms-val">${s.val}</span>
        </div>
      `).join('');
    }

    if (modalCodeFile) modalCodeFile.textContent = data.codeFile || '';
    if (modalCodeLang) modalCodeLang.textContent = data.codeLang || '';
    if (modalCodeSnippet) modalCodeSnippet.textContent = data.codeSnippet || '';

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

  // ==========================================
  // INTERACTIVE CODE ARCHITECTURE VIEWER (SKILLS TAB)
  // ==========================================
  const ideSnippets = {
    python: `# telecord_bridge.py — Асинхронный WebSocket шлюз (Python 3.12 / aiohttp)
import asyncio
from aiohttp import web

class PresenceHub:
    def __init__(self) -> None:
        self.clients: set[web.WebSocketResponse] = set()
        self.current_state: dict = {"app": "TeleCord v2.0", "status": "online"}

    async def ws_handler(self, request: web.Request) -> web.WebSocketResponse:
        ws = web.WebSocketResponse(heartbeat=25.0)
        await ws.prepare(request)
        self.clients.add(ws)
        await ws.send_json({"op": "HELLO", "state": self.current_state})
        try:
            async for msg in ws:
                if msg.type == web.WSMsgType.TEXT:
                    await self.dispatch(msg.json())
        finally:
            self.clients.discard(ws)
        return ws`,

    java: `// PacketCheck.java — Пакетный перехватчик движения (Java 21 / PaperMC / PacketEvents)
package me.mors.anticheat.check;

import com.github.retrooper.packetevents.event.PacketReceiveEvent;
import com.github.retrooper.packetevents.wrapper.play.client.WrapperPlayClientPlayerFlying;

public final class VelocityPredictionCheck extends AbstractPacketCheck {
    @Override
    public void handle(PacketReceiveEvent event, PlayerProfile profile) {
        if (!WrapperPlayClientPlayerFlying.isFlying(event.getPacketType())) return;

        double deltaXZ = profile.getMovement().getDeltaXZ();
        double maxAllowed = profile.getMovement().calculateMaxSpeedAttribute();

        if (deltaXZ > maxAllowed && !profile.hasTeleportedRecently()) {
            if (incrementBuffer(1.25) >= 6.0) {
                alertStaff(profile, String.format("Speed/DeltaXZ: %.3f > %.3f", deltaXZ, maxAllowed));
            }
        } else {
            decayBuffer(0.15);
        }
    }
}`,

    rust: `// dump_parser.rs — Многопоточный парсер дампов без пауз GC (Rust 2021 / Rayon + Serde)
use rayon::prelude::*;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct PacketRecord<'a> {
    pub player_uuid: &'a str,
    pub latency_ms: u32,
    pub payload_Tag: &'a str,
}

pub fn filter_anomalous_packets<'a>(raw_blob: &'a [u8], max_ping: u32) -> Vec<PacketRecord<'a>> {
    raw_blob
        .par_split(|&byte| byte == b'\\n')
        .filter(|line| !line.is_empty())
        .filter_map(|line| serde_json::from_slice::<PacketRecord<'a>>(line).ok())
        .filter(|rec| rec.latency_ms <= max_ping)
        .collect()
}`,

    js: `// presence_socket.js — Реалтайм синхронизация статуса по WebSockets (ES6+)
export class TeleCordSocket {
  constructor(endpoint, onStateUpdate) {
    this.endpoint = endpoint;
    this.onStateUpdate = onStateUpdate;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.endpoint);
    this.ws.addEventListener('message', (event) => {
      const packet = JSON.parse(event.data);
      if (packet.op === 'PRESENCE_SYNC' || packet.op === 'HELLO') {
        this.onStateUpdate(packet.state || packet.d);
      }
    });
    this.ws.addEventListener('close', () => setTimeout(() => this.connect(), 3000));
  }
}`
  };

  const ideTabs = document.querySelectorAll('#ideTabs .ide-tab');
  const ideCodeContent = document.getElementById('ideCodeContent');
  const copyIdeCodeBtn = document.getElementById('copyIdeCodeBtn');
  let activeIdeLang = 'python';

  function renderIdeCode(lang) {
    activeIdeLang = lang;
    if (ideCodeContent) {
      ideCodeContent.textContent = ideSnippets[lang] || '';
    }
    ideTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.codeTab === lang);
    });
  }
  renderIdeCode('python');

  ideTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.click();
      renderIdeCode(tab.dataset.codeTab);
    });
  });

  if (copyIdeCodeBtn) {
    copyIdeCodeBtn.addEventListener('click', () => {
      sfx.click();
      const code = ideSnippets[activeIdeLang] || '';
      navigator.clipboard.writeText(code).then(() => {
        showToast('Код скопирован в буфер обмена');
      });
    });
  }

  // ==========================================
  // CONTACT MODAL & CLIPBOARD
  // ==========================================
  const contactModalOverlay = document.getElementById('contactModalOverlay');
  const openContactBtn = document.getElementById('openContactBtn');
  const heroHireBtn = document.getElementById('heroHireBtn');
  const closeContactModalBtn = document.getElementById('closeContactModalBtn');
  const sendTgMsgBtn = document.getElementById('sendTgMsgBtn');
  const modalCopyDiscordBtn = document.getElementById('modalCopyDiscordBtn');
  const serviceOptions = document.querySelectorAll('.service-option');

  const serviceMessages = {
    minecraft_plugin: 'Привет, Артём! Хочу заказать плагин для Minecraft. Давай обсудим ТЗ!',
    bot_development: 'Привет! Мне нужен бот для Telegram/Discord с бэкендом. Когда сможем обсудить?',
    web_service: 'Привет! Интересует разработка веб-бэкенда / парсера. Какие условия и сроки?',
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
      setTimeout(openContactModal, 220);
    });
  }
  if (closeContactModalBtn) closeContactModalBtn.addEventListener('click', closeContactModal);
  if (contactModalOverlay) {
    contactModalOverlay.addEventListener('click', (e) => {
      if (e.target === contactModalOverlay) closeContactModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (projectModalOverlay && projectModalOverlay.classList.contains('open')) closeProjectModal();
      if (contactModalOverlay && contactModalOverlay.classList.contains('open')) closeContactModal();
    }
  });

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

  // Fullscreen
  const fullscreenBtn = document.getElementById('fullscreenToggleBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      sfx.click();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    });
  }

  // ==========================================
  // INTERACTIVE ZSH TERMINAL & MATRIX FX
  // ==========================================
  const terminalScreen = document.getElementById('terminalScreen');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalForm = document.getElementById('terminalForm');
  const terminalInput = document.getElementById('terminalInput');
  const clearTermBtn = document.getElementById('clearTermBtn');
  const matrixCanvas = document.getElementById('matrixCanvas');
  const bentoMatrixBtn = document.getElementById('bentoMatrixBtn');
  const bentoCatBtn = document.getElementById('bentoCatBtn');

  let matrixRunning = false;
  let matrixInterval = null;
  const cmdHistory = [];
  let historyIdx = -1;

  const availableCommands = [
    'help', 'whoami', 'neofetch', 'projects', 'inspect',
    'skills', 'mint', 'cat', 'matrix', 'theme', 'music', 'contact', 'clear', 'sudo'
  ];

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
    const parts = cmd.split(/\s+/);
    const mainCmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (mainCmd) {
      case 'help':
        printTermLine('<span class="text-cyan">Доступные команды оболочки:</span>');
        printTermLine('  <span class="term-highlight">whoami</span>            — досье обо мне и прямые контакты');
        printTermLine('  <span class="term-highlight">neofetch</span>          — сводка о системе и стеке');
        printTermLine('  <span class="term-highlight">projects</span>          — список всех 10 проектов с ID');
        printTermLine('  <span class="term-highlight">inspect &lt;id&gt;</span>      — открыть тех. разбор проекта (напр. inspect telecord)');
        printTermLine('  <span class="term-highlight">skills</span>            — языки программирования и специализация');
        printTermLine('  <span class="term-highlight">mint</span>              — архив плагинов студии MintStudio');
        printTermLine('  <span class="term-highlight">cat</span>               — позвать котика');
        printTermLine('  <span class="term-highlight">matrix</span>            — переключить матричный фон');
        printTermLine('  <span class="term-highlight">theme &lt;name&gt;</span>      — сменить тему (cyan | purple | mint | red)');
        printTermLine('  <span class="term-highlight">music</span>             — управление треком (play | pause | vol &lt;0-100&gt;)');
        printTermLine('  <span class="term-highlight">contact</span>           — ссылки на GitHub, Telegram, Discord, BlackMinecraft');
        printTermLine('  <span class="term-highlight">clear</span>             — очистить окно терминала');
        break;

      case 'whoami':
        printTermLine('<span class="text-cyan">:: ДОСЬЕ // MORSONOVICH</span>');
        printTermLine('  Имя:      <span class="term-highlight">Артём (Морс / Морсонович)</span>');
        printTermLine('  Статус:   Бывший создатель студии <span class="term-highlight">MintStudio</span> (разработка плагинов для Minecraft)');
        printTermLine('  Стек:     Python (3 года), Java (2 года), Rust (2 года), JavaScript (2 года)');
        printTermLine('  Связь:    Telegram <span class="term-highlight">@retr0gradn1y</span> | Discord <span class="term-highlight">morsonovich</span>');
        break;

      case 'neofetch':
        printTermLine('<span class="text-cyan">mors@morsonovich</span> —————————————————————');
        printTermLine('  <span class="text-cyan">OS:</span>      Arch Linux x86_64 (Kernel 6.10.7)');
        printTermLine('  <span class="text-cyan">Host:</span>    morsonovich.github.io');
        printTermLine('  <span class="text-cyan">Focus:</span>   TeleCord v2.0 (WebSocket Bridge)');
        printTermLine('  <span class="text-cyan">Plugins:</span> 15+ (MintAntiCheat, MORSPVO, MintTowny, MorsGuns...)');
        printTermLine('  <span class="text-cyan">Audio:</span>   MORGENSHTERN — Бременские музыканты');
        break;

      case 'projects':
        printTermLine('<span class="text-cyan">:: КАТАЛОГ ПРОЕКТОВ (для открытия введите: inspect &lt;id&gt;):</span>');
        Object.keys(projectData).forEach(id => {
          const p = projectData[id];
          printTermLine(`  [${p.codeId}] <span class="term-highlight">${id.padEnd(13, ' ')}</span> — ${p.title} (${p.year})`);
        });
        break;

      case 'inspect':
        if (args[0] && projectData[args[0].toLowerCase()]) {
          const targetId = args[0].toLowerCase();
          printTermLine(`Открываю карточку архитектуры: <span class="text-cyan">${projectData[targetId].title}</span>...`);
          openProjectModal(targetId);
        } else {
          printTermLine(`Укажите ID проекта: <span class="term-highlight">inspect &lt;${Object.keys(projectData).join(' | ')}&gt;</span>`);
        }
        break;

      case 'skills':
        printTermLine('<span class="text-cyan">:: СТЕК РАЗРАБОТКИ:</span>');
        printTermLine('  • <span class="term-highlight">Python (3 года):</span>     Telegram/Discord боты, aiohttp, FastUI, бэкенд, парсеры');
        printTermLine('  • <span class="term-highlight">Java (2 года):</span>       Плагины Minecraft (Paper, Spigot, PacketEvents, Nexo)');
        printTermLine('  • <span class="term-highlight">Rust (2 года):</span>       Скоростные утилиты парсинга данных, Tokio, Serde');
        printTermLine('  • <span class="term-highlight">JavaScript (2 года):</span> Фронтенд сайтов, WebSockets, Canvas, интерфейсы');
        break;

      case 'mint':
        printTermLine('<span class="text-cyan">:: АРХИВ MINTSTUDIO (2023–2025):</span>');
        printTermLine('  Выпущено 15+ плагинов: MintAntiCheat, MORSPVO, MTownyRaid, MintTowny (6 модулей),');
        printTermLine('  MorsGuns, MetaUpgrades, MintAlchemy, MintDrugs, MintAnomalies, MintSpheres.');
        break;

      case 'cat':
        triggerCatPlay();
        printTermLine('<span class="text-cyan">[OK]</span> Чёрный кот мяукнул и сделал кульбит.');
        break;

      case 'matrix':
        toggleMatrixRain();
        printTermLine(matrixRunning ? '<span class="text-green">[ON] Матричный поток запущен.</span>' : '[OFF] Матричный поток остановлен.');
        break;

      case 'theme':
        if (args[0] && ['cyan', 'purple', 'mint', 'red'].includes(args[0].toLowerCase())) {
          applyTheme(args[0].toLowerCase());
          printTermLine(`Акцентная тема изменена на <span class="text-cyan">${args[0].toLowerCase()}</span>`);
        } else {
          printTermLine('Использование: <span class="term-highlight">theme &lt;cyan | purple | mint | red&gt;</span>');
        }
        break;

      case 'music':
        if (args[0] === 'pause') {
          if (bgAudio) bgAudio.pause();
          syncAudioUiState(false);
          printTermLine('Аудиопоток поставлен на паузу.');
        } else if (args[0] === 'play') {
          startMusic().then(handlePlaybackSuccess).catch(() => {});
          printTermLine('Воспроизведение: MORGENSHTERN — Бременские музыканты.');
        } else if (args[0] === 'vol' && args[1]) {
          const v = Math.max(0, Math.min(100, parseInt(args[1], 10))) / 100;
          if (bgAudio) bgAudio.volume = v;
          if (volumeSlider) volumeSlider.value = v;
          if (volValText) volValText.textContent = Math.round(v * 100) + '%';
          printTermLine(`Громкость установлена на ${Math.round(v * 100)}%`);
        } else {
          printTermLine('Использование: <span class="term-highlight">music play | pause | vol &lt;0-100&gt;</span>');
        }
        break;

      case 'contact':
        printTermLine('<span class="text-cyan">:: КОНТАКТЫ И РЕСУРСЫ:</span>');
        printTermLine('  Telegram:       <a href="https://t.me/retr0gradn1y" target="_blank" style="color:var(--accent);">@retr0gradn1y</a>');
        printTermLine('  Discord:        <span class="term-highlight">morsonovich</span>');
        printTermLine('  GitHub:         <a href="https://github.com/morsonovich" target="_blank" style="color:var(--accent);">github.com/morsonovich</a>');
        printTermLine('  BlackMinecraft: <a href="https://black-minecraft.com/members/retr0gradn1y.259287/" target="_blank" style="color:var(--accent);">retr0gradn1y.259287</a>');
        break;

      case 'clear':
        if (terminalOutput) terminalOutput.innerHTML = '';
        break;

      case 'sudo':
        printTermLine('<span class="text-red">sudo: permission denied for user mors (authentication key required).</span>');
        break;

      default:
        printTermLine(`zsh: command not found: <span class="text-red">${escapeHtml(cmd)}</span>. Введите <span class="term-highlight">help</span>.`);
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
        e.preventDefault();
        if (historyIdx > 0) {
          historyIdx--;
          terminalInput.value = cmdHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < cmdHistory.length - 1) {
          historyIdx++;
          terminalInput.value = cmdHistory[historyIdx] || '';
        } else {
          historyIdx = cmdHistory.length;
          terminalInput.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = terminalInput.value.trim().toLowerCase();
        if (!current) return;
        const parts = current.split(/\s+/);
        if (parts.length === 1) {
          const match = availableCommands.find(c => c.startsWith(parts[0]));
          if (match) terminalInput.value = match + (match === 'inspect' || match === 'theme' || match === 'music' ? ' ' : '');
        } else if (parts[0] === 'inspect' && parts.length === 2) {
          const projMatch = Object.keys(projectData).find(k => k.startsWith(parts[1]));
          if (projMatch) terminalInput.value = `inspect ${projMatch}`;
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

  // Matrix rain effect
  function toggleMatrixRain() {
    if (!matrixCanvas) return;
    matrixRunning = !matrixRunning;
    matrixCanvas.classList.toggle('active', matrixRunning);

    if (matrixRunning) {
      const ctx = matrixCanvas.getContext('2d');
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;

      const chars = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
      const fontSize = 15;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = Array(columns).fill(1);

      matrixInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(5, 6, 10, 0.08)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#00e5ff';
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

  if (bentoMatrixBtn) {
    bentoMatrixBtn.addEventListener('click', () => {
      sfx.click();
      toggleMatrixRain();
      showToast(matrixRunning ? 'Matrix FX: Включен' : 'Matrix FX: Выключен');
    });
  }

  window.addEventListener('resize', () => {
    if (matrixRunning && matrixCanvas) {
      matrixCanvas.width = window.innerWidth;
      matrixCanvas.height = window.innerHeight;
    }
  });

  // Views counter
  const viewCountText = document.getElementById('viewCountText');
  if (viewCountText) {
    let savedViews = parseInt(localStorage.getItem('mors_visitor_count') || '2480', 10);
    savedViews += 1;
    localStorage.setItem('mors_visitor_count', savedViews);
    viewCountText.textContent = savedViews.toLocaleString();
  }

  // ==========================================
  // ONEKO BLACK CAT PET
  // ==========================================
  let triggerCatPlay = () => {};

  (function initBlackCatPet() {
    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const nekoEl = document.createElement('div');
    nekoEl.id = 'onekoCat';
    nekoEl.setAttribute('aria-label', 'Кот');
    nekoEl.setAttribute('title', 'Кликните по котику');

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
      catBubble.style.left = (nekoPosX - 28) + 'px';
      catBubble.style.top = (nekoPosY - 50) + 'px';
      catBubble.classList.add('show');
      setTimeout(() => {
        catBubble.classList.remove('show');
      }, 2000);
    }

    triggerCatPlay = function () {
      sfx.meow();
      const phrases = [
        'Мяу!',
        'Муррр~',
        'Morsonovich',
        '20.0 TPS',
        ':3'
      ];
      showCatBubble(phrases[Math.floor(Math.random() * phrases.length)]);
      nekoEl.style.transition = 'transform 0.4s ease';
      nekoEl.style.transform = 'scale(1.22) rotate(360deg)';
      setTimeout(() => {
        nekoEl.style.transform = 'scale(1) rotate(0deg)';
      }, 420);
    };

    nekoEl.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerCatPlay();
    });

    if (bentoCatBtn) {
      bentoCatBtn.addEventListener('click', () => {
        triggerCatPlay();
      });
    }

    function resetIdleAnimation() {
      idleAnimation = null;
      idleAnimationFrame = 0;
    }

    function handleIdle() {
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
        handleIdle();
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
