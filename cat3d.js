/**
 * ========================================================
 * RESCATELOCAL IQUITOS - MASCOTA 3D INTERACTIVA: MICHI GUARDIÁN
 * Experiencia 3D con Three.js
 * ========================================================
 */

(function () {
  let scene, camera, renderer;
  let container, stage;
  let catGroup, headGroup, tailGroup, earsGroup, eyes = [];
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotationY = 0;
  let rotationVelocityY = 0;
  let mouseNorm = { x: 0, y: 0 };
  let clock;
  let isBlinking = false;
  let blinkTimer = 0;
  let isCheering = false;
  let cheerTime = 0;
  let speechBubble;
  let tipIndex = 0;

  const ECO_TIPS = [
    "¡Miau! ¿Sabías que en Iquitos rescatar 1 kg de comida evita hasta 2.5 kg de CO₂ en nuestra Amazonía? 🌱",
    "¡Purr! El 35% de los alimentos del mundo se desperdicia. ¡Con RescateLocal los salvamos antes de cerrar! 🥖",
    "¡Miau! Las comidas a S/ 0.00 en la Olla Belén alimentan a familias enteras de la comunidad ribereña. 🤝",
    "¡Purr! En una ciudad fluvial como Iquitos, cuidar cada porción de comida es proteger nuestro río. 🌊",
    "¡Miau! ¡Gracias por ser un héroe del rescate de comida hoy! 🐾"
  ];

  // Sintetizador de maullido tierno usando Web Audio API
  function playCuteMeow() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);

      const now = ctx.currentTime;
      // Curva de tono que sube y baja emulando "meo-w"
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      // Ignorar si el navegador bloquea audio sin interacción previa
    }
  }

  function initCat3D() {
    container = document.getElementById('cat-3d-canvas-container');
    stage = document.getElementById('cat-3d-stage');
    speechBubble = document.getElementById('cat-speech-bubble');

    if (!container || !window.THREE) {
      console.warn('Three.js o contenedor #cat-3d-canvas-container no encontrados.');
      return;
    }

    clock = new THREE.Clock();

    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0.4, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Luces estilizadas para combinar con la atmósfera de la cafetería verde
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.1);
    mainLight.position.set(3, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Luz trasera verde jade para un contorno brillante
    const rimLight = new THREE.DirectionalLight(0x34d399, 1.2);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Luz suave de relleno frontal
    const fillLight = new THREE.PointLight(0xa7f3d0, 0.6, 10);
    fillLight.position.set(0, 0.5, 3);
    scene.add(fillLight);

    // 5. Construcción del Gato Blanco 3D
    buildStylizedCat();

    // 6. Eventos de interacción
    setupEvents();

    // 7. Loop de animación
    animate();
  }

  function buildStylizedCat() {
    catGroup = new THREE.Group();
    scene.add(catGroup);

    // Materiales del gatito
    const furMaterial = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.4,
      metalness: 0.05,
      flatShading: false
    });

    const innerEarMaterial = new THREE.MeshStandardMaterial({
      color: 0xfcb4c2,
      roughness: 0.5,
      metalness: 0.0
    });

    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      roughness: 0.3
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1
    });

    const pupilMaterial = new THREE.MeshStandardMaterial({
      color: 0x062016,
      roughness: 0.1,
      metalness: 0.2
    });

    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2
    });

    const collarMaterial = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.3,
      metalness: 0.4
    });

    const bellMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8
    });

    // --- Sombra suave de contacto en el suelo ---
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x02130b,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.78;
    catGroup.add(shadowMesh);

    // --- CUERPO (Gatito gordito sentado) ---
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 28);
    bodyGeo.scale(1.0, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, furMaterial);
    bodyMesh.position.set(0, 0, 0);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    catGroup.add(bodyMesh);

    // Barriguita suave ligeramente adelantada
    const bellyGeo = new THREE.SphereGeometry(0.68, 24, 20);
    bellyGeo.scale(0.9, 1.05, 0.75);
    const bellyMesh = new THREE.Mesh(bellyGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 }));
    bellyMesh.position.set(0, -0.05, 0.38);
    catGroup.add(bellyMesh);

    // --- PATITAS DELANTERAS ---
    const pawGeo = new THREE.SphereGeometry(0.2, 16, 16);
    pawGeo.scale(1.0, 0.8, 1.4);

    const leftPaw = new THREE.Mesh(pawGeo, furMaterial);
    leftPaw.position.set(-0.35, -0.68, 0.58);
    catGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, furMaterial);
    rightPaw.position.set(0.35, -0.68, 0.58);
    catGroup.add(rightPaw);

    // --- COLLAR VERDE JADE CON CASCABEL DORADO ---
    const collarGeo = new THREE.TorusGeometry(0.62, 0.055, 16, 32);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, collarMaterial);
    collarMesh.position.set(0, 0.62, 0.08);
    catGroup.add(collarMesh);

    const bellGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const bellMesh = new THREE.Mesh(bellGeo, bellMaterial);
    bellMesh.position.set(0, 0.54, 0.65);
    catGroup.add(bellMesh);

    // --- CABEZA Y ROSTRO (Grupo articulado que sigue el cursor) ---
    headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0.12);
    catGroup.add(headGroup);

    // Esfera de la cabeza
    const headGeo = new THREE.SphereGeometry(0.72, 32, 28);
    headGeo.scale(1.12, 0.96, 1.0);
    const headMesh = new THREE.Mesh(headGeo, furMaterial);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Mofletes tiernos
    const cheekGeo = new THREE.SphereGeometry(0.24, 16, 16);
    cheekGeo.scale(1.2, 0.85, 1.0);

    const leftCheek = new THREE.Mesh(cheekGeo, furMaterial);
    leftCheek.position.set(-0.25, -0.16, 0.55);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, furMaterial);
    rightCheek.position.set(0.25, -0.16, 0.55);
    headGroup.add(rightCheek);

    // Nariz rosada
    const noseGeo = new THREE.ConeGeometry(0.08, 0.1, 16);
    noseGeo.rotateZ(Math.PI);
    noseGeo.rotateX(0.2);
    const noseMesh = new THREE.Mesh(noseGeo, noseMaterial);
    noseMesh.position.set(0, -0.1, 0.72);
    headGroup.add(noseMesh);

    // Bigotitos (Líneas finas)
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.6 });
    function createWhisker(x1, y1, z1, x2, y2, z2) {
      const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geom, whiskerMat);
    }
    // Lado izquierdo
    headGroup.add(createWhisker(-0.28, -0.14, 0.65, -0.75, -0.08, 0.7));
    headGroup.add(createWhisker(-0.28, -0.18, 0.65, -0.78, -0.22, 0.7));
    // Lado derecho
    headGroup.add(createWhisker(0.28, -0.14, 0.65, 0.75, -0.08, 0.7));
    headGroup.add(createWhisker(0.28, -0.18, 0.65, 0.78, -0.22, 0.7));

    // --- OJOS GRANDES Y BRILLANTES ---
    eyes = [];
    function createEye(x) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.08, 0.62);

      // Globo ocular
      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 20), eyeWhiteMaterial);
      eyeGroup.add(eyeBall);

      // Iris verde esmeralda
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), irisMaterial);
      iris.position.set(0, 0, 0.04);
      eyeGroup.add(iris);

      // Pupila negra
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 20), pupilMaterial);
      pupil.position.set(0, 0, 0.065);
      eyeGroup.add(pupil);

      // Brillo blanco en la pupila
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.position.set(0.04, 0.04, 0.12);
      eyeGroup.add(glint);

      headGroup.add(eyeGroup);
      eyes.push(eyeGroup);
    }
    createEye(-0.32);
    createEye(0.32);

    // --- OREJAS PUNTIAGUDAS TIERNAS ---
    earsGroup = new THREE.Group();
    headGroup.add(earsGroup);

    function createEar(isLeft) {
      const earGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      earGroup.position.set(sign * 0.45, 0.58, 0);
      earGroup.rotation.z = sign * -0.25;
      earGroup.rotation.x = -0.15;

      // Oreja exterior
      const outerGeo = new THREE.ConeGeometry(0.28, 0.52, 20);
      outerGeo.scale(1.0, 1.0, 0.55);
      const outerMesh = new THREE.Mesh(outerGeo, furMaterial);
      earGroup.add(outerMesh);

      // Interior rosado
      const innerGeo = new THREE.ConeGeometry(0.2, 0.42, 16);
      innerGeo.scale(0.9, 1.0, 0.35);
      const innerMesh = new THREE.Mesh(innerGeo, innerEarMaterial);
      innerMesh.position.set(0, -0.02, 0.1);
      earGroup.add(innerMesh);

      earsGroup.add(earGroup);
      return earGroup;
    }
    createEar(true);
    createEar(false);

    // --- COLA CURVADA CON ANIMACIÓN OSCILANTE ---
    tailGroup = new THREE.Group();
    tailGroup.position.set(0, -0.45, -0.7);
    catGroup.add(tailGroup);

    // Cola segmentada y curvada hacia arriba
    const tailSegments = 6;
    let prevSegment = tailGroup;
    for (let i = 0; i < tailSegments; i++) {
      const segGeo = new THREE.SphereGeometry(0.12 - i * 0.012, 14, 14);
      segGeo.scale(0.9, 1.2, 0.9);
      const segMesh = new THREE.Mesh(segGeo, furMaterial);
      segMesh.position.set(0, 0.13, -0.04);
      segMesh.rotation.x = -0.28;
      prevSegment.add(segMesh);
      prevSegment = segMesh;
    }

    // Posición inicial del gatito
    catGroup.position.y = -0.15;
  }

  function setupEvents() {
    // 1. Detección de arrastre y rotación del gato
    stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    // 2. Clic en el gato para saludar y recibir eco-tip
    stage.addEventListener('click', onCatClick);

    // 3. Botón externo si existe
    const cheerBtn = document.getElementById('cheer-cat-btn');
    if (cheerBtn) {
      cheerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCatCheer();
      });
    }

    // 4. Redimensionamiento adaptativo
    window.addEventListener('resize', onWindowResize);
  }

  function onPointerDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onPointerMove(e) {
    // Coordenadas normalizadas (-1 a 1) para que el gato siga el cursor
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseNorm.x = (x / rect.width) * 2 - 1;
    mouseNorm.y = -(y / rect.height) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      rotationVelocityY = deltaX * 0.008;
      targetRotationY += rotationVelocityY;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  function onTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      rotationVelocityY = deltaX * 0.008;
      targetRotationY += rotationVelocityY;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const rect = container.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      mouseNorm.x = (x / rect.width) * 2 - 1;
      mouseNorm.y = -(y / rect.height) * 2 + 1;
    }
  }

  function onPointerUp() {
    isDragging = false;
  }

  function onCatClick(e) {
    // Si fue un simple clic y no un arrastre prolongado
    triggerCatCheer();
  }

  function triggerCatCheer() {
    isCheering = true;
    cheerTime = 0;
    playCuteMeow();
    showNextEcoTip();
  }

  function showNextEcoTip() {
    if (!speechBubble) return;
    const tip = ECO_TIPS[tipIndex % ECO_TIPS.length];
    tipIndex++;

    const tipTextEl = document.getElementById('cat-tip-text');
    if (tipTextEl) {
      tipTextEl.textContent = tip;
    }

    speechBubble.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
    speechBubble.classList.add('opacity-100', 'scale-100');

    // Ocultar suavemente después de 6 segundos
    clearTimeout(speechBubble._hideTimeout);
    speechBubble._hideTimeout = setTimeout(() => {
      speechBubble.classList.remove('opacity-100', 'scale-100');
      speechBubble.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
    }, 6000);
  }

  function onWindowResize() {
    if (!container || !camera || !renderer) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // 1. Inercia y rotación del gato al arrastrarlo
    if (!isDragging) {
      rotationVelocityY *= 0.92; // Amortiguación
      targetRotationY += rotationVelocityY;
    }
    catGroup.rotation.y = THREE.MathUtils.lerp(catGroup.rotation.y, targetRotationY, 0.12);

    // 2. La cabeza y ojos siguen suavemente el cursor
    const clampedMouseX = THREE.MathUtils.clamp(mouseNorm.x, -1.2, 1.2);
    const clampedMouseY = THREE.MathUtils.clamp(mouseNorm.y, -1.0, 1.0);

    const targetHeadRotY = clampedMouseX * 0.42;
    const targetHeadRotX = -clampedMouseY * 0.28;

    headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadRotY, 0.1);
    headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadRotX, 0.1);

    // Pupilas que rastrean sutilmente
    eyes.forEach(eye => {
      eye.rotation.y = THREE.MathUtils.lerp(eye.rotation.y, clampedMouseX * 0.2, 0.15);
      eye.rotation.x = THREE.MathUtils.lerp(eye.rotation.x, -clampedMouseY * 0.15, 0.15);
    });

    // 3. Animación de Respiración en Reposo (Idle)
    const breath = Math.sin(elapsedTime * 2.5) * 0.015;
    catGroup.scale.set(1 + breath, 1 + breath, 1 + breath);

    // 4. Cola oscilante suave
    if (tailGroup) {
      tailGroup.rotation.y = Math.sin(elapsedTime * 2.8) * 0.35;
      tailGroup.rotation.z = Math.cos(elapsedTime * 2.0) * 0.12;
    }

    // 5. Parpadeo tierno periódico
    blinkTimer += delta;
    if (blinkTimer > 4.2) {
      isBlinking = true;
      blinkTimer = 0;
    }
    if (isBlinking) {
      eyes.forEach(eye => {
        eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, 0.08, 0.35);
      });
      if (eyes[0].scale.y < 0.15) {
        isBlinking = false;
      }
    } else {
      eyes.forEach(eye => {
        eye.scale.y = THREE.MathUtils.lerp(eye.scale.y, 1.0, 0.25);
      });
    }

    // 6. Animación de Salto / Saludo al hacer clic
    if (isCheering) {
      cheerTime += delta * 6;
      // Pequeño salto y ladeo alegre
      catGroup.position.y = -0.15 + Math.sin(cheerTime) * 0.18;
      headGroup.rotation.z = Math.sin(cheerTime * 1.5) * 0.18;
      earsGroup.rotation.z = Math.sin(cheerTime * 3) * 0.15;

      if (cheerTime > Math.PI * 2) {
        isCheering = false;
        catGroup.position.y = -0.15;
        headGroup.rotation.z = 0;
        earsGroup.rotation.z = 0;
      }
    }

    renderer.render(scene, camera);
  }

  // Inicializar al cargar el DOM o si ya está cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCat3D);
  } else {
    // Si Three.js ya está disponible o esperamos un tick
    setTimeout(initCat3D, 100);
  }

  // Exponer función de saludo global
  window.triggerCatCheer = triggerCatCheer;
})();
