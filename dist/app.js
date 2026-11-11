// app.js - Main interactions, Vizag time offset, sound, toast, and copy helpers
(function () {
  'use strict';

  // 1. Theme Management (with View Transitions if supported)
  const themeBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function initTheme() {
    const saved = localStorage.getItem('why_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
  initTheme();

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      const willBeDark = !html.classList.contains('dark');
      if (window.sound) window.sound.play('toggle', { up: willBeDark });

      const toggle = () => {
        html.classList.toggle('dark');
        const isDark = html.classList.contains('dark');
        localStorage.setItem('why_theme', isDark ? 'dark' : 'light');
        if (window.avatar && window.avatar.onThemeChange) {
          window.avatar.onThemeChange(isDark);
        }
      };

      if (!document.startViewTransition) {
        toggle();
        return;
      }

      document.startViewTransition(toggle);
    });
  }

  // 2. Sound Toggle
  const soundBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  function updateSoundUI() {
    if (!soundIcon) return;
    const on = window.sound ? window.sound.enabled : true;
    soundIcon.innerHTML = on
      ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>`
      : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
  }
  updateSoundUI();

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (window.sound) {
        window.sound.toggle();
        updateSoundUI();
      }
    });
  }

  // 3. Dynamic Vizag Time Clock & Visitor Timezone Difference
  const timeEl = document.getElementById('ist-time');
  function updateTime() {
    if (!timeEl) return;
    try {
      const now = new Date();
      const istFmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const istStr = istFmt.format(now).toLowerCase();

      // Calculate visitor offset difference in minutes
      const visitorOffset = -now.getTimezoneOffset(); // in minutes from UTC
      const istOffset = 330; // IST is UTC+5:30 = 330 mins
      const diffMins = istOffset - visitorOffset;

      let diffStr = '';
      if (diffMins !== 0) {
        const absDiff = Math.abs(diffMins);
        const hours = Math.floor(absDiff / 60);
        const mins = absDiff % 60;
        const hPart = hours ? `${hours}h` : '';
        const mPart = mins ? ` ${mins}m` : '';
        const direction = diffMins > 0 ? 'ahead' : 'behind';
        diffStr = ` // ${hPart}${mPart} ${direction}`;
      }

      timeEl.textContent = `${istStr} · vizag${diffStr}`;
    } catch (e) {}
  }
  updateTime();
  setInterval(updateTime, 30000);

  // 4. Time-Sensitive Human Footer Greeting
  const greetingEl = document.getElementById('footer-greeting');
  if (greetingEl) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      greetingEl.textContent = 'up this early? crack open a cold diet coke first :)';
    } else if (hour >= 12 && hour < 17) {
      greetingEl.textContent = 'shouldn’t you be working right now? :)';
    } else if (hour >= 17 && hour < 22) {
      greetingEl.textContent = 'done for the day? go do something fun :)';
    } else {
      greetingEl.textContent = 'up this late? go get some sleep :)';
    }
  }

  // 5. Toast Island Helper
  let toastTimer = null;
  function showToast(msg) {
    let toast = document.getElementById('toast-island');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-island';
      toast.className = 'toast-island';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }
  window.showToast = showToast;

  // 6. Copy Email with Sound & Avatar Reaction
  const copyBtns = document.querySelectorAll('[data-copy-email]');
  copyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email') || 'whysooraj.official@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        if (window.sound) window.sound.play('copy');
        if (window.avatar) window.avatar.poke();
        showToast('copied to clipboard · talk soon :)');
      });
    });
  });

  // 7. Tab Switch Title Hook
  const defaultTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'i noticed you left.' : defaultTitle;
  });

  // 8. Easter Egg Keyboard Shortcut ('r' or 'R')
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'r' || e.key === 'R') {
      if (window.sound) window.sound.play('reload');
      showToast('Performing hot reload...');
    }
  });

  // 9. Smooth Scroll Reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }
})();
