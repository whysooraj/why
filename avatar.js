// avatar.js - Spiderman with headphones 3D parallax tilt, lofi music groove & interactive quotes
(function () {
  'use strict';

  const card = document.getElementById('spidey-card');
  const cardWrap = document.querySelector('.spidey-card-wrap');
  const notesLayer = document.getElementById('music-notes-layer');
  const bubble = document.getElementById('avatar-bubble');

  if (!card) return;

  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovered = false;

  // 1. 3D Parallax Tilt
  window.addEventListener('mousemove', (e) => {
    if (!cardWrap) return;
    const rect = cardWrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);

    // Limit rotation to max 14 degrees
    targetRotY = Math.max(-14, Math.min(14, dx * 16));
    targetRotX = Math.max(-14, Math.min(14, -dy * 16));
  });

  cardWrap.addEventListener('mouseenter', () => { isHovered = true; });
  cardWrap.addEventListener('mouseleave', () => {
    isHovered = false;
    targetRotX = 0;
    targetRotY = 0;
  });

  function updateCardTilt() {
    currentRotX += (targetRotX - currentRotX) * 0.1;
    currentRotY += (targetRotY - currentRotY) * 0.1;

    if (card) {
      card.style.transform = `perspective(600px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) ${isHovered ? 'scale3d(1.03, 1.03, 1.03)' : ''}`;
    }
    requestAnimationFrame(updateCardTilt);
  }
  requestAnimationFrame(updateCardTilt);

  // 2. Floating Lo-fi Music Notes
  const noteSymbols = ['♪', '♫', '♩', '♬'];
  function spawnNote() {
    if (!notesLayer) return;
    const note = document.createElement('span');
    note.className = 'music-note';
    note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];

    // Left or right headphone ear
    const fromRight = Math.random() > 0.4;
    note.style.right = fromRight ? `${10 + Math.random() * 15}px` : `${100 + Math.random() * 15}px`;
    note.style.top = `${70 + Math.random() * 30}px`;

    notesLayer.appendChild(note);

    setTimeout(() => {
      note.remove();
    }, 2400);
  }

  // Periodic note spawn
  setInterval(() => {
    if (Math.random() > 0.35) spawnNote();
  }, 1900);

  // 3. Spidey Witty Quotes on Click / Poke
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
    if (window.sound) window.sound.play('poke');

    // Trigger double note burst
    spawnNote();
    setTimeout(spawnNote, 150);

    // Punch animation
    card.style.transition = 'transform 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = 'perspective(600px) scale3d(0.94, 0.94, 0.94)';
    setTimeout(() => {
      card.style.transition = '';
    }, 180);

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

  card.addEventListener('click', poke);
  window.avatar = { poke };
})();
