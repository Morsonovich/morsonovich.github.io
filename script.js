/**
 * =================================================================
 * MORSONOVICH BIOLINK - INTERACTIVE JAVASCRIPT
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= 1. АНИМАЦИЯ НАЗВАНИЯ ВКЛАДКИ =================
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

  // ================= 2. CANVAS АНИМАЦИЯ КИБЕР-ЧАСТИЦ =================
  const canvas = document.getElementById('cyberCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const particleCount = Math.min(window.innerWidth < 768 ? 35 : 75, 80);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 240, 255,' : 'rgba(239, 68, 68,' // с красным оттенком под Красный флаг
    });
  }

  let mouseX = width / 2;
  let mouseY = height / 2;

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + '0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff2a55';
      ctx.fill();

      // Линии между близкими частицами
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 60, 100, ${0.14 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // ================= 3. ПОЛНОЭКРАННЫЙ РЕЖИМ (FULLSCREEN) =================
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

  // ================= 4. МУЗЫКА: MORGENSHTERN — КРАСНЫЙ ФЛАГ =================
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicStatusText = document.getElementById('musicStatusText');
  let isPlaying = false;

  function toggleMusic() {
    if (!bgAudio) return;
    if (!isPlaying) {
      bgAudio.volume = 0.6;
      bgAudio.play().then(() => {
        isPlaying = true;
        musicStatusText.textContent = '▶ MORGENSHTERN — Красный флаг';
        musicToggleBtn.classList.add('playing');
      }).catch(err => {
        console.log('Audio playback waiting for user click:', err);
      });
    } else {
      bgAudio.pause();
      isPlaying = false;
      musicStatusText.textContent = '⏸ MORGENSHTERN — Красный флаг';
      musicToggleBtn.classList.remove('playing');
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Автозапуск при первом клике в любой точке экрана
  const playOnFirstInteraction = () => {
    if (!isPlaying && bgAudio) {
      bgAudio.volume = 0.6;
      bgAudio.play().then(() => {
        isPlaying = true;
        musicStatusText.textContent = '▶ MORGENSHTERN — Красный флаг';
        if (musicToggleBtn) musicToggleBtn.classList.add('playing');
      }).catch(() => {});
    }
    document.removeEventListener('click', playOnFirstInteraction);
  };
  document.addEventListener('click', playOnFirstInteraction, { once: true });

  // ================= 5. 3D TILT НАКЛОН КАРТОЧКИ =================
  const tiltCard = document.getElementById('tiltCard');
  const cardGlare = document.getElementById('cardGlare');

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!tiltCard) return;

    const rect = tiltCard.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
    const deltaY = (e.clientY - cardCenterY) / (window.innerHeight / 2);

    const maxTilt = 10;
    const rotateY = deltaX * maxTilt;
    const rotateX = -deltaY * maxTilt;

    tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

    if (cardGlare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      cardGlare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.14) 0%, transparent 60%)`;
    }
  });

  document.addEventListener('mouseleave', () => {
    if (tiltCard) {
      tiltCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    }
  });

  // ================= 6. ПЕЧАТНАЯ МАШИНКА ДЛЯ РОЛЕЙ =================
  const roleTextElem = document.getElementById('roleText');
  const roles = [
    'Lead Java & Web Developer',
    'MORSPVO System Creator',
    'HighLoad Minecraft Architect',
    'Founder of EZ Clan'
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

    let speed = isDeleting ? 35 : 75;

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

  // ================= 7. СЧЁТЧИК ПРОСМОТРОВ =================
  const viewCountText = document.getElementById('viewCountText');
  let views = parseInt(localStorage.getItem('morsonovich-views') || '1337', 10);
  views += 1;
  localStorage.setItem('morsonovich-views', views);
  if (viewCountText) {
    viewCountText.textContent = views.toLocaleString();
  }

  // ================= 8. ЭФФЕКТ КУРСОРА =================
  if (window.fairyDustCursor) {
    try {
      new fairyDustCursor({
        colors: ['#00f0ff', '#ff2a55', '#ffffff']
      });
    } catch (e) {}
  }
});
