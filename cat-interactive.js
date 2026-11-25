/**
 * ========================================================
 * RESCATELOCAL IQUITOS - MASCOTA INTERACTIVA: MICHI DE OJOS AZULES
 * Animaciones CSS + JavaScript: Parallax 2.5D, respiración,
 * parpadeo, maullido con Web Audio API y globo de eco-tips.
 * ========================================================
 */

(function () {
  let stage, avatarWrapper, avatarImg, speechBubble, tipTextEl;
  let isHovering = false;
  let tipIndex = 0;

  const ECO_TIPS = [
    "¡Miau! ¿Sabías que en Iquitos rescatar 1 kg de comida evita hasta 2.5 kg de CO₂ en nuestra Amazonía? 🌱",
    "¡Purr! El 35% de los alimentos del mundo se desperdicia. ¡Con RescateLocal los salvamos antes de cerrar! 🥖",
    "¡Miau! Las comidas a S/ 0.00 en la Olla Belén alimentan a familias enteras de la comunidad ribereña. 🤝",
    "¡Purr! En una ciudad fluvial como Iquitos, cuidar cada porción de comida es proteger nuestro río. 🌊",
    "¡Miau! ¡Gracias por ser un héroe del rescate de comida hoy! 🐾"
  ];

  // Sintetizador de maullido tierno realista con Web Audio API
  function playCatMeow() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Curva melódica natural felina "m-r-e-o-w"
      osc1.frequency.setValueAtTime(340, now);
      osc1.frequency.linearRampToValueAtTime(560, now + 0.12);
      osc1.frequency.exponentialRampToValueAtTime(400, now + 0.38);

      osc2.frequency.setValueAtTime(680, now);
      osc2.frequency.linearRampToValueAtTime(1120, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.38);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.44);
      osc2.stop(now + 0.44);
    } catch (e) {}
  }

  function initCatInteractive() {
    stage = document.getElementById('cat-stage');
    avatarWrapper = document.getElementById('cat-avatar-wrapper');
    avatarImg = document.getElementById('cat-avatar-img');
    speechBubble = document.getElementById('cat-speech-bubble');
    tipTextEl = document.getElementById('cat-tip-text');

    if (!stage || !avatarWrapper) return;

    // 1. Efecto Parallax 2.5D: El gato reacciona al cursor inclinándose y mirándolo suavemente
    stage.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width - 0.5) * 2; // -1 a 1
      const normY = (y / rect.height - 0.5) * 2; // -1 a 1

      const tiltY = normX * 14; // Giro horizontal hacia el cursor
      const tiltX = -normY * 10; // Inclinación vertical
      const transX = normX * 8;

      avatarWrapper.style.transform = `perspective(700px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) translateX(${transX}px) scale(1.03)`;
    });

    stage.addEventListener('mouseleave', () => {
      isHovering = false;
      avatarWrapper.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) translateX(0px) scale(1.0)';
    });

    // 2. Clic en el gato: Salto alegre, maullido y globo de diálogo con Eco-Tip
    stage.addEventListener('click', triggerCatCheer);

    // 3. Botón externo "Saludar a Michi"
    const cheerBtn = document.getElementById('cheer-cat-btn');
    if (cheerBtn) {
      cheerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCatCheer();
      });
    }
  }

  function triggerCatCheer() {
    if (!avatarImg) return;

    // Animación de salto alegre
    avatarImg.classList.remove('cat-jump-active');
    void avatarImg.offsetWidth; // Forzar reflow para reiniciar animación
    avatarImg.classList.add('cat-jump-active');

    // Reproducir maullido
    playCatMeow();

    // Mostrar globo de diálogo con eco-tip rotativo
    showNextEcoTip();
  }

  function showNextEcoTip() {
    if (!speechBubble) return;

    const tip = ECO_TIPS[tipIndex % ECO_TIPS.length];
    tipIndex++;

    if (tipTextEl) tipTextEl.textContent = tip;

    speechBubble.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
    speechBubble.classList.add('opacity-100', 'scale-100');

    clearTimeout(speechBubble._hideTimeout);
    speechBubble._hideTimeout = setTimeout(() => {
      speechBubble.classList.remove('opacity-100', 'scale-100');
      speechBubble.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    }, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatInteractive);
  } else {
    setTimeout(initCatInteractive, 100);
  }

  window.triggerCatCheer = triggerCatCheer;
})();
