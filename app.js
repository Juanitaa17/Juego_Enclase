/**
 * ========================================================
 * TROPICARIO — Aplicación Web Interactiva 3D (Three.js)
 * Con atmósfera dinámica, audio procedural y exportación 3D
 * ========================================================
 */

(function() {
  "use strict";

  // --- ESTADO GLOBAL DE LA APLICACIÓN ---
  let scene, camera, renderer, controls;
  let creatorScene, creatorCamera, creatorRenderer, creatorControls;
  let activePlantInCreator = null;
  let gardenPlants = [];
  let raycaster, mouse;
  let selectedPlant = null;
  let isTransitioningCamera = false;
  let targetCameraPosition = null;
  let targetCameraLookAt = null;

  // Iluminación y Efectos Ambientales
  let hemiLight, sunLight, interiorLight;
  let firefliesMesh = null;
  let currentAtmosphere = 'day';

  // Audio Ambiental Web Audio API
  let audioCtx = null;
  let isAudioPlaying = false;
  let windGain = null;
  let chimeInterval = null;

  // Bancales disponibles en el Tropicario con sus coordenadas centrales y alturas
  const BEDS_CONFIG = {
    'bed-sw': { name: 'Bancal Suroeste', x: -4.5, z: -6.5, y: 0.15, radius: 2.2 },
    'bed-se': { name: 'Bancal Sureste',  x:  4.5, z: -6.5, y: 0.15, radius: 2.2 },
    'bed-nw': { name: 'Bancal Noroeste', x: -4.5, z:  6.5, y: 0.15, radius: 2.2 },
    'bed-ne': { name: 'Bancal Noreste',  x:  4.5, z:  6.5, y: 0.15, radius: 2.2 },
    'plaza':  { name: 'Plaza Central',   x:  0.0, z:  0.0, y: 0.15, radius: 1.6 }
  };

  // Especies iniciales pre-sembradas en el jardín colectivo
  const INITIAL_PLANTS = [
    {
      id: 'plant_init_1',
      name: 'Lumina Calyx',
      author: 'Sofía Navarro',
      desc: 'Especie helicoidal voluble con zarcillos trepadores elásticos, finos estambres dorados y pétalos de acabado aterciopelado.',
      stemShape: 'spiral',
      stemFeature: 'tendrils',
      stemHeight: 3.2,
      stemCurvature: 1.2,
      stemThickness: 0.11,
      stemColor: '#C46D77',
      leafShape: 'ribbon',
      leavesCount: 6,
      leavesSize: 1.4,
      flowerType: 'orchid',
      flowerLayers: 2,
      flowerScale: 1.1,
      petalCurl: 0.7,
      petalsCount: 7,
      flowerOpen: 0.75,
      flowerColor: '#E8837C',
      centerType: 'stamens',
      materialFinish: 'velvet',
      bedId: 'bed-sw',
      likes: 24,
      notes: [
        { text: 'Emite un aroma fresco similar a la vainilla silvestre durante el mediodía.', author: 'Mateo R.', date: '12 Nov' },
        { text: 'Sus pétalos aterciopelados capturan la luz cálida sin reflejos artificiales.', author: 'Camila T.', date: '13 Nov' }
      ],
      posOffset: { x: -0.5, z: 0.2 }
    },
    {
      id: 'plant_init_2',
      name: 'Magna Floris',
      author: 'Ecosistema Tropicario',
      desc: 'El corazón botánico del invernadero. Un arbusto leñoso ramificado con 4 copas divergentes y flores de loto en satinado ceroso.',
      stemShape: 'shrub',
      stemFeature: 'smooth',
      stemHeight: 4.0,
      stemCurvature: 0.8,
      stemThickness: 0.18,
      stemColor: '#4B382A',
      leafShape: 'fan',
      leavesCount: 8,
      leavesSize: 1.8,
      flowerType: 'lotus',
      flowerLayers: 3,
      flowerScale: 1.3,
      petalCurl: 0.8,
      petalsCount: 8,
      flowerOpen: 0.85,
      flowerColor: '#F4A261',
      centerType: 'rosette',
      materialFinish: 'waxy',
      bedId: 'plaza',
      likes: 88,
      notes: [
        { text: 'Su estructura ramificada de arbusto leñoso corona la glorieta central.', author: 'Guía Botánico', date: '10 Nov' }
      ],
      posOffset: { x: 0, z: 0 }
    },
    {
      id: 'plant_init_3',
      name: 'Cereus Azureus',
      author: 'Mateo R.',
      desc: 'Suculenta columnar carnosa con 6 costillas longitudinales profundas, acúleos botánicos y una flor apical con espádice de lirio.',
      stemShape: 'succulent',
      stemFeature: 'spines',
      stemHeight: 2.6,
      stemCurvature: 0.4,
      stemThickness: 0.16,
      stemColor: '#2E5A44',
      leafShape: 'oval',
      leavesCount: 5,
      leavesSize: 1.3,
      flowerType: 'star',
      flowerLayers: 1,
      flowerScale: 1.05,
      petalCurl: 0.4,
      petalsCount: 6,
      flowerOpen: 0.70,
      flowerColor: '#4EA8DE',
      centerType: 'spadix',
      materialFinish: 'matte',
      bedId: 'bed-se',
      likes: 38,
      notes: [
        { text: 'Las costillas del tallo retienen humedad de la condensación del invernadero.', author: 'Sofía N.', date: '14 Nov' }
      ],
      posOffset: { x: 0.3, z: -0.4 }
    },
    {
      id: 'plant_init_4',
      name: 'Campanula Bambusa',
      author: 'Camila Torres',
      desc: 'Tallo nudoso articulado con anillos de crecimiento estilo caña, cáliz acampanado y acabado nacarado opaco.',
      stemShape: 'nodose',
      stemFeature: 'smooth',
      stemHeight: 3.0,
      stemCurvature: 0.7,
      stemThickness: 0.10,
      stemColor: '#5A716A',
      leafShape: 'ribbon',
      leavesCount: 7,
      leavesSize: 1.3,
      flowerType: 'bell',
      flowerLayers: 2,
      flowerScale: 0.95,
      petalCurl: 0.6,
      petalsCount: 5,
      flowerOpen: 0.8,
      flowerColor: '#9D72FF',
      centerType: 'stamens',
      materialFinish: 'pearl',
      bedId: 'bed-ne',
      likes: 45,
      notes: [
        { text: 'Los nudos articulados del tallo le dan un porte orgánico y equilibrado.', author: 'Visitante #42', date: '15 Nov' }
      ],
      posOffset: { x: -0.3, z: 0.4 }
    },
    {
      id: 'plant_init_5',
      name: 'Rosula Serena',
      author: 'Alonso V.',
      desc: 'Corona basal suculenta con hojas radiantes en espiral áurea y un grácil escapo floral central coronado en marfil cálido.',
      stemShape: 'rosette',
      stemFeature: 'smooth',
      stemHeight: 2.7,
      stemCurvature: 0.6,
      stemThickness: 0.11,
      stemColor: '#2E5A44',
      leafShape: 'oval',
      leavesCount: 6,
      leavesSize: 1.2,
      flowerType: 'crown',
      flowerLayers: 2,
      flowerScale: 1.0,
      petalCurl: 0.5,
      petalsCount: 7,
      flowerOpen: 0.75,
      flowerColor: '#E9D8A6',
      centerType: 'stamens',
      materialFinish: 'velvet',
      bedId: 'bed-nw',
      likes: 19,
      notes: [
        { text: 'La roseta de hojas en la base del suelo le otorga un anclaje natural.', author: 'Elena P.', date: '16 Nov' }
      ],
      posOffset: { x: 0.2, z: -0.2 }
    }
  ];

  // ========================================================
  // 1. INICIALIZACIÓN DEL ENTORNO 3D DEL TROPICARIO
  // ========================================================
  function initGardenScene() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xDCECF7); // Cielo diurno suave inicial
    scene.fog = new THREE.FogExp2(0xDCECF7, 0.015);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 1.8, -12); // A la altura de los ojos en la entrada

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // No traspasar el suelo
    controls.minDistance = 2.0;
    controls.maxDistance = 35.0;
    controls.target.set(0, 2.0, 0); // Mirar hacia la plaza central

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Iluminación natural suave
    setupGardenLighting();

    // Estructura arquitectónica del Tropicario
    buildTropicarioArchitecture();

    // Terreno, caminos y bancales
    buildTerrainAndPathways();

    // Sistema de partículas bioluminiscentes (Luciérnagas nocturnas)
    buildFireflies();

    // Cargar y sembrar las plantas en el jardín
    loadAndSpawnPlants();

    // Eventos de ventana y ratón
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointerdown', onDocumentPointerDown);

    // Animación
    animateGarden();
  }

  // Iluminación
  function setupGardenLighting() {
    hemiLight = new THREE.HemisphereLight(0xF4FAFF, 0x5D7566, 0.85);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(0xFFF8EE, 1.6);
    sunLight.position.set(12, 22, -10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Luz interior de rebote suave en la cúpula
    interiorLight = new THREE.PointLight(0xFFE8D6, 0.75, 25);
    interiorLight.position.set(0, 6, 0);
    scene.add(interiorLight);
  }

  // Construcción del Invernadero 3D (Estructura Metálica y Vidrio)
  function buildTropicarioArchitecture() {
    const archGroup = new THREE.Group();
    archGroup.name = "Invernadero_Estructura";

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x223026,
      roughness: 0.35,
      metalness: 0.8
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xE8F4F8,
      roughness: 0.05,
      transmission: 0.90,
      thickness: 0.2,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });

    const halfWidth = 8.8;
    const wallHeight = 4.2;
    const apexHeight = 8.5;
    const archYs = [-14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5, 14];

    // Arcos y columnas
    archYs.forEach(zPos => {
      const colL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, wallHeight - 0.8, 8), metalMat);
      colL.position.set(-halfWidth, 0.8 + (wallHeight - 0.8) / 2, zPos);
      archGroup.add(colL);

      const colR = colL.clone();
      colR.position.x = halfWidth;
      archGroup.add(colR);

      const curvePoints = [];
      const segs = 20;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const x = -halfWidth + (2 * halfWidth) * t;
        const y = wallHeight + (apexHeight - wallHeight) * Math.sin(t * Math.PI);
        curvePoints.push(new THREE.Vector3(x, y, zPos));
      }
      const archCurve = new THREE.CatmullRomCurve3(curvePoints);
      const archMesh = new THREE.Mesh(new THREE.TubeGeometry(archCurve, 20, 0.06, 6, false), metalMat);
      archGroup.add(archMesh);
    });

    // Vigas longitudinales
    const longPoints = [
      { x: 0, y: apexHeight },
      { x: -halfWidth, y: wallHeight },
      { x: halfWidth, y: wallHeight },
      { x: -halfWidth * 0.5, y: wallHeight + (apexHeight - wallHeight) * 0.75 },
      { x: halfWidth * 0.5, y: wallHeight + (apexHeight - wallHeight) * 0.75 }
    ];

    longPoints.forEach(pt => {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 28.5, 6), metalMat);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(pt.x, pt.y, 0);
      archGroup.add(beam);
    });

    // Cúpula de Vidrio translúcida
    const roofGeom = new THREE.CylinderGeometry(halfWidth, halfWidth, 28.2, 32, 1, true, 0, Math.PI);
    const roofGlass = new THREE.Mesh(roofGeom, glassMat);
    roofGlass.rotation.z = Math.PI / 2;
    roofGlass.position.set(0, wallHeight, 0);
    roofGlass.scale.set(1.0, 1.0, (apexHeight - wallHeight) / halfWidth);
    archGroup.add(roofGlass);

    // Paredes laterales de vidrio
    const wallGeom = new THREE.PlaneGeometry(28.2, wallHeight - 0.8);
    const leftWallGlass = new THREE.Mesh(wallGeom, glassMat);
    leftWallGlass.position.set(-halfWidth, 0.8 + (wallHeight - 0.8) / 2, 0);
    leftWallGlass.rotation.y = Math.PI / 2;
    archGroup.add(leftWallGlass);

    const rightWallGlass = leftWallGlass.clone();
    rightWallGlass.position.x = halfWidth;
    archGroup.add(rightWallGlass);

    scene.add(archGroup);
  }

  // Terreno, Senderos y Bancales de Siembra
  function buildTerrainAndPathways() {
    const terrainGroup = new THREE.Group();

    // 1. Pradera de pasto
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x486B4E,
      roughness: 0.88,
      metalness: 0.05
    });
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(35, 45), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    terrainGroup.add(grass);

    // 2. Senderos de arenisca suave
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xDCD5C9,
      roughness: 0.75
    });

    const pathSpine = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 28), pathMat);
    pathSpine.rotation.x = -Math.PI / 2;
    pathSpine.position.y = 0.015;
    pathSpine.receiveShadow = true;
    terrainGroup.add(pathSpine);

    const plaza = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), pathMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    terrainGroup.add(plaza);

    // 3. Bancales de Siembra Elevados
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xE2DFD8, roughness: 0.65 });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x241C15, roughness: 0.95 });

    Object.keys(BEDS_CONFIG).forEach(key => {
      const cfg = BEDS_CONFIG[key];
      const border = new THREE.Mesh(new THREE.CylinderGeometry(cfg.radius, cfg.radius, 0.25, 32), stoneMat);
      border.position.set(cfg.x, 0.125, cfg.z);
      border.receiveShadow = true;
      terrainGroup.add(border);

      const soil = new THREE.Mesh(new THREE.CylinderGeometry(cfg.radius * 0.90, cfg.radius * 0.90, 0.26, 32), soilMat);
      soil.position.set(cfg.x, 0.13, cfg.z);
      soil.receiveShadow = true;
      terrainGroup.add(soil);
    });

    // 4. Helechos ambientales perimetrales
    buildAmbientFerns(terrainGroup);

    scene.add(terrainGroup);
  }

  function buildAmbientFerns(parentGroup) {
    const fernMat = new THREE.MeshStandardMaterial({
      color: 0x2A4535,
      roughness: 0.65,
      side: THREE.DoubleSide
    });

    const fernCoords = [
      [-7.5, -12], [-7.5, -6], [-7.5, 0], [-7.5, 6], [-7.5, 12],
      [ 7.5, -12], [ 7.5, -6], [ 7.5, 0], [ 7.5, 6], [ 7.5, 12]
    ];

    fernCoords.forEach(([fx, fz]) => {
      const fern = new THREE.Group();
      for (let i = 0; i < 7; i++) {
        const ang = (i / 7) * Math.PI * 2;
        const frondGeom = new THREE.PlaneGeometry(0.35, 1.3);
        const frond = new THREE.Mesh(frondGeom, fernMat);
        frond.rotation.y = ang;
        frond.rotation.x = 0.55;
        frond.position.y = 0.4;
        fern.add(frond);
      }
      fern.position.set(fx, 0, fz);
      parentGroup.add(fern);
    });
  }

  // Partículas bioluminiscentes (Luciérnagas)
  function buildFireflies() {
    const count = 90;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 0.6 + Math.random() * 5.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xA6FFB8,
      size: 0.22,
      transparent: true,
      opacity: 0.0, // Inicialmente oculto en modo día
      blending: THREE.AdditiveBlending
    });

    firefliesMesh = new THREE.Points(geom, mat);
    scene.add(firefliesMesh);
  }

  // ========================================================
  // 2. CICLO HORARIO / ATMÓSFERAS (DÍA, OCASO, NOCHE)
  // ========================================================
  function setAtmosphere(mode) {
    currentAtmosphere = mode;

    document.querySelectorAll('.time-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.time === mode);
    });

    if (mode === 'day') {
      scene.background.setHex(0xDCECF7);
      scene.fog.color.setHex(0xDCECF7);
      sunLight.color.setHex(0xFFF8EE);
      sunLight.intensity = 1.6;
      hemiLight.color.setHex(0xF4FAFF);
      hemiLight.groundColor.setHex(0x5D7566);
      interiorLight.intensity = 0.75;
      if (firefliesMesh) firefliesMesh.material.opacity = 0.0;
      document.body.classList.remove('night-mode');
      updatePlantBioluminescence(false);

    } else if (mode === 'sunset') {
      scene.background.setHex(0xF7D0B7);
      scene.fog.color.setHex(0xF7D0B7);
      sunLight.color.setHex(0xFF8A47);
      sunLight.intensity = 2.0;
      hemiLight.color.setHex(0xFFD4B2);
      hemiLight.groundColor.setHex(0x4A2C21);
      interiorLight.intensity = 1.1;
      if (firefliesMesh) firefliesMesh.material.opacity = 0.35;
      document.body.classList.remove('night-mode');
      updatePlantBioluminescence(false);

    } else if (mode === 'night') {
      scene.background.setHex(0x0C1622);
      scene.fog.color.setHex(0x0C1622);
      sunLight.color.setHex(0x3B6082); // Luz de luna azulada
      sunLight.intensity = 0.45;
      hemiLight.color.setHex(0x1B2C3B);
      hemiLight.groundColor.setHex(0x0B1713);
      interiorLight.intensity = 1.8;
      interiorLight.color.setHex(0xFFDCA8);
      if (firefliesMesh) firefliesMesh.material.opacity = 0.88;
      document.body.classList.add('night-mode');
      updatePlantBioluminescence(true);
    }
  }

  function updatePlantBioluminescence(isNight) {
    gardenPlants.forEach(plant => {
      plant.traverse(child => {
        if (child.isMesh && child.material && child.material.emissive) {
          if (isNight) {
            child.material.emissiveIntensity = 1.2;
          } else {
            child.material.emissiveIntensity = 0.25;
          }
        }
      });
    });
  }

  // ========================================================
  // 3. AUDIO AMBIENTE PROCEDURAL (WEB AUDIO API)
  // ========================================================
  function initAmbientAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 1. Generador de brisa suave (ruido rosa filtrado con LFO)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 380;
    filter.Q.value = 1.2;

    // Modulador LFO para variar el viento suavemente
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.12; // 0.12 Hz
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(audioCtx.destination);
    whiteNoise.start();
  }

  function toggleAudio() {
    if (!audioCtx) {
      initAmbientAudio();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isAudioPlaying = !isAudioPlaying;
    const icon = document.getElementById('audio-icon');

    if (isAudioPlaying) {
      windGain.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.4);
      icon.textContent = '🔊';
      startRandomChimes();
    } else {
      windGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.4);
      icon.textContent = '🔈';
      if (chimeInterval) clearInterval(chimeInterval);
    }
  }

  function startRandomChimes() {
    if (chimeInterval) clearInterval(chimeInterval);
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5 - C6

    chimeInterval = setInterval(() => {
      if (!isAudioPlaying || !audioCtx) return;
      if (Math.random() > 0.4) {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        playGentleChime(freq);
      }
    }, 4500);
  }

  function playGentleChime(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.025, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.5);
  }

  // ========================================================
  // 4. EXPORTACIÓN DE MODELOS 3D (.GLB)
  // ========================================================
  function exportPlantToGLB(plantGroup, filename = 'especie_tropicario.glb') {
    if (!window.THREE || !window.THREE.GLTFExporter) {
      alert("El exportador 3D GLTFExporter se está cargando, por favor intenta en unos segundos.");
      return;
    }

    const exporter = new THREE.GLTFExporter();
    const exportScene = new THREE.Scene();
    const clone = plantGroup.clone();
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    exportScene.add(clone);

    exporter.parse(
      exportScene,
      function (result) {
        const output = (result instanceof ArrayBuffer) ? result : JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      { binary: true }
    );
  }

  // ========================================================
  // 5. GESTIÓN Y PERSISTENCIA DE PLANTAS
  // ========================================================
  function loadAndSpawnPlants() {
    let saved = localStorage.getItem('tropicario_plants_v6');
    let plantsData = INITIAL_PLANTS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          plantsData = parsed;
        }
      } catch (e) {
        console.warn("Error leyendo plantas de localStorage, usando iniciales.");
      }
    } else {
      localStorage.setItem('tropicario_plants_v6', JSON.stringify(INITIAL_PLANTS));
    }

    gardenPlants.forEach(p => scene.remove(p));
    gardenPlants = [];

    plantsData.forEach((pData, idx) => {
      spawnPlantInGarden(pData, idx);
    });

    updatePlantsCounter();
  }

  function spawnPlantInGarden(pData, index) {
    const plantObj = PlantGenerator.buildPlant(pData);
    const bed = BEDS_CONFIG[pData.bedId] || BEDS_CONFIG['plaza'];

    const offX = pData.posOffset ? pData.posOffset.x : (Math.random() - 0.5) * (bed.radius * 0.7);
    const offZ = pData.posOffset ? pData.posOffset.z : (Math.random() - 0.5) * (bed.radius * 0.7);

    plantObj.position.set(bed.x + offX, bed.y, bed.z + offZ);

    plantObj.scale.set(0.01, 0.01, 0.01);
    animatePlantGrowth(plantObj, 1.0, 400 + index * 100);

    scene.add(plantObj);
    gardenPlants.push(plantObj);
  }

  function animatePlantGrowth(plantObj, targetScale, delayMs) {
    setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        const s = THREE.MathUtils.lerp(0.01, targetScale, easeOutBack(progress));
        plantObj.scale.set(s, s, s);
        if (progress >= 1.0) {
          plantObj.scale.set(targetScale, targetScale, targetScale);
          clearInterval(interval);
        }
      }, 16);
    }, delayMs);
  }

  function easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function updatePlantsCounter() {
    const counterEl = document.getElementById('plants-counter');
    if (counterEl) {
      counterEl.textContent = `${gardenPlants.length} especies vivas`;
    }
  }

  // ========================================================
  // 6. RAYCASTING E INTERACCIÓN CON PLANTAS DEL JARDÍN
  // ========================================================
  function onDocumentPointerDown(event) {
    if (event.target.closest('#main-header, #plant-card, #creator-modal, #about-modal, #welcome-screen')) {
      return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const meshesToCheck = [];
    gardenPlants.forEach(plant => {
      plant.traverse(child => {
        if (child.isMesh) {
          child.userData.parentPlant = plant;
          meshesToCheck.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(meshesToCheck);

    if (intersects.length > 0) {
      const hitPlant = intersects[0].object.userData.parentPlant;
      if (hitPlant) {
        selectAndFocusPlant(hitPlant);
      }
    }
  }

  function selectAndFocusPlant(plantObj) {
    selectedPlant = plantObj;
    const data = plantObj.userData;

    const plantWorldPos = new THREE.Vector3();
    plantObj.getWorldPosition(plantWorldPos);

    const camTargetPos = new THREE.Vector3(
      plantWorldPos.x + 2.2,
      plantWorldPos.y + (data.stemHeight ? data.stemHeight * 0.6 : 1.8),
      plantWorldPos.z + 2.2
    );

    smoothCameraTransition(camTargetPos, plantWorldPos);

    // Llenar datos de la ficha
    document.getElementById('card-specimen-id').textContent = `Espécimen #${data.id.slice(-4)}`;
    document.getElementById('card-name').textContent = data.name || "Especie Sin Nombre";
    document.getElementById('card-author').textContent = `Por ${data.author || "Visitante Anónimo"}`;
    document.getElementById('card-description').textContent = data.desc || "Sin descripción botánica registrada.";
    document.getElementById('card-stem-type').textContent = capitalize(data.stemShape || "Espiral");
    document.getElementById('card-material-type').textContent = capitalize(data.materialFinish || "Translúcido");
    
    const bedName = BEDS_CONFIG[data.bedId] ? BEDS_CONFIG[data.bedId].name : "Plaza Central";
    document.getElementById('card-location').textContent = bedName;
    document.getElementById('card-likes-count').textContent = data.likes || 0;

    // Renderizar notas de campo
    renderPlantNotes(data.notes || []);

    const plantCard = document.getElementById('plant-card');
    plantCard.classList.remove('hidden');
  }

  function renderPlantNotes(notes) {
    const listEl = document.getElementById('card-notes-list');
    listEl.innerHTML = '';
    if (!notes || notes.length === 0) {
      listEl.innerHTML = '<span style="font-size:0.75rem; color:#8A9C91; font-style:italic;">Aún no hay notas registradas. Sé el primero en dejar una.</span>';
      return;
    }
    notes.forEach(n => {
      const item = document.createElement('div');
      item.className = 'note-item';
      item.innerHTML = `<span>${n.text}</span><span class="note-item-meta">— ${n.author || 'Visitante'} &middot; ${n.date || 'Hoy'}</span>`;
      listEl.appendChild(item);
    });
  }

  function addNoteToSelectedPlant() {
    if (!selectedPlant) return;
    const input = document.getElementById('input-new-note');
    const text = input.value.trim();
    if (!text) return;

    if (!selectedPlant.userData.notes) {
      selectedPlant.userData.notes = [];
    }

    const newNote = {
      text: text,
      author: 'Tú',
      date: 'Ahora'
    };
    selectedPlant.userData.notes.push(newNote);
    renderPlantNotes(selectedPlant.userData.notes);
    input.value = '';

    // Persistir notas
    try {
      const saved = JSON.parse(localStorage.getItem('tropicario_plants_v6') || '[]');
      const idx = saved.findIndex(p => p.id === selectedPlant.userData.id);
      if (idx !== -1) {
        saved[idx].notes = selectedPlant.userData.notes;
        localStorage.setItem('tropicario_plants_v6', JSON.stringify(saved));
      }
    } catch(e) {}
  }

  function smoothCameraTransition(toPos, toLookAt, duration = 1200) {
    isTransitioningCamera = true;
    targetCameraPosition = toPos.clone();
    targetCameraLookAt = toLookAt.clone();

    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = performance.now();

    function updateCam() {
      const now = performance.now();
      const progress = Math.min((now - startTime) / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      camera.position.lerpVectors(startPos, targetCameraPosition, ease);
      controls.target.lerpVectors(startLookAt, targetCameraLookAt, ease);

      if (progress < 1.0) {
        requestAnimationFrame(updateCam);
      } else {
        isTransitioningCamera = false;
      }
    }
    requestAnimationFrame(updateCam);
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ========================================================
  // 7. TALLER BOTÁNICO (CREADOR 3D DE PLANTAS)
  // ========================================================
  function initCreatorStudio() {
    const container = document.getElementById('creator-3d-canvas');
    if (!container) return;

    creatorScene = new THREE.Scene();
    creatorScene.background = new THREE.Color(0xF9F7F4);

    creatorCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
    creatorCamera.position.set(0, 1.8, 5.2);

    creatorRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    creatorRenderer.setSize(container.clientWidth, container.clientHeight);
    creatorRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    creatorRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    creatorRenderer.shadowMap.enabled = true;
    creatorRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(creatorRenderer.domElement);

    creatorControls = new THREE.OrbitControls(creatorCamera, creatorRenderer.domElement);
    creatorControls.enableDamping = true;
    creatorControls.dampingFactor = 0.08;
    creatorControls.target.set(0, 1.5, 0);
    creatorControls.minDistance = 1.5;
    creatorControls.maxDistance = 10;

    const amb = new THREE.AmbientLight(0xFFFBF0, 0.55);
    creatorScene.add(amb);

    const dirLight = new THREE.DirectionalLight(0xFFF6EA, 1.35);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.bias = -0.001;
    creatorScene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xE0F0FF, 0.75);
    rimLight.position.set(-5, 4, -5);
    creatorScene.add(rimLight);

    const groundBounce = new THREE.DirectionalLight(0x7A9482, 0.35);
    groundBounce.position.set(0, -4, 2);
    creatorScene.add(groundBounce);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.7, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0xECE8E1, roughness: 0.8 })
    );
    pedestal.position.y = -0.075;
    pedestal.receiveShadow = true;
    creatorScene.add(pedestal);

    function animateCreator() {
      requestAnimationFrame(animateCreator);
      if (!document.getElementById('creator-modal').classList.contains('hidden')) {
        creatorControls.update();
        if (activePlantInCreator) {
          activePlantInCreator.rotation.y += 0.003;
        }
        creatorRenderer.render(creatorScene, creatorCamera);
      }
    }
    animateCreator();

    updateCreatorPreview();
  }

  function updateCreatorPreview() {
    const params = getCreatorFormValues();

    if (activePlantInCreator) {
      creatorScene.remove(activePlantInCreator);
    }

    activePlantInCreator = PlantGenerator.buildPlant(params);
    creatorScene.add(activePlantInCreator);

    const targetY = (params.stemHeight || 3.0) * 0.55;
    creatorControls.target.set(0, targetY, 0);
  }

  function getCreatorFormValues() {
    return {
      stemShape: getActiveChoice('choice-stem-shape') || 'spiral',
      stemFeature: getActiveChoice('choice-stem-feature') || 'smooth',
      stemHeight: parseFloat(document.getElementById('input-stem-height').value),
      stemCurvature: parseFloat(document.getElementById('input-stem-curvature').value),
      stemThickness: parseFloat(document.getElementById('input-stem-thickness').value),
      leafShape: getActiveChoice('choice-leaf-shape'),
      leavesCount: parseInt(document.getElementById('input-leaves-count').value),
      leavesSize: parseFloat(document.getElementById('input-leaves-size').value),
      flowerType: getActiveChoice('choice-flower-type'),
      flowerLayers: parseInt(document.getElementById('input-flower-layers').value) || 2,
      flowerScale: parseFloat(document.getElementById('input-flower-scale').value) || 1.0,
      petalCurl: parseFloat(document.getElementById('input-petal-curl').value) || 0.5,
      petalsCount: parseInt(document.getElementById('input-petals-count').value),
      flowerOpen: parseFloat(document.getElementById('input-flower-open').value),
      centerType: getActiveChoice('choice-center-type'),
      materialFinish: getActiveChoice('choice-material-finish'),
      flowerColor: getActiveColor('palette-petals'),
      stemColor: getActiveColor('palette-stem'),
      name: document.getElementById('input-plant-name').value.trim() || "Especie Anónima",
      author: document.getElementById('input-plant-author').value.trim() || "Autor Anónimo",
      desc: document.getElementById('input-plant-desc').value.trim() || "Sin descripción botánica.",
      bedId: document.getElementById('select-bed').value,
      notes: []
    };
  }

  function getActiveChoice(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return '';
    const active = container.querySelector('.pill-btn.active');
    return active ? active.dataset.val : '';
  }

  function getActiveColor(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return '#E8837C';
    const active = container.querySelector('.color-swatch.active');
    return active ? active.dataset.color : '#E8837C';
  }

  function plantCurrentSpecimen() {
    const params = getCreatorFormValues();
    params.id = 'plant_' + Date.now();
    params.likes = 0;
    params.notes = [
      { text: 'Especie recién sembrada en este bancal.', author: params.author, date: 'Hoy' }
    ];

    let plantsList = [];
    try {
      const saved = localStorage.getItem('tropicario_plants_v6');
      plantsList = saved ? JSON.parse(saved) : INITIAL_PLANTS.slice();
    } catch(e) {
      plantsList = INITIAL_PLANTS.slice();
    }

    plantsList.push(params);
    localStorage.setItem('tropicario_plants_v6', JSON.stringify(plantsList));

    spawnPlantInGarden(params, gardenPlants.length);
    updatePlantsCounter();

    document.getElementById('creator-modal').classList.add('hidden');

    const lastPlant = gardenPlants[gardenPlants.length - 1];
    if (lastPlant) {
      setTimeout(() => {
        selectAndFocusPlant(lastPlant);
      }, 300);
    }
  }

  // ========================================================
  // 8. EVENTOS DE INTERFAZ Y VISTAS PREESTABLECIDAS
  // ========================================================
  function setupUIEventListeners() {
    // 1. Bienvenida y Navegación
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainHeader = document.getElementById('main-header');
    const navHint = document.getElementById('nav-hint');

    document.getElementById('btn-enter-garden').addEventListener('click', () => {
      welcomeScreen.classList.add('fade-out');
      mainHeader.classList.remove('hidden');
      navHint.classList.remove('hidden');
      setTimeout(() => welcomeScreen.classList.add('hidden'), 800);
    });

    document.getElementById('btn-quick-create').addEventListener('click', () => {
      welcomeScreen.classList.add('fade-out');
      mainHeader.classList.remove('hidden');
      setTimeout(() => {
        welcomeScreen.classList.add('hidden');
        openCreatorModal();
      }, 400);
    });

    // 2. Vistas de Cámara Preestablecidas
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const viewType = e.target.dataset.view;
        if (viewType === 'entry') {
          smoothCameraTransition(new THREE.Vector3(0, 1.8, -12), new THREE.Vector3(0, 2.0, 0));
        } else if (viewType === 'plaza') {
          smoothCameraTransition(new THREE.Vector3(0, 2.5, -4.5), new THREE.Vector3(0, 2.5, 0));
        } else if (viewType === 'overview') {
          smoothCameraTransition(new THREE.Vector3(12, 14, -14), new THREE.Vector3(0, 2.0, 0));
        }
      });
    });

    // 3. Selector de Atmósfera Horaria (Día, Ocaso, Noche)
    document.querySelectorAll('.time-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        setAtmosphere(e.target.dataset.time);
      });
    });

    // 4. Audio Ambiente
    document.getElementById('btn-toggle-audio').addEventListener('click', toggleAudio);

    // 5. Ficha Botánica: Likes, Favoritas, Exportación y Notas
    document.getElementById('btn-close-card').addEventListener('click', () => {
      document.getElementById('plant-card').classList.add('hidden');
      selectedPlant = null;
    });

    document.getElementById('btn-like-plant').addEventListener('click', () => {
      if (!selectedPlant) return;
      const countEl = document.getElementById('card-likes-count');
      let likes = parseInt(countEl.textContent) || 0;
      likes += 1;
      countEl.textContent = likes;
      selectedPlant.userData.likes = likes;

      try {
        const saved = JSON.parse(localStorage.getItem('tropicario_plants_v6') || '[]');
        const idx = saved.findIndex(p => p.id === selectedPlant.userData.id);
        if (idx !== -1) {
          saved[idx].likes = likes;
          localStorage.setItem('tropicario_plants_v6', JSON.stringify(saved));
        }
      } catch(e) {}
    });

    document.getElementById('btn-favorite-plant').addEventListener('click', (e) => {
      e.target.classList.toggle('active');
      e.target.style.backgroundColor = e.target.classList.contains('active') ? '#E8E5DD' : '#fff';
    });

    document.getElementById('btn-export-plant').addEventListener('click', () => {
      if (!selectedPlant) return;
      const name = (selectedPlant.userData.name || 'planta').toLowerCase().replace(/\s+/g, '_');
      exportPlantToGLB(selectedPlant, `${name}.glb`);
    });

    document.getElementById('btn-add-note').addEventListener('click', addNoteToSelectedPlant);
    document.getElementById('input-new-note').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addNoteToSelectedPlant();
    });

    // 6. Modal del Creador
    document.getElementById('btn-open-creator').addEventListener('click', openCreatorModal);
    document.getElementById('btn-close-creator').addEventListener('click', closeCreatorModal);
    document.querySelector('.creator-backdrop').addEventListener('click', closeCreatorModal);

    function openCreatorModal() {
      const modal = document.getElementById('creator-modal');
      modal.classList.remove('hidden');
      if (!creatorRenderer) {
        initCreatorStudio();
      } else {
        const container = document.getElementById('creator-3d-canvas');
        creatorCamera.aspect = container.clientWidth / container.clientHeight;
        creatorCamera.updateProjectionMatrix();
        creatorRenderer.setSize(container.clientWidth, container.clientHeight);
        updateCreatorPreview();
      }
    }

    function closeCreatorModal() {
      document.getElementById('creator-modal').classList.add('hidden');
    }

    // Exportar desde el Creador
    document.getElementById('btn-export-creator').addEventListener('click', () => {
      if (!activePlantInCreator) return;
      const nameInput = document.getElementById('input-plant-name').value.trim() || 'especie_taller';
      const filename = `${nameInput.toLowerCase().replace(/\s+/g, '_')}.glb`;
      exportPlantToGLB(activePlantInCreator, filename);
    });

    // Pestañas del Creador
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        const paneId = `tab-${e.target.dataset.tab}`;
        const pane = document.getElementById(paneId);
        if (pane) pane.classList.add('active');
      });
    });

    // Píldoras de opción
    document.querySelectorAll('.choice-pills').forEach(container => {
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('pill-btn')) {
          container.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          updateCreatorPreview();
        }
      });
    });

    // Paletas de color
    document.querySelectorAll('.color-palette').forEach(container => {
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-swatch')) {
          container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
          e.target.classList.add('active');
          updateCreatorPreview();
        }
      });
    });

    // Sliders en tiempo real
    const rangeInputs = [
      { id: 'input-stem-height', valId: 'val-height', unit: 'm' },
      { id: 'input-stem-curvature', valId: 'val-curvature', map: v => (v < 0.6 ? 'Suave' : v < 1.3 ? 'Medio' : 'Marcado') },
      { id: 'input-stem-thickness', valId: 'val-thickness', unit: 'm' },
      { id: 'input-leaves-count', valId: 'val-leaves-count' },
      { id: 'input-leaves-size', valId: 'val-leaves-size', unit: 'm' },
      { id: 'input-flower-layers', valId: 'val-flower-layers', map: v => `${v} capa${v > 1 ? 's' : ''}` },
      { id: 'input-flower-scale', valId: 'val-flower-scale', unit: 'x' },
      { id: 'input-petals-count', valId: 'val-petals-count' },
      { id: 'input-flower-open', valId: 'val-flower-open', map: v => `${Math.round(v * 100)}%` },
      { id: 'input-petal-curl', valId: 'val-petal-curl', map: v => (v < 0.35 ? 'Suave' : v < 0.7 ? 'Medio' : 'Rizado amplio') }
    ];

    rangeInputs.forEach(({ id, valId, unit, map }) => {
      const input = document.getElementById(id);
      const valDisplay = document.getElementById(valId);
      if (input && valDisplay) {
        input.addEventListener('input', (e) => {
          if (map) {
            valDisplay.textContent = map(parseFloat(e.target.value));
          } else {
            valDisplay.textContent = `${e.target.value}${unit || ''}`;
          }
          updateCreatorPreview();
        });
      }
    });

    // Botón Sembrar
    document.getElementById('btn-plant-in-garden').addEventListener('click', plantCurrentSpecimen);

    // Modal Acerca de
    document.getElementById('btn-info-about').addEventListener('click', () => {
      document.getElementById('about-modal').classList.remove('hidden');
    });
    document.getElementById('btn-close-about').addEventListener('click', () => {
      document.getElementById('about-modal').classList.add('hidden');
    });
    document.getElementById('btn-ok-about').addEventListener('click', () => {
      document.getElementById('about-modal').classList.add('hidden');
    });
    document.getElementById('about-backdrop').addEventListener('click', () => {
      document.getElementById('about-modal').classList.add('hidden');
    });
  }

  // ========================================================
  // 9. CICLO DE ANIMACIÓN Y RENDERIZADO DEL JARDÍN
  // ========================================================
  function animateGarden(time) {
    requestAnimationFrame(animateGarden);

    controls.update();

    const t = (time || 0) * 0.0015;

    // Brisa sutil en las flores y hojas
    gardenPlants.forEach((plant, idx) => {
      const sway = Math.sin(t + idx * 1.5) * 0.02;
      plant.rotation.z = sway;
      plant.rotation.x = Math.cos(t * 0.8 + idx) * 0.015;
    });

    // Movimiento orgánico y pulsación de luciérnagas
    if (firefliesMesh && firefliesMesh.material.opacity > 0.01) {
      const pos = firefliesMesh.geometry.attributes.position;
      const phase = firefliesMesh.geometry.attributes.phase;
      for (let i = 0; i < pos.count; i++) {
        const ph = phase.getX(i);
        // Desplazamiento flotante suave en 3D
        let y = pos.getY(i) + Math.sin(t * 2.0 + ph) * 0.005;
        let x = pos.getX(i) + Math.cos(t * 1.2 + ph) * 0.004;
        let z = pos.getZ(i) + Math.sin(t * 1.5 + ph) * 0.004;
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // --- ARRANQUE DE LA APLICACIÓN ---
  window.addEventListener('DOMContentLoaded', () => {
    initGardenScene();
    setupUIEventListeners();
  });

})();
