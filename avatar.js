// avatar.js - Goofy comic-style Spider-Man wearing headphones with cursor tracking, music groove & interactions
(function () {
  'use strict';

  const canvas = document.getElementById('avatar-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const container = canvas.parentElement;
  const bubble = document.getElementById('avatar-bubble');

  let width = 120;
  let height = 120;

  function resize() {
    width = container.clientWidth || 120;
    height = container.clientHeight || 120;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Gaze & motion state
  let targetGaze = { x: 0, y: 0 };
  let currentGaze = { x: 0, y: 0 };
  let blinkProgress = 0;
  let isBlinking = false;
  let isWinking = false;
  let headTilt = 0;
  let targetTilt = 0;
  let pokeTime = 0;

  // Floating music notes
  const notes = [];
  function spawnNote() {
    if (notes.length > 3) return;
    notes.push({
      x: 95 + (Math.random() * 8 - 4),
      y: 50,
      char: Math.random() > 0.5 ? '♪' : '♫',
      alpha: 1,
      vy: -0.6 - Math.random() * 0.4,
      vx: 0.3 + Math.random() * 0.4,
      size: 11 + Math.random() * 4
    });
  }
  setInterval(() => {
    if (Math.random() > 0.4) spawnNote();
  }, 1800);

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;

    const maxOffset = 5.5;
    const factor = Math.min(dist / 320, 1);
    targetGaze.x = (dx / dist) * maxOffset * factor;
    targetGaze.y = (dy / dist) * maxOffset * factor;

    // Subtle head tilt toward mouse
    targetTilt = (dx / dist) * 0.08 * factor;
  });

  // Blink cycle
  function scheduleBlink() {
    setTimeout(() => {
      triggerBlink();
      scheduleBlink();
    }, 2400 + Math.random() * 3800);
  }

  function triggerBlink() {
    if (isBlinking) return;
    isBlinking = true;
    const start = performance.now();
    const duration = 150;

    function step(now) {
      const elapsed = now - start;
      if (elapsed < duration) {
        blinkProgress = Math.sin((elapsed / duration) * Math.PI);
        requestAnimationFrame(step);
      } else {
        blinkProgress = 0;
        isBlinking = false;
      }
    }
    requestAnimationFrame(step);
  }
  scheduleBlink();

  // Spidey eye path generator (left side, right side is mirrored)
  function drawComicEye(cx, cy, scaleX, scaleY, isLeft, blink) {
    ctx.save();
    ctx.translate(cx, cy);
    if (!isLeft) ctx.scale(-1, 1);

    // Squash eye vertically during blink
    const hScale = Math.max(0.08, 1 - blink * 0.94);
    ctx.scale(scaleX, scaleY * hScale);

    ctx.beginPath();
    // Classic comic Spidey eye contour
    ctx.moveTo(-18, 4);
    ctx.bezierCurveTo(-14, 18, 2, 16, 12, 12);
    ctx.bezierCurveTo(18, 8, 17, -10, 6, -18);
    ctx.bezierCurveTo(-4, -16, -14, -8, -18, 4);
    ctx.closePath();

    // Eye outline & white lens
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3.6;
    ctx.strokeStyle = '#111111';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Clip for inner pupil
    ctx.clip();

    // Goofy expressive pupil
    if (hScale > 0.3) {
      const px = (isLeft ? currentGaze.x : -currentGaze.x) * 1.5;
      const py = currentGaze.y * 1.5;

      ctx.beginPath();
      ctx.arc(px, py + 1, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#111111';
      ctx.fill();

      // Pupil highlight glint
      ctx.beginPath();
      ctx.arc(px - 1.4, py - 0.6, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw loop
  function render(now) {
    // Smooth dampening
    currentGaze.x += (targetGaze.x - currentGaze.x) * 0.12;
    currentGaze.y += (targetGaze.y - currentGaze.y) * 0.12;
    headTilt += (targetTilt - headTilt) * 0.1;

    // Rhythmic headphone music groove
    const musicGroove = Math.sin(now * 0.005) * 1.8;
    const pokeBounce = Math.sin((now - pokeTime) * 0.02) * Math.max(0, 1 - (now - pokeTime) / 400) * 4;
    const headY = 62 + musicGroove + pokeBounce;
    const headX = 60;

    ctx.clearRect(0, 0, width, height);

    // Save for head rotation & bob
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(headTilt);

    // 1. Headphone Headband (behind head)
    ctx.beginPath();
    ctx.arc(0, -5, 41, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#222222';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Padded headband top cushion
    ctx.beginPath();
    ctx.arc(0, -5, 41, Math.PI * 1.25, Math.PI * 1.75, false);
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#383838';
    ctx.stroke();

    // 2. Spider-Man Head / Mask
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626'; // Iconic Spidey Red
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    // 3. Webbing on Mask
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 38, 0, 0, Math.PI * 2);
    ctx.clip(); // Keep webs inside mask

    ctx.strokeStyle = 'rgba(20, 20, 20, 0.45)';
    ctx.lineWidth = 1.1;

    // Radiating web lines from center (0, 0)
    const angles = [-160, -135, -110, -90, -70, -45, -20, 0, 20, 45, 70, 90, 110, 135, 160];
    angles.forEach((ang) => {
      const rad = (ang * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rad) * 44, Math.sin(rad) * 44);
      ctx.stroke();
    });

    // Scalloped concentric curved web rings
    [12, 22, 32].forEach((r) => {
      ctx.beginPath();
      for (let a = -160; a <= 160; a += 25) {
        const rad1 = (a * Math.PI) / 180;
        const rad2 = ((a + 25) * Math.PI) / 180;
        const x1 = Math.cos(rad1) * r;
        const y1 = Math.sin(rad1) * r;
        const x2 = Math.cos(rad2) * r;
        const y2 = Math.sin(rad2) * r;
        const midR = r * 0.88;
        const midA = ((a + 12.5) * Math.PI) / 180;
        const mx = Math.cos(midA) * midR;
        const my = Math.sin(midA) * midR;
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(mx, my, x2, y2);
      }
      ctx.stroke();
    });
    ctx.restore();

    // 4. Goofy Comic Eyes
    const leftBlink = isWinking ? 1 : blinkProgress;
    const rightBlink = blinkProgress;

    // Left Eye
    drawComicEye(-14, 2, 0.88, 0.88, true, leftBlink);
    // Right Eye
    drawComicEye(14, 2, 0.88, 0.88, false, rightBlink);

    // 5. Over-Ear Headphones (Left & Right Earcups)
    const earcupY = 0;
    // Left earcup
    ctx.save();
    ctx.translate(-35, earcupY);
    ctx.rotate(-0.06);
    // Outer cup
    ctx.fillStyle = '#1c1c1c';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-5, -15, 11, 30, [5, 3, 3, 5]);
    ctx.fill();
    ctx.stroke();
    // Inner cushion
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.roundRect(3, -12, 5, 24, [2, 4, 4, 2]);
    ctx.fill();
    // Detail accent dot
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right earcup
    ctx.save();
    ctx.translate(35, earcupY);
    ctx.rotate(0.06);
    // Outer cup
    ctx.fillStyle = '#1c1c1c';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-6, -15, 11, 30, [3, 5, 5, 3]);
    ctx.fill();
    ctx.stroke();
    // Inner cushion
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 5, 24, [4, 2, 2, 4]);
    ctx.fill();
    // Detail accent dot
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // Restore head transform

    // 6. Floating Music Notes
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
      ctx.fillStyle = `rgba(180, 83, 9, ${n.alpha})`;
      ctx.font = `${n.size}px monospace`;
      ctx.fillText(n.char, n.x, n.y);
      ctx.restore();
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Witty Spidey quotes when poked
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

    // Goofy wink on poke
    isWinking = true;
    setTimeout(() => {
      isWinking = false;
    }, 450);

    spawnNote();

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

  container.addEventListener('click', poke);
  window.avatar = { poke };
})();
