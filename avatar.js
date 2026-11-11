// avatar.js - Interactive vector avatar with cursor tracking, blinking, and speech reactions
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

  // Eye centers
  const leftEye = { x: 44, y: 56, r: 8 };
  const rightEye = { x: 76, y: 56, r: 8 };

  let targetGaze = { x: 0, y: 0 };
  let currentGaze = { x: 0, y: 0 };
  let isBlinking = false;
  let blinkProgress = 0;
  let isSmiling = false;
  let isBlushing = false;

  // Track mouse coordinates across the screen
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy) || 1;

    // Normalize and cap maximum gaze deflection to 4.5px
    const maxOffset = 4.5;
    const factor = Math.min(dist / 300, 1);
    targetGaze.x = (dx / dist) * maxOffset * factor;
    targetGaze.y = (dy / dist) * maxOffset * factor;
  });

  // Natural blink loop
  function scheduleBlink() {
    const nextBlink = 2500 + Math.random() * 4000;
    setTimeout(() => {
      triggerBlink();
      scheduleBlink();
    }, nextBlink);
  }

  function triggerBlink() {
    if (isBlinking) return;
    isBlinking = true;
    const startTime = performance.now();
    const duration = 160;

    function step(now) {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        // Sine wave peak at halfway
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

  // Draw loop
  function render() {
    // Smooth dampening towards target gaze
    currentGaze.x += (targetGaze.x - currentGaze.x) * 0.12;
    currentGaze.y += (targetGaze.y - currentGaze.y) * 0.12;

    const isDark = document.documentElement.classList.contains('dark');
    const inkColor = isDark ? '#f0f0ee' : '#141414';
    const skinColor = isDark ? '#1a1a1a' : '#fcfaf6';
    const blushColor = isDark ? 'rgba(244, 63, 94, 0.28)' : 'rgba(239, 68, 68, 0.22)';
    const hairColor = isDark ? '#262626' : '#222222';

    ctx.clearRect(0, 0, width, height);

    // 1. Face Contour
    ctx.beginPath();
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.arc(60, 62, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Hair / Cap Outline
    ctx.beginPath();
    ctx.fillStyle = hairColor;
    ctx.arc(60, 50, 39, Math.PI * 1.05, Math.PI * 1.95, false);
    ctx.quadraticCurveTo(60, 42, 60 - 38 * Math.cos(0.15), 62 - 38 * Math.sin(0.15));
    ctx.fill();

    // 3. Cheeks / Blush
    if (isBlushing) {
      ctx.fillStyle = blushColor;
      ctx.beginPath();
      ctx.arc(36, 68, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(84, 68, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Eyes & Pupils
    [leftEye, rightEye].forEach((eye) => {
      ctx.save();
      ctx.beginPath();

      // Eye contour
      const eyeHeight = eye.r * (1 - blinkProgress * 0.95);
      ctx.ellipse(eye.x, eye.y, eye.r, Math.max(1, eyeHeight), 0, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#0c0c0c' : '#ffffff';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1.4;
      ctx.fill();
      ctx.stroke();
      ctx.clip();

      // Pupil inside eye
      if (eyeHeight > 2.5) {
        ctx.beginPath();
        const px = eye.x + currentGaze.x;
        const py = eye.y + currentGaze.y;
        ctx.arc(px, py, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = inkColor;
        ctx.fill();

        // Tiny eye glint / reflection
        ctx.beginPath();
        ctx.arc(px - 1.2, py - 1.2, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      ctx.restore();
    });

    // 5. Eyebrows
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(37, 46 - (isSmiling ? 1.5 : 0));
    ctx.quadraticCurveTo(45, 43 - (isSmiling ? 2 : 0), 52, 46);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(68, 46);
    ctx.quadraticCurveTo(75, 43 - (isSmiling ? 2 : 0), 83, 46 - (isSmiling ? 1.5 : 0));
    ctx.stroke();

    // 6. Mouth
    ctx.beginPath();
    if (isSmiling) {
      ctx.arc(60, 72, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    } else {
      ctx.moveTo(54, 76);
      ctx.quadraticCurveTo(60, 79, 66, 76);
    }
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Witty quotes when poked
  const quotes = [
    'careful, i made that.',
    'hey, nice to meet you :)',
    "don't poke too hard.",
    'i reply fast. promise.',
    'looking for someone to build systems?',
    'talk soon :)',
    'working on quantum stuff today.'
  ];
  let quoteIndex = 0;
  let bubbleTimeout = null;

  function poke() {
    if (window.sound) window.sound.play('poke');
    isSmiling = true;
    isBlushing = true;

    if (bubble) {
      bubble.textContent = quotes[quoteIndex % quotes.length];
      quoteIndex++;
      bubble.classList.add('visible');

      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
        isSmiling = false;
        isBlushing = false;
      }, 2200);
    }
  }

  container.addEventListener('click', poke);
  window.avatar = { poke };
})();
