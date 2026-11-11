// avatar.js - Original hand-coded comic Spider-Man with headphones, skyline & lofi music groove
(function () {
  'use strict';

  const canvas = document.getElementById('spidey-canvas');
  const cardWrap = document.querySelector('.spidey-card-wrap');
  const bubble = document.getElementById('avatar-bubble');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  let width = 140;
  let height = 220;

  function resize() {
    width = canvas.parentElement.clientWidth || 140;
    height = canvas.parentElement.clientHeight || 220;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  let targetGazeX = 0;
  let targetGazeY = 0;
  let gazeX = 0;
  let gazeY = 0;
  let targetTilt = 0;
  let currentTilt = 0;
  let pokeTime = 0;

  // Track mouse coordinates for gaze & 3D card tilt
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);

    targetGazeX = Math.max(-4, Math.min(4, dx * 5));
    targetGazeY = Math.max(-4, Math.min(4, dy * 5));
    targetTilt = dx * 10;
  });

  // Floating music notes
  const notes = [];
  const noteChars = ['♪', '♫', '♩', '♬'];
  function spawnNote() {
    if (notes.length > 4) return;
    notes.push({
      x: 105 + (Math.random() * 12 - 6),
      y: 95,
      char: noteChars[Math.floor(Math.random() * noteChars.length)],
      alpha: 1,
      vy: -0.6 - Math.random() * 0.4,
      vx: 0.2 + Math.random() * 0.3,
      size: 11 + Math.random() * 3
    });
  }
  setInterval(() => {
    if (Math.random() > 0.4) spawnNote();
  }, 1800);

  // Render loop
  function render(now) {
    gazeX += (targetGazeX - gazeX) * 0.12;
    gazeY += (targetGazeY - gazeY) * 0.12;
    currentTilt += (targetTilt - currentTilt) * 0.08;

    const isDark = document.documentElement.classList.contains('dark');

    ctx.clearRect(0, 0, width, height);

    // 1. Comic Card Background & Cityscape
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isDark) {
      skyGrad.addColorStop(0, '#131b26');
      skyGrad.addColorStop(0.65, '#0a0d14');
      skyGrad.addColorStop(1, '#05070a');
    } else {
      skyGrad.addColorStop(0, '#7bb3d6');
      skyGrad.addColorStop(0.6, '#b5d4e8');
      skyGrad.addColorStop(1, '#e3eff7');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Comic Skyscraper Silhouettes (Background)
    ctx.fillStyle = isDark ? '#1a2433' : '#94b9d1';
    // Building 1 (Left tall)
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(44, 15);
    ctx.lineTo(44, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Building 2 (Right tall)
    ctx.fillStyle = isDark ? '#1f2b3d' : '#84aecd';
    ctx.beginPath();
    ctx.moveTo(92, 20);
    ctx.lineTo(width, 40);
    ctx.lineTo(width, height);
    ctx.lineTo(92, height);
    ctx.fill();

    // Halftone / grid windows
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    for (let wy = 30; wy < 120; wy += 9) {
      ctx.beginPath();
      ctx.moveTo(5, wy);
      ctx.lineTo(40, wy - 10);
      ctx.moveTo(96, wy - 5);
      ctx.lineTo(135, wy + 8);
      ctx.stroke();
    }

    // Top Hanging Spider-Logo Motif
    ctx.save();
    ctx.strokeStyle = '#c52222';
    ctx.fillStyle = '#c52222';
    ctx.lineWidth = 1.4;
    // Spider thread
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, 22);
    ctx.stroke();
    // Spider body
    ctx.beginPath();
    ctx.ellipse(70, 26, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spider legs
    ctx.beginPath();
    // Left legs
    ctx.moveTo(68, 24); ctx.lineTo(62, 20); ctx.lineTo(60, 26);
    ctx.moveTo(68, 27); ctx.lineTo(60, 27); ctx.lineTo(58, 33);
    // Right legs
    ctx.moveTo(72, 24); ctx.lineTo(78, 20); ctx.lineTo(80, 26);
    ctx.moveTo(72, 27); ctx.lineTo(80, 27); ctx.lineTo(82, 33);
    ctx.stroke();
    ctx.restore();

    // 2. Spider-Man Figure with Headphone Groove
    const groove = Math.sin(now * 0.004) * 2;
    const pokeBounce = Math.sin((now - pokeTime) * 0.02) * Math.max(0, 1 - (now - pokeTime) / 350) * 4;
    const spideyY = 138 + groove + pokeBounce;
    const spideyX = 70;

    ctx.save();
    ctx.translate(spideyX, spideyY);
    ctx.rotate((currentTilt * Math.PI) / 180);

    // Shoulder & Neck Base (Red with ink lines)
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-52, 60);
    ctx.quadraticCurveTo(-38, 28, -20, 24);
    ctx.lineTo(20, 24);
    ctx.quadraticCurveTo(38, 28, 52, 60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shoulder webbing
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-16, 24); ctx.lineTo(-38, 58);
    ctx.moveTo(16, 24); ctx.lineTo(38, 58);
    ctx.moveTo(0, 24); ctx.lineTo(0, 60);
    ctx.stroke();

    // 3. Headphone Headband (behind head)
    ctx.beginPath();
    ctx.arc(0, -6, 44, Math.PI * 1.08, Math.PI * 1.92, false);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Padded headband inner cushion
    ctx.beginPath();
    ctx.arc(0, -6, 44, Math.PI * 1.25, Math.PI * 1.75, false);
    ctx.lineWidth = 11;
    ctx.strokeStyle = '#2b2b2b';
    ctx.stroke();

    // 4. Spider-Man Head
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Webbing on Face
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 42, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = 'rgba(10, 10, 10, 0.55)';
    ctx.lineWidth = 1.2;

    // Radiating web lines
    [-155, -130, -105, -90, -75, -50, -25, 0, 25, 50, 75, 90, 105, 130, 155].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rad) * 48, Math.sin(rad) * 48);
      ctx.stroke();
    });

    // Scalloped concentric web arcs
    [13, 24, 35].forEach((r) => {
      ctx.beginPath();
      for (let a = -155; a <= 155; a += 26) {
        const rad1 = (a * Math.PI) / 180;
        const rad2 = ((a + 26) * Math.PI) / 180;
        const x1 = Math.cos(rad1) * r;
        const y1 = Math.sin(rad1) * r;
        const x2 = Math.cos(rad2) * r;
        const y2 = Math.sin(rad2) * r;
        const midR = r * 0.88;
        const midA = ((a + 13) * Math.PI) / 180;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(Math.cos(midA) * midR, Math.sin(midA) * midR, x2, y2);
      }
      ctx.stroke();
    });
    ctx.restore();

    // 5. Classic Comic Eyes (Big expressive white triangular lenses)
    function drawSpideyEye(isLeft) {
      ctx.save();
      if (!isLeft) ctx.scale(-1, 1);

      ctx.beginPath();
      // Comic eye contour
      ctx.moveTo(-19, 6);
      ctx.bezierCurveTo(-14, 20, 3, 17, 13, 13);
      ctx.bezierCurveTo(20, 8, 18, -12, 6, -20);
      ctx.bezierCurveTo(-5, -17, -15, -8, -19, 6);
      ctx.closePath();

      // White fill
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Bold black comic border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#111111';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Subtle dynamic eye lens glint / pupil feel
      ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.beginPath();
      const px = (isLeft ? gazeX : -gazeX) * 1.6;
      const py = gazeY * 1.6;
      ctx.ellipse(px + 2, py + 2, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Left Eye
    ctx.save();
    ctx.translate(-15, 2);
    drawSpideyEye(true);
    ctx.restore();

    // Right Eye
    ctx.save();
    ctx.translate(15, 2);
    drawSpideyEye(false);
    ctx.restore();

    // 6. Over-Ear Black Studio Headphones
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(side * 38, 0);
      ctx.rotate(side * -0.06);

      // Outer earcup
      ctx.fillStyle = '#111111';
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(side === -1 ? -6 : -5, -18, 11, 36, [5, 5, 5, 5]);
      ctx.fill();
      ctx.stroke();

      // Metallic silver accent ring
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(side === -1 ? -4 : -3, -15, 7, 30, [3, 3, 3, 3]);
      ctx.stroke();

      // Soft padded inner cushion
      ctx.fillStyle = '#2c2c2e';
      ctx.beginPath();
      ctx.roundRect(side === -1 ? 3 : -7, -14, 4, 28, [2, 2, 2, 2]);
      ctx.fill();

      ctx.restore();
    });

    ctx.restore(); // Restore spidey translation

    // 7. Floating Music Notes
    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.alpha -= 0.012;

      if (n.alpha <= 0) {
        notes.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = `rgba(234, 179, 8, ${n.alpha})`;
      ctx.font = `${n.size}px monospace`;
      ctx.fillText(n.char, n.x, n.y);
      ctx.restore();
    }

    // Outer subtle card border
    ctx.strokeStyle = isDark ? '#262626' : '#111111';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Witty Spidey lines on click
  const quotes = [
    'my spidey sense tingled.',
    'listening to lofi while shipping.',
    'with great power comes great debugging.',
    'careful, i made that.',
    'thwip! 🕸️',
    "don't leave me on read.",
    'talk soon :)'
  ];
  let quoteIndex = 0;
  let bubbleTimeout = null;

  function poke() {
    pokeTime = performance.now();
    if (window.sound) window.sound.play('poke');

    spawnNote();
    setTimeout(spawnNote, 120);

    if (bubble) {
      bubble.textContent = quotes[quoteIndex % quotes.length];
      quoteIndex++;
      bubble.classList.add('visible');

      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
      }, 2400);
    }
  }

  cardWrap.addEventListener('click', poke);
  window.avatar = { poke };
})();
