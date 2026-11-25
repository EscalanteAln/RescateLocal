/**
 * ========================================================
 * RESCATELOCAL IQUITOS - GATO BLANCO HIPERREALISTA EN THREE.JS
 * Proporciones anatómicas reales (Felis catus), textura de pelaje,
 * ojos expresivos avellana/esmeralda e iluminación natural de cafetería.
 * ========================================================
 */

(function () {
  let scene, camera, renderer;
  let container, stage;
  let catGroup, headGroup, spineGroup, tailSegments = [];
  let leftEar, rightEar, leftEye, rightEye;
  let leftPupil, rightPupil;
  let chestMesh, bellyMesh;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotationY = 0;
  let rotationVelocityY = 0;
  let mouseNorm = { x: 0, y: 0 };
  let clock;
  let blinkTimer = 0;
  let isBlinking = false;
  let earTwitchTimer = 0;
  let isEarTwitching = false;
  let earTwitchSide = 1;
  let isReacting = false;
  let reactTimer = 0;
  let speechBubble;
  let tipIndex = 0;

  const ECO_TIPS = [
    "¡Miau! ¿Sabías que en Iquitos rescatar 1 kg de comida evita hasta 2.5 kg de CO₂ en nuestra Amazonía? 🌱",
    "¡Purr! El 35% de los alimentos del mundo se desperdicia. ¡Con RescateLocal los salvamos antes de cerrar! 🥖",
    "¡Miau! Las comidas a S/ 0.00 en la Olla Belén alimentan a familias enteras de la comunidad ribereña. 🤝",
    "¡Purr! En una ciudad fluvial como Iquitos, cuidar cada porción de comida es proteger nuestro río. 🌊",
    "¡Miau! ¡Gracias por ser un héroe del rescate de comida hoy! 🐾"
  ];

  // 1. GENERADOR DE TEXTURA PROCEDURAL DE PELAJE BLANCO NATURAL
  function createProceduralFurTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base marfil cálido natural (no blanco plástico artificial)
    ctx.fillStyle = '#F8F8F5';
    ctx.fillRect(0, 0, 512, 512);

    // Variaciones sutiles de tono crema y sombra cálida
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(242, 240, 233, 0.4)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(238, 235, 226, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Miles de hebras microscópicas de pelo fino direccionadas
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 4 + Math.random() * 8;
      const angle = (Math.random() - 0.5) * 0.4 + Math.PI / 2; // Dirección descendente natural del pelo

      const brightness = 240 + Math.floor(Math.random() * 15);
      const alpha = 0.12 + Math.random() * 0.18;
      ctx.strokeStyle = `rgba(${brightness}, ${brightness - 2}, ${brightness - 5}, ${alpha})`;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 2. GENERADOR DE BUMP MAP DE PELAJE (MICRORELIEVE TÁCTIL)
  function createProceduralFurBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    ctx.lineWidth = 0.6;
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const len = 3 + Math.random() * 5;
      const val = Math.random() > 0.5 ? 200 : 90;
      ctx.strokeStyle = `rgba(${val}, ${val}, ${val}, 0.22)`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + len);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // 3. GENERADOR DE OJO FELINO REALISTA (IRIS ESMERALDA / AVELLANA CON ESTRÍAS RADIALES)
  function createRealisticCatIrisTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256, cy = 256;

    // Fondo oscuro del anillo limbal exterior
    const outerGrad = ctx.createRadialGradient(cx, cy, 180, cx, cy, 256);
    outerGrad.addColorStop(0, '#105B3A');
    outerGrad.addColorStop(0.85, '#052A18');
    outerGrad.addColorStop(1, '#02130A');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Cuerpo del iris: degradado verde esmeralda a ámbar avellana central
    const irisGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 210);
    irisGrad.addColorStop(0, '#E8B342'); // Hazel / ámbar cerca de la pupila
    irisGrad.addColorStop(0.35, '#A3D254'); // Menta cálido
    irisGrad.addColorStop(0.7, '#2EB872'); // Esmeralda vibrante
    irisGrad.addColorStop(1, '#0C4B2B');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 215, 0, Math.PI * 2);
    ctx.fill();

    // Estrías radiales de fibra del iris felino (ciliary body)
    for (let i = 0; i < 400; i++) {
      const angle = (i / 400) * Math.PI * 2;
      const r1 = 30 + Math.random() * 30;
      const r2 = 180 + Math.random() * 35;
      const alpha = 0.15 + Math.random() * 0.25;
      const isGolden = Math.random() > 0.4;
      ctx.strokeStyle = isGolden ? `rgba(253, 224, 71, ${alpha})` : `rgba(20, 83, 45, ${alpha})`;
      ctx.lineWidth = 0.8 + Math.random() * 1.4;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
      ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
      ctx.stroke();
    }

    // Anillo pupilar suave
    const pupilRing = ctx.createRadialGradient(cx, cy, 20, cx, cy, 55);
    pupilRing.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    pupilRing.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = pupilRing;
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  // Audio felino realista (maullido suave con ronroneo inicial)
  function playRealisticMeow() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. Armónicos del maullido
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Curva melódica natural "m-r-e-o-w"
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.linearRampToValueAtTime(540, now + 0.14);
      osc1.frequency.exponentialRampToValueAtTime(380, now + 0.42);

      osc2.frequency.setValueAtTime(640, now);
      osc2.frequency.linearRampToValueAtTime(1080, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(760, now + 0.42);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.46);
      osc2.stop(now + 0.46);
    } catch (e) {}
  }

  function initCat3D() {
    container = document.getElementById('cat-3d-canvas-container');
    stage = document.getElementById('cat-3d-stage');
    speechBubble = document.getElementById('cat-speech-bubble');

    if (!container || !window.THREE) return;

    clock = new THREE.Clock();

    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara: Ángulo natural para observar al gato sentado en la cafetería
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 420;
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.85, 4.4);
    camera.lookAt(0, 0.25, 0);

    // 3. Renderer con soporte PBR e iluminación fotográfica
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Iluminación Natural que empalma con la Cafetería Verde
    setupNaturalCafeLighting();

    // 5. Construcción Anatómica Realista del Gato Blanco
    buildRealisticCat();

    // 6. Configuración de Eventos de Interacción
    setupEvents();

    // 7. Loop de Renderizado
    animate();
  }

  function setupNaturalCafeLighting() {
    // Luz ambiental cálida interior
    const ambientLight = new THREE.AmbientLight(0xfff1e0, 0.65);
    scene.add(ambientLight);

    // Luz principal cenital cálida (Lámpara colgante de la cafetería)
    const pendantLamp = new THREE.SpotLight(0xffecd1, 1.8);
    pendantLamp.position.set(2.5, 5.0, 2.5);
    pendantLamp.angle = Math.PI / 4;
    pendantLamp.penumbra = 0.55;
    pendantLamp.castShadow = true;
    pendantLamp.shadow.mapSize.width = 1024;
    pendantLamp.shadow.mapSize.height = 1024;
    pendantLamp.shadow.bias = -0.0005;
    scene.add(pendantLamp);

    // Luces de guirnalda cálidas (Fairy lights de fondo)
    const fairyLight1 = new THREE.PointLight(0xffcf7a, 0.85, 8);
    fairyLight1.position.set(-2, 3, -1);
    scene.add(fairyLight1);

    const fairyLight2 = new THREE.PointLight(0xffe2a4, 0.65, 8);
    fairyLight2.position.set(1.8, 2.5, -2);
    scene.add(fairyLight2);

    // Luz de rebote esmeralda desde las paredes de la cafetería (Rim Light suave en el pelaje)
    const cafeWallBounce = new THREE.DirectionalLight(0x2d6a4f, 0.95);
    cafeWallBounce.position.set(-3.5, 1.5, -2.5);
    scene.add(cafeWallBounce);

    // Relleno frontal suave
    const frontFill = new THREE.PointLight(0xfef9c3, 0.45, 6);
    frontFill.position.set(0, 0.3, 3);
    scene.add(frontFill);
  }

  function buildRealisticCat() {
    catGroup = new THREE.Group();
    scene.add(catGroup);

    // Texturas procedurales hiperrealistas
    const furMap = createProceduralFurTexture();
    const furBump = createProceduralFurBumpMap();
    const irisMap = createRealisticCatIrisTexture();

    // Material de pelaje blanco con propiedades PBR (dispersión y suavidad)
    const realisticFurMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfc,
      map: furMap,
      bumpMap: furBump,
      bumpScale: 0.018,
      roughness: 0.72,
      metalness: 0.01
    });

    // Piel suave interior de orejas
    const innerEarSkinMat = new THREE.MeshStandardMaterial({
      color: 0xfcb0bc,
      roughness: 0.65,
      metalness: 0.0
    });

    // Nariz (trufa felina) suave con textura de cuero húmedo
    const noseLeatherMat = new THREE.MeshStandardMaterial({
      color: 0xf4929f,
      roughness: 0.28,
      metalness: 0.05
    });

    // Sombra de contacto suave en el suelo (ambient occlusion)
    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x011109,
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.74;
    catGroup.add(shadowMesh);

    // --- 1. TORSO Y COLUMNA ANATÓMICA (POSTURA SENTADA NATURAL) ---
    spineGroup = new THREE.Group();
    catGroup.add(spineGroup);

    // Caja torácica y lomo arqueado
    const ribcageGeo = new THREE.CylinderGeometry(0.55, 0.68, 1.25, 24);
    ribcageGeo.scale(0.88, 1.0, 0.95);
    const ribcageMesh = new THREE.Mesh(ribcageGeo, realisticFurMat);
    ribcageMesh.position.set(0, 0.02, -0.06);
    ribcageMesh.rotation.x = 0.22; // Inclinación natural hacia adelante
    ribcageMesh.castShadow = true;
    spineGroup.add(ribcageMesh);

    // Pecho prominente con mechón de pelo blanco suave
    const chestGeo = new THREE.SphereGeometry(0.58, 24, 20);
    chestGeo.scale(0.82, 1.05, 0.92);
    chestMesh = new THREE.Mesh(chestGeo, realisticFurMat);
    chestMesh.position.set(0, 0.28, 0.28);
    chestMesh.rotation.x = -0.15;
    spineGroup.add(chestMesh);

    // Vientre inferior suave
    const bellyGeo = new THREE.SphereGeometry(0.66, 24, 20);
    bellyGeo.scale(0.9, 0.92, 0.98);
    bellyMesh = new THREE.Mesh(bellyGeo, realisticFurMat);
    bellyMesh.position.set(0, -0.22, 0.04);
    spineGroup.add(bellyMesh);

    // --- 2. CUARTOS TRASEROS (ANCA FELINA Y MUSLOS SENTADOS) ---
    const thighGeo = new THREE.SphereGeometry(0.48, 20, 18);
    thighGeo.scale(0.65, 1.25, 1.15);

    const leftThigh = new THREE.Mesh(thighGeo, realisticFurMat);
    leftThigh.position.set(-0.54, -0.32, -0.18);
    leftThigh.rotation.set(-0.25, 0.18, 0.22);
    spineGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeo, realisticFurMat);
    rightThigh.position.set(0.54, -0.32, -0.18);
    rightThigh.rotation.set(-0.25, -0.18, -0.22);
    spineGroup.add(rightThigh);

    // Patitas traseras recogidas a los costados
    const hindPawGeo = new THREE.SphereGeometry(0.22, 16, 14);
    hindPawGeo.scale(0.8, 0.55, 1.3);

    const leftHindPaw = new THREE.Mesh(hindPawGeo, realisticFurMat);
    leftHindPaw.position.set(-0.56, -0.66, 0.22);
    spineGroup.add(leftHindPaw);

    const rightHindPaw = new THREE.Mesh(hindPawGeo, realisticFurMat);
    rightHindPaw.position.set(0.56, -0.66, 0.22);
    spineGroup.add(rightHindPaw);

    // --- 3. PATAS DELANTERAS ESBELTAS (RECTAS Y FIRMES) ---
    function createForeleg(isLeft) {
      const legGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      legGroup.position.set(sign * 0.26, -0.22, 0.38);

      // Brazo superior y antebrazo delgado
      const armGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.72, 16);
      const armMesh = new THREE.Mesh(armGeo, realisticFurMat);
      armMesh.position.set(0, -0.14, 0);
      legGroup.add(armMesh);

      // Pata delantera con dedos discretos
      const pawGeo = new THREE.SphereGeometry(0.15, 16, 14);
      pawGeo.scale(0.95, 0.65, 1.35);
      const pawMesh = new THREE.Mesh(pawGeo, realisticFurMat);
      pawMesh.position.set(0, -0.48, 0.08);
      legGroup.add(pawMesh);

      // Ranuras de los 4 dedos felinos
      for (let d = -1; d <= 1; d++) {
        const toeGeo = new THREE.SphereGeometry(0.065, 10, 10);
        toeGeo.scale(0.7, 0.6, 1.2);
        const toeMesh = new THREE.Mesh(toeGeo, realisticFurMat);
        toeMesh.position.set(d * 0.055, -0.48, 0.18);
        legGroup.add(toeMesh);
      }

      spineGroup.add(legGroup);
      return legGroup;
    }
    createForeleg(true);
    createForeleg(false);

    // --- 4. COLA FELINA LARGA Y ELEGANTE (CADENA DE 7 ARTICULACIONES) ---
    tailSegments = [];
    let prevTailParent = spineGroup;
    const baseTailPos = new THREE.Vector3(0, -0.52, -0.62);

    for (let t = 0; t < 7; t++) {
      const radius = 0.09 - t * 0.008;
      const length = 0.26;
      const tailSegmentGroup = new THREE.Group();

      if (t === 0) {
        tailSegmentGroup.position.copy(baseTailPos);
      } else {
        tailSegmentGroup.position.set(0, 0.03, -length * 0.85);
      }

      const segGeo = new THREE.CylinderGeometry(radius * 0.88, radius, length, 12);
      segGeo.rotateX(Math.PI / 2.3);
      const segMesh = new THREE.Mesh(segGeo, realisticFurMat);
      tailSegmentGroup.add(segMesh);

      prevTailParent.add(tailSegmentGroup);
      tailSegments.push(tailSegmentGroup);
      prevTailParent = tailSegmentGroup;
    }

    // --- 5. CABEZA Y CRÁNEO ANATÓMICO (GRUPO ARTICULADO QUE SIGUE EL CURSOR) ---
    headGroup = new THREE.Group();
    headGroup.position.set(0, 0.94, 0.12);
    spineGroup.add(headGroup);

    // Cráneo felino (aplanado arriba, redondeado atrás)
    const craniumGeo = new THREE.SphereGeometry(0.54, 28, 24);
    craniumGeo.scale(0.98, 0.86, 0.92);
    const craniumMesh = new THREE.Mesh(craniumGeo, realisticFurMat);
    craniumMesh.castShadow = true;
    headGroup.add(craniumMesh);

    // Hocico / Almohadillas de bigotes (Vibrissal pads separadas)
    const padGeo = new THREE.SphereGeometry(0.19, 18, 16);
    padGeo.scale(1.05, 0.75, 0.95);

    const leftPad = new THREE.Mesh(padGeo, realisticFurMat);
    leftPad.position.set(-0.14, -0.16, 0.42);
    headGroup.add(leftPad);

    const rightPad = new THREE.Mesh(padGeo, realisticFurMat);
    rightPad.position.set(0.14, -0.16, 0.42);
    headGroup.add(rightPad);

    // Nariz (trufa rosa con surco filtral)
    const noseGeo = new THREE.ConeGeometry(0.075, 0.09, 16);
    noseGeo.rotateZ(Math.PI);
    noseGeo.rotateX(0.18);
    const noseMesh = new THREE.Mesh(noseGeo, noseLeatherMat);
    noseMesh.position.set(0, -0.10, 0.54);
    headGroup.add(noseMesh);

    // Mentón / barbilla felina
    const chinGeo = new THREE.SphereGeometry(0.13, 14, 12);
    chinGeo.scale(0.85, 0.7, 0.9);
    const chinMesh = new THREE.Mesh(chinGeo, realisticFurMat);
    chinMesh.position.set(0, -0.26, 0.38);
    headGroup.add(chinMesh);

    // Bigotes largos y flexibles (12 por lado con curvatura natural hacia abajo)
    const whiskerMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      linewidth: 1
    });

    function createRealisticWhiskers(isLeft) {
      const sign = isLeft ? -1 : 1;
      const originX = sign * 0.16;
      const originY = -0.16;
      const originZ = 0.46;

      const whiskerAngles = [
        { dx: sign * 0.55, dy: 0.04, dz: 0.15 },
        { dx: sign * 0.58, dy: -0.05, dz: 0.12 },
        { dx: sign * 0.52, dy: -0.15, dz: 0.08 },
        { dx: sign * 0.46, dy: -0.22, dz: 0.05 }
      ];

      whiskerAngles.forEach((w, idx) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(originX, originY + idx * 0.015, originZ),
          new THREE.Vector3(originX + w.dx * 0.5, originY + w.dy * 0.4, originZ + w.dz * 0.6),
          new THREE.Vector3(originX + w.dx, originY + w.dy, originZ + w.dz)
        );
        const pts = curve.getPoints(12);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        headGroup.add(new THREE.Line(geo, whiskerMat));
      });
    }
    createRealisticWhiskers(true);
    createRealisticWhiskers(false);

    // --- 6. OJOS REALISTAS CON CÓRNEA LUSTROSA Y PUPILA VERTICAL ---
    function createRealisticEye(isLeft) {
      const eyeGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      eyeGroup.position.set(sign * 0.22, 0.04, 0.42);

      // Cuenca ocular almendrada
      eyeGroup.rotation.y = sign * 0.18;
      eyeGroup.rotation.z = sign * -0.06;

      // Iris con textura fotorrealista
      const irisGeo = new THREE.CircleGeometry(0.125, 32);
      const irisMat = new THREE.MeshStandardMaterial({
        map: irisMap,
        roughness: 0.2,
        metalness: 0.0
      });
      const irisMesh = new THREE.Mesh(irisGeo, irisMat);
      eyeGroup.add(irisMesh);

      // Pupila vertical felina con ranura elíptica
      const pupilGeo = new THREE.CapsuleGeometry
        ? new THREE.CapsuleGeometry(0.022, 0.12, 12, 12)
        : new THREE.CylinderGeometry(0.022, 0.022, 0.14, 12);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020a06 });
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, 0, 0.008);
      eyeGroup.add(pupilMesh);

      // Cúpula corneal transparente con reflejo especular de la cafetería
      const corneaGeo = new THREE.SphereGeometry(0.13, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const corneaMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.04,
        transmission: 0.92,
        ior: 1.376 // Índice de refracción de la córnea
      });
      const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
      corneaMesh.position.set(0, 0, 0.01);
      corneaMesh.rotation.x = Math.PI / 2;
      eyeGroup.add(corneaMesh);

      // Párpado superior para parpadeo
      const lidGeo = new THREE.SphereGeometry(0.14, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const lidMat = new THREE.MeshStandardMaterial({ color: 0xfdfdfc, roughness: 0.65 });
      const eyelid = new THREE.Mesh(lidGeo, lidMat);
      eyelid.position.set(0, 0.02, 0.015);
      eyelid.scale.set(1.02, 0.05, 1.02);
      eyeGroup.add(eyelid);

      headGroup.add(eyeGroup);
      return { eyeGroup, eyelid, pupilMesh };
    }

    const leftEyeData = createRealisticEye(true);
    const rightEyeData = createRealisticEye(false);
    leftEye = leftEyeData.eyeGroup;
    rightEye = rightEyeData.eyeGroup;
    leftPupil = leftEyeData.pupilMesh;
    rightPupil = rightEyeData.pupilMesh;

    // --- 7. OREJAS ANATÓMICAS CON BOLSILLO MARGINAL (HENRY'S POCKET) ---
    function createRealisticEar(isLeft) {
      const earGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;
      earGroup.position.set(sign * 0.36, 0.44, 0.06);
      earGroup.rotation.set(-0.18, sign * 0.32, sign * -0.28);

      // Concha exterior de la oreja
      const outerEarGeo = new THREE.ConeGeometry(0.24, 0.48, 16);
      outerEarGeo.scale(0.85, 1.0, 0.38);
      const outerEarMesh = new THREE.Mesh(outerEarGeo, realisticFurMat);
      earGroup.add(outerEarMesh);

      // Piel interior rosada fina
      const innerEarGeo = new THREE.ConeGeometry(0.18, 0.40, 14);
      innerEarGeo.scale(0.78, 1.0, 0.22);
      const innerEarMesh = new THREE.Mesh(innerEarGeo, innerEarSkinMat);
      innerEarMesh.position.set(0, -0.02, 0.07);
      earGroup.add(innerEarMesh);

      // Mechones finos de pelo blanco protector dentro de la oreja
      for (let f = 0; f < 6; f++) {
        const tuftCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, -0.15 + f * 0.04, 0.08),
          new THREE.Vector3(sign * 0.06, -0.05 + f * 0.04, 0.14),
          new THREE.Vector3(sign * 0.12, 0.05 + f * 0.03, 0.12)
        );
        const tuftGeo = new THREE.BufferGeometry().setFromPoints(tuftCurve.getPoints(8));
        earGroup.add(new THREE.Line(tuftGeo, whiskerMat));
      }

      headGroup.add(earGroup);
      return earGroup;
    }

    leftEar = createRealisticEar(true);
    rightEar = createRealisticEar(false);

    // Ajuste de altura en el piso de la cafetería
    catGroup.position.set(0, -0.10, 0);
  }

  function setupEvents() {
    stage.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    stage.addEventListener('click', onCatClick);

    const cheerBtn = document.getElementById('cheer-cat-btn');
    if (cheerBtn) {
      cheerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerCatReaction();
      });
    }

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
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseNorm.x = (x / rect.width) * 2 - 1;
    mouseNorm.y = -(y / rect.height) * 2 + 1;

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      rotationVelocityY = deltaX * 0.007;
      targetRotationY += rotationVelocityY;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  function onTouchMove(e) {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      rotationVelocityY = deltaX * 0.007;
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

  function onCatClick() {
    triggerCatReaction();
  }

  function triggerCatReaction() {
    isReacting = true;
    reactTimer = 0;
    playRealisticMeow();
    showNextEcoTip();
  }

  function showNextEcoTip() {
    if (!speechBubble) return;
    const tip = ECO_TIPS[tipIndex % ECO_TIPS.length];
    tipIndex++;

    const tipTextEl = document.getElementById('cat-tip-text');
    if (tipTextEl) tipTextEl.textContent = tip;

    speechBubble.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
    speechBubble.classList.add('opacity-100', 'scale-100');

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

    // 1. Rotación del gato con inercia suave al arrastrar
    if (!isDragging) {
      rotationVelocityY *= 0.91;
      targetRotationY += rotationVelocityY;
    }
    catGroup.rotation.y = THREE.MathUtils.lerp(catGroup.rotation.y, targetRotationY, 0.12);

    // 2. Rastreo anatómico natural de la cabeza con límites cervicales felinos reales
    const clampedX = THREE.MathUtils.clamp(mouseNorm.x, -1.0, 1.0);
    const clampedY = THREE.MathUtils.clamp(mouseNorm.y, -0.7, 0.7);

    // Giro de cabeza limitado a ~55° yaw y ~22° pitch
    const targetHeadYaw = clampedX * 0.48;
    const targetHeadPitch = -clampedY * 0.22;
    const targetHeadRoll = clampedX * -0.06; // Ligero ladeo natural felino al mirar de lado

    headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadYaw, 0.08);
    headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadPitch, 0.08);
    headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetHeadRoll, 0.08);

    // Dilatación y rastreo sutil de pupilas según interés
    if (leftPupil && rightPupil) {
      const pupilWidth = 0.022 + Math.abs(clampedX) * 0.015;
      leftPupil.scale.set(pupilWidth / 0.022, 1.0, 1.0);
      rightPupil.scale.set(pupilWidth / 0.022, 1.0, 1.0);
    }

    // 3. Respiración orgánica realista (expansión suave del tórax)
    const breathCycle = Math.sin(elapsedTime * 2.1) * 0.018;
    if (chestMesh) chestMesh.scale.set(0.82 + breathCycle, 1.05 + breathCycle, 0.92 + breathCycle);
    if (bellyMesh) bellyMesh.scale.set(0.9 + breathCycle * 0.7, 0.92 + breathCycle * 0.7, 0.98);

    // 4. Cola felina con movimiento ondulante realista
    if (tailSegments.length > 0) {
      tailSegments.forEach((seg, idx) => {
        const wave = Math.sin(elapsedTime * 1.8 - idx * 0.45) * 0.06;
        seg.rotation.y = wave;
        seg.rotation.z = Math.cos(elapsedTime * 1.5 - idx * 0.35) * 0.035;
      });
    }

    // 5. Parpadeo lento y afectuoso (Slow Blink felino real)
    blinkTimer += delta;
    if (blinkTimer > 5.5) {
      isBlinking = true;
      blinkTimer = 0;
    }
    if (isBlinking) {
      if (leftEye && rightEye) {
        leftEye.scale.y = THREE.MathUtils.lerp(leftEye.scale.y, 0.05, 0.38);
        rightEye.scale.y = THREE.MathUtils.lerp(rightEye.scale.y, 0.05, 0.38);
        if (leftEye.scale.y < 0.12) isBlinking = false;
      }
    } else {
      if (leftEye && rightEye) {
        leftEye.scale.y = THREE.MathUtils.lerp(leftEye.scale.y, 1.0, 0.22);
        rightEye.scale.y = THREE.MathUtils.lerp(rightEye.scale.y, 1.0, 0.22);
      }
    }

    // 6. Espasmo auditivo independiente de las orejas (Ear twitch realista)
    earTwitchTimer += delta;
    if (earTwitchTimer > 6.8) {
      isEarTwitching = true;
      earTwitchTimer = 0;
      earTwitchSide = Math.random() > 0.5 ? 1 : -1;
    }
    if (isEarTwitching) {
      const earTarget = earTwitchSide === 1 ? leftEar : rightEar;
      if (earTarget) {
        earTarget.rotation.z += Math.sin(elapsedTime * 35) * 0.06;
      }
      if (earTwitchTimer > 0.35) isEarTwitching = false;
    }

    // 7. Reacción afectuosa al hacer clic (Erguirse, ladeo suave y ronroneo)
    if (isReacting) {
      reactTimer += delta * 4;
      catGroup.position.y = -0.10 + Math.sin(reactTimer) * 0.06; // Ligera elevación del pecho
      headGroup.rotation.z = Math.sin(reactTimer * 1.2) * 0.12;

      if (reactTimer > Math.PI * 2) {
        isReacting = false;
        catGroup.position.y = -0.10;
        headGroup.rotation.z = 0;
      }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCat3D);
  } else {
    setTimeout(initCat3D, 100);
  }

  window.triggerCatCheer = triggerCatReaction;
})();
