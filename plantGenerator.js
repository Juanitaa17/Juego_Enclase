/**
 * ========================================================
 * TROPICARIO — Motor Generador de Especies 3D (Versión 6.0)
 * ========================================================
 * - 7 Morfologías de tallo radicalmente diferentes y reconocibles a simple vista:
 *   1. Arbusto leñoso (múltiples ramas 3D en abanico)
 *   2. Suculento acanalado (columna gruesa con 6 costillas y espinas en aristas)
 *   3. Nudoso bambú (segmentado con anillos nodales prominentes y bandas leñosas)
 *   4. Voluble espiral (tirabuzón helicoidal amplio con zarcillos)
 *   5. Sinuoso flexuoso (curvas expresivas en S)
 *   6. Roseta basal (corona suculenta en el suelo + escapo floral alto)
 *   7. Escapo erguido (clásico tallo floral vertical y estilizado)
 * - Distribución de hojas 360° REAL: Se proyectan radialmente hacia todos los lados
 *   (norte, sur, este, oeste) equilibradas alrededor del tallo, sin cargarse a un solo lado.
 * - Renderizado sólido PBR (100% libre de transparencias y reflejos artificiales).
 */

const PlantGenerator = (function() {
  "use strict";

  /**
   * Genera materiales botánicos fotorrealistas, táctiles y 100% OPALINOS / SÓLIDOS
   */
  function createPlantMaterial(colorHex, finishType, isFlower = false) {
    const color = new THREE.Color(colorHex);
    const finish = (finishType === 'translucent' || !finishType) ? 'velvet' : finishType;

    switch (finish) {
      case 'velvet': {
        const sheenTint = color.clone().offsetHSL(0.02, 0.08, 0.18);
        return new THREE.MeshPhysicalMaterial({
          color: color,
          roughness: isFlower ? 0.45 : 0.55,
          metalness: 0.0,
          sheen: sheenTint,
          clearcoat: 0.05,
          clearcoatRoughness: 0.4,
          transparent: false,
          opacity: 1.0,
          depthWrite: true,
          depthTest: true,
          side: THREE.DoubleSide,
          shadowSide: THREE.DoubleSide,
          vertexColors: true
        });
      }

      case 'waxy':
      case 'glossy': {
        return new THREE.MeshPhysicalMaterial({
          color: color,
          roughness: isFlower ? 0.22 : 0.30,
          metalness: 0.02,
          clearcoat: 0.75,
          clearcoatRoughness: 0.16,
          transparent: false,
          opacity: 1.0,
          depthWrite: true,
          depthTest: true,
          side: THREE.DoubleSide,
          shadowSide: THREE.DoubleSide,
          vertexColors: true
        });
      }

      case 'pearl': {
        return new THREE.MeshPhysicalMaterial({
          color: color,
          roughness: 0.28,
          metalness: 0.04,
          iridescence: 0.55,
          iridescenceIOR: 1.33,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
          transparent: false,
          opacity: 1.0,
          depthWrite: true,
          depthTest: true,
          side: THREE.DoubleSide,
          shadowSide: THREE.DoubleSide,
          vertexColors: true
        });
      }

      case 'matte':
      default: {
        return new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.86,
          metalness: 0.0,
          transparent: false,
          opacity: 1.0,
          depthWrite: true,
          depthTest: true,
          side: THREE.DoubleSide,
          shadowSide: THREE.DoubleSide,
          vertexColors: true
        });
      }
    }
  }

  /**
   * Tallo orgánico esculpido con alta fidelidad geométrica
   * radialSegs = 48 para resolver fielmente costillas cactoides de 6 puntas
   */
  function createSculptedStem(points, baseRadius, tipRadius, morphology = "straight", radialSegs = 48) {
    const curve = new THREE.CatmullRomCurve3(points);
    const lengthSegs = 64;
    const geom = new THREE.BufferGeometry();

    const positions = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const frames = curve.computeFrenetFrames(lengthSegs, false);

    for (let i = 0; i <= lengthSegs; i++) {
      const t = i / lengthSegs;
      const point = curve.getPointAt(t);
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      // Modulación morfológica
      let morphRadiusFactor = 1.0;
      let isBambooNode = false;

      if (morphology === "nodose") {
        // 5 anillos nodales botánicos muy prominentes y visibles
        const nodeWave = Math.pow(Math.sin(t * Math.PI * 5.0), 12);
        morphRadiusFactor += nodeWave * 0.55;
        if (nodeWave > 0.25) isBambooNode = true;
      } else {
        const naturalNodes = Math.sin(t * Math.PI * 4.0) * 0.05 * (1.0 - t);
        morphRadiusFactor += naturalNodes;
      }

      const meanRadius = (baseRadius * (1.0 - t * 0.65) + tipRadius * t) * morphRadiusFactor;

      // Gradiente de color en vértices
      let baseTone = 0.82 + t * 0.22;
      let greenAccent = 0.88 + t * 0.16;
      if (isBambooNode) {
        // Banda leñosa más oscura y marcada en los nudos del bambú
        baseTone *= 0.68;
        greenAccent *= 0.62;
      }

      for (let j = 0; j <= radialSegs; j++) {
        const v = j / radialSegs;
        const theta = v * Math.PI * 2;

        let r = meanRadius;
        if (morphology === "succulent") {
          // 6 costillas longitudinales profundas y afiladas
          const rib = Math.cos(theta * 6.0) * 0.35;
          r = meanRadius * (1.0 + rib);
        }

        const sin = Math.sin(theta);
        const cos = Math.cos(theta);

        const cx = normal.x * cos + binormal.x * sin;
        const cy = normal.y * cos + binormal.y * sin;
        const cz = normal.z * cos + binormal.z * sin;

        positions.push(point.x + cx * r, point.y + cy * r, point.z + cz * r);
        normals.push(cx, cy, cz);
        uvs.push(v, t);
        colors.push(baseTone, greenAccent, baseTone);
      }
    }

    for (let i = 0; i < lengthSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * (radialSegs + 1) + j;
        const b = (i + 1) * (radialSegs + 1) + j;
        const c = (i + 1) * (radialSegs + 1) + (j + 1);
        const d = i * (radialSegs + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return { geometry: geom, curve: curve };
  }

  /**
   * Geometría de hoja: orientada con base en (0,0,0) extendiéndose hacia +Z con caída en -Y
   */
  function createSculptedLeafGeometry(type, length, widthFactor = 0.45) {
    const geom = new THREE.BufferGeometry();
    const lengthSegs = 14;
    const widthSegs = 8;

    const positions = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    for (let i = 0; i <= lengthSegs; i++) {
      const u = i / lengthSegs;

      let wProfile = 0;
      if (type === 'fan') {
        wProfile = Math.sin(u * Math.PI * 0.72) * (0.35 + u * 0.65);
      } else if (type === 'oval') {
        wProfile = Math.sin(Math.pow(u, 0.75) * Math.PI) * 1.15;
      } else { // ribbon
        wProfile = Math.sin(Math.pow(u, 0.65) * Math.PI) * 0.85;
      }
      const w = length * widthFactor * wProfile;

      const drop = Math.pow(u, 1.8) * (length * 0.35);
      const extend = Math.sin(u * Math.PI * 0.5) * length;

      for (let j = 0; j <= widthSegs; j++) {
        const v = j / widthSegs;
        const cv = (v - 0.5) * 2;

        const x = cv * (w * 0.5);
        const y = -drop;
        const z = extend;

        const arch = Math.cos(cv * Math.PI * 0.5) * (w * 0.30);
        const finalY = y + arch;

        positions.push(x, finalY, z);
        uvs.push(v, u);

        const edgeHighlight = Math.abs(cv) * 0.10;
        const leafGrad = 0.80 + u * 0.22 + edgeHighlight;
        colors.push(leafGrad * 0.92, leafGrad, leafGrad * 0.88);
      }
    }

    for (let i = 0; i < lengthSegs; i++) {
      for (let j = 0; j < widthSegs; j++) {
        const a = i * (widthSegs + 1) + j;
        const b = (i + 1) * (widthSegs + 1) + j;
        const c = (i + 1) * (widthSegs + 1) + (j + 1);
        const d = i * (widthSegs + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }

  /**
   * Inserta una hoja orientada RADIÁMENTE hacia afuera en 360° en torno al tallo
   * Resuelve definitivamente el error de hojas cargadas a un solo lado
   */
  function attachLeafRadial(parentGroup, stemCurve, u, radialAngle, leafSize, leafType, stemMat, stemRadius) {
    const point = stemCurve.getPointAt(u);

    // Vector unitario que apunta radialmente hacia afuera desde el centro del tallo
    const outX = Math.cos(radialAngle);
    const outZ = Math.sin(radialAngle);
    const radialDir = new THREE.Vector3(outX, 0, outZ).normalize();

    // Inserción en la corteza exterior del tallo
    const insertPoint = point.clone().addScaledVector(radialDir, stemRadius * 0.85);

    // Pivot rotatorio colocado exactamente en el nudo de inserción
    const pivot = new THREE.Group();
    pivot.position.copy(insertPoint);

    // Orientar el pivot para que su eje frontal (+Z) mire en radialDir hacia afuera
    pivot.rotation.y = Math.atan2(outX, outZ);

    // Inclinación hacia afuera y arco por gravedad natural
    const pitchAngle = THREE.MathUtils.degToRad(22 + (1.0 - u) * 20);
    pivot.rotation.x = pitchAngle;

    // Crear la hoja tridimensional y agregarla al pivot
    const leafGeom = createSculptedLeafGeometry(leafType, leafSize);
    const leafMesh = new THREE.Mesh(leafGeom, stemMat);
    leafMesh.castShadow = true;
    leafMesh.receiveShadow = true;

    pivot.add(leafMesh);
    parentGroup.add(pivot);
  }

  /**
   * Genera pétalos voluptuosos con bordes ondulados, curvatura viva y gradiente de color
   */
  function createSculptedPetalGeometry(type, length, width, openAngle, curlFactor = 0.5) {
    const geom = new THREE.BufferGeometry();
    const lengthSegs = 18;
    const widthSegs = 10;

    const positions = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    for (let i = 0; i <= lengthSegs; i++) {
      const u = i / lengthSegs;

      let wProfile = Math.sin(Math.pow(u, 0.72) * Math.PI);
      if (type === 'bell') {
        wProfile = Math.sin(u * Math.PI * 0.85) * (0.3 + u * 0.7);
      } else if (type === 'lotus') {
        wProfile = Math.sin(Math.pow(u, 0.78) * Math.PI) * (1.12 - u * 0.18);
      } else if (type === 'orchid') {
        wProfile = Math.sin(u * Math.PI) * (0.8 + Math.sin(u * Math.PI * 2) * 0.45);
      } else if (type === 'star') {
        wProfile = Math.sin(Math.pow(u, 1.25) * Math.PI) * 0.75;
      }
      const curW = width * wProfile;

      const rad = u * length;
      const angle = (Math.PI * 0.5 * (1.0 - openAngle)) * u;
      const zBase = Math.sin(angle) * rad;
      const yBase = Math.cos(angle) * rad;

      const tipCurl = Math.sin(u * Math.PI * 0.85) * (curlFactor * 0.42) - Math.pow(u, 2.4) * (curlFactor * 0.38);

      for (let j = 0; j <= widthSegs; j++) {
        const v = j / widthSegs;
        const cv = (v - 0.5) * 2;

        const x = cv * (curW * 0.5);
        const ruffle = Math.sin(cv * Math.PI * 3.0 + u * 3.6) * (0.09 * u * (0.5 + curlFactor * 0.5));
        const cup = (1.0 - cv * cv) * (curW * 0.30 * (1.0 - u * 0.22));

        positions.push(x, yBase + ruffle + tipCurl, zBase + cup);
        uvs.push(v, u);

        const edgeLight = Math.abs(cv) * 0.12 * u;
        const baseShadow = 0.80 + u * 0.25;
        colors.push(baseShadow + edgeLight, baseShadow * 0.94 + edgeLight, baseShadow * 0.92 + edgeLight * 1.1);
      }
    }

    for (let i = 0; i < lengthSegs; i++) {
      for (let j = 0; j < widthSegs; j++) {
        const a = i * (widthSegs + 1) + j;
        const b = (i + 1) * (widthSegs + 1) + j;
        const c = (i + 1) * (widthSegs + 1) + (j + 1);
        const d = i * (widthSegs + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    return geom;
  }

  /**
   * Zarcillos trepadores vivos en espiral
   */
  function createTendril(startPoint, dir, length, turns = 2.8, radius = 0.22) {
    const points = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const theta = t * Math.PI * 2 * turns;
      const r = radius * (1.0 - t * 0.65) * Math.sin(t * Math.PI);
      const h = t * length;

      const px = startPoint.x + Math.sin(theta) * r + dir.x * h;
      const py = startPoint.y + h * dir.y;
      const pz = startPoint.z + Math.cos(theta) * r + dir.z * h;
      points.push(new THREE.Vector3(px, py, pz));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 30, 0.02, 6, false);
  }

  /**
   * Espinas botánicas en punta cónica
   */
  function createBotanicalThorn(thornMat, scale = 1.0) {
    const geom = new THREE.ConeGeometry(0.04 * scale, 0.18 * scale, 6);
    geom.translate(0, 0.09 * scale, 0);
    geom.rotateX(Math.PI * 0.45);
    const mesh = new THREE.Mesh(geom, thornMat);
    mesh.castShadow = true;
    return mesh;
  }

  /**
   * Construye un espécimen botánico 3D completo con diferenciación morfológica radical
   */
  function buildPlant(params) {
    const plantGroup = new THREE.Group();
    plantGroup.name = params.name || "Especie_Botanica";

    const finishType = params.materialFinish || "velvet";
    const stemColor = params.stemColor || "#2E5A44";
    const flowerColor = params.flowerColor || "#E8837C";

    const stemMat = createPlantMaterial(stemColor, finishType, false);
    const flowerMat = createPlantMaterial(flowerColor, finishType, true);

    const height = parseFloat(params.stemHeight) || 3.2;
    const curvature = parseFloat(params.stemCurvature) || 1.0;
    const baseThickness = parseFloat(params.stemThickness) || 0.13;
    const shape = params.stemShape || "spiral";
    const stemFeature = params.stemFeature || "smooth";

    const leafCount = parseInt(params.leavesCount) || 6;
    const leafSize = parseFloat(params.leavesSize) || 1.4;
    const leafType = params.leafShape || "ribbon";

    const flowerSites = [];

    // ========================================================
    // 1. GENERACIÓN DE TALLO SEGÚN MORFOLOGÍA RADICAL
    // ========================================================

    if (shape === "shrub") {
      // --------------------------------------------------------
      // 1. ARBUSTO LEÑOSO (MATA RAMIFICADA 3D)
      // Base ancha achaparrada con 5 ramas divergentes en cúpula
      // --------------------------------------------------------
      const trunkPts = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, height * 0.15, 0),
        new THREE.Vector3(0, height * 0.28, 0)
      ];
      const trunkStem = createSculptedStem(trunkPts, baseThickness * 2.2, baseThickness * 1.5, "nodose", 24);
      const trunkMesh = new THREE.Mesh(trunkStem.geometry, stemMat);
      trunkMesh.castShadow = true;
      plantGroup.add(trunkMesh);

      // 5 ramas leñosas divergentes abriéndose en abanico 360°
      const branchConfigs = [
        { angle: 0,                spread: 1.15, hRatio: 0.95 },
        { angle: Math.PI * 0.45,   spread: 1.25, hRatio: 0.85 },
        { angle: Math.PI * 0.95,   spread: 1.10, hRatio: 0.90 },
        { angle: Math.PI * 1.45,   spread: 1.20, hRatio: 0.88 },
        { angle: Math.PI * 1.85,   spread: 0.50, hRatio: 1.05 }  // Rama central erguida
      ];

      branchConfigs.forEach((bCfg, bIdx) => {
        const bPts = [new THREE.Vector3(0, height * 0.25, 0)];
        const bLen = height * 0.72 * bCfg.hRatio;
        const bRadius = bCfg.spread * curvature * 0.9;
        const bSteps = 16;

        for (let bi = 1; bi <= bSteps; bi++) {
          const bit = bi / bSteps;
          const arc = Math.sin(bit * Math.PI * 0.5);
          bPts.push(new THREE.Vector3(
            Math.cos(bCfg.angle) * (arc * bRadius * bit * 1.5),
            height * 0.25 + bit * bLen + Math.sin(bit * Math.PI) * 0.15,
            Math.sin(bCfg.angle) * (arc * bRadius * bit * 1.5)
          ));
        }

        const bStem = createSculptedStem(bPts, baseThickness * 0.75, baseThickness * 0.28, "straight", 24);
        const bMesh = new THREE.Mesh(bStem.geometry, stemMat);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        plantGroup.add(bMesh);

        // Hojas en la rama orientadas hacia afuera en 360°
        const leavesPerBranch = Math.max(2, Math.round(leafCount / 2));
        for (let bli = 0; bli < leavesPerBranch; bli++) {
          const blu = 0.25 + (bli / leavesPerBranch) * 0.65;
          const rAngle = bCfg.angle + (bli % 2 === 0 ? 0.7 : -0.7) + (bli * 0.4);
          attachLeafRadial(plantGroup, bStem.curve, blu, rAngle, leafSize * 0.65, leafType, stemMat, baseThickness * 0.45);
        }

        // Flor en el ápice de cada rama
        const isDominant = (bIdx === 4 || bIdx === 0);
        flowerSites.push({
          position: bPts[bPts.length - 1],
          scale: isDominant ? 1.0 : 0.68,
          isPrimary: isDominant
        });
      });

    } else if (shape === "succulent") {
      // --------------------------------------------------------
      // 2. SUCULENTO ACANALADO (COLUMNA CACTOIDE CON 6 COSTILLAS Y ESPINAS)
      // Columna muy gruesa con costillas afiladas y areolas
      // --------------------------------------------------------
      const stemPoints = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Columna maciza con sutil torsión fototrópica
        const x = Math.sin(t * Math.PI * 0.8) * (0.15 * curvature);
        const y = t * height;
        const z = Math.cos(t * Math.PI * 0.6) * (0.10 * curvature) * (1.0 - t);
        stemPoints.push(new THREE.Vector3(x, y, z));
      }

      // 2.5x más grueso que un tallo normal
      const thickRadius = baseThickness * 2.4;
      const { geometry: stemGeom, curve: stemCurve } = createSculptedStem(
        stemPoints,
        thickRadius,
        thickRadius * 0.72,
        "succulent",
        48 // Resolución para 6 costillas nítidas
      );

      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Filas de espinas botánicas afiladas a lo largo de las 6 aristas
      const thornMat = createPlantMaterial("#4A382A", "matte", false);
      const spineRows = 6;
      const spineLevels = 10;

      for (let sl = 1; sl < spineLevels; sl++) {
        const su = sl / spineLevels;
        const sPoint = stemCurve.getPointAt(su);
        const curRadius = (thickRadius * (1.0 - su * 0.28)) * 1.35; // Sobre la cresta de la costilla

        for (let sr = 0; sr < spineRows; sr++) {
          const spineAngle = (sr / spineRows) * Math.PI * 2;
          const sDirX = Math.cos(spineAngle);
          const sDirZ = Math.sin(spineAngle);

          const thPivot = new THREE.Group();
          thPivot.position.set(
            sPoint.x + sDirX * curRadius,
            sPoint.y,
            sPoint.z + sDirZ * curRadius
          );
          thPivot.rotation.y = Math.atan2(sDirX, sDirZ);
          thPivot.rotation.x = THREE.MathUtils.degToRad(35);

          const thornMesh = createBotanicalThorn(thornMat, 0.9);
          thPivot.add(thornMesh);
          plantGroup.add(thPivot);
        }
      }

      // Flor apical destacada en la cima del cactus
      flowerSites.push({
        position: stemPoints[stemPoints.length - 1],
        scale: 1.15,
        isPrimary: true
      });

    } else if (shape === "rosette") {
      // --------------------------------------------------------
      // 3. ROSETA BASAL (AGAVE / BROMELIA)
      // Corona de 20 hojas carnosas en el suelo + escapo floral
      // --------------------------------------------------------
      const rosetteLeavesCount = 20;
      const phiGolden = 137.5 * (Math.PI / 180);

      for (let ri = 0; ri < rosetteLeavesCount; ri++) {
        const ru = ri / rosetteLeavesCount;
        const rLen = (1.6 - ru * 0.45) * (leafSize * 0.9);
        const rAngle = ri * phiGolden;
        const outX = Math.cos(rAngle);
        const outZ = Math.sin(rAngle);

        const rPivot = new THREE.Group();
        rPivot.position.set(0, 0.04 + ru * 0.20, 0);
        rPivot.rotation.y = Math.atan2(outX, outZ);
        rPivot.rotation.x = THREE.MathUtils.degToRad(15 + ru * 35); // Se abren hacia el exterior

        const rGeom = createSculptedLeafGeometry("oval", rLen, 0.52);
        const rMesh = new THREE.Mesh(rGeom, stemMat);
        rMesh.castShadow = true;
        rMesh.receiveShadow = true;
        rPivot.add(rMesh);
        plantGroup.add(rPivot);
      }

      // Escapo floral central esbelto que emerge desde el corazón de la roseta
      const scapePoints = [];
      const scapeSteps = 24;
      for (let i = 0; i <= scapeSteps; i++) {
        const t = i / scapeSteps;
        scapePoints.push(new THREE.Vector3(
          Math.sin(t * Math.PI) * (0.12 * curvature),
          t * height,
          Math.sin(t * Math.PI * 0.8) * (0.08 * curvature)
        ));
      }

      const scapeStem = createSculptedStem(scapePoints, baseThickness * 0.75, baseThickness * 0.25, "straight", 24);
      const scapeMesh = new THREE.Mesh(scapeStem.geometry, stemMat);
      scapeMesh.castShadow = true;
      scapeMesh.receiveShadow = true;
      plantGroup.add(scapeMesh);

      flowerSites.push({
        position: scapePoints[scapePoints.length - 1],
        scale: 1.05,
        isPrimary: true
      });

    } else if (shape === "spiral") {
      // --------------------------------------------------------
      // 4. VOLUBLE ESPIRAL (TIRABUZÓN HELICOIDAL AMPLIO)
      // Espiral pronunciada en sacacorchos 3D con zarcillos vivos
      // --------------------------------------------------------
      const stemPoints = [];
      const steps = 40;
      const helixRadius = 0.65 * curvature;
      const helixTurns = 2.6;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = t * Math.PI * 2 * helixTurns;
        const r = helixRadius * (0.65 + Math.sin(t * Math.PI) * 0.5);
        const x = Math.sin(angle) * r;
        const z = Math.cos(angle) * r;
        const y = t * height;
        stemPoints.push(new THREE.Vector3(x, y, z));
      }

      const { geometry: stemGeom, curve: stemCurve } = createSculptedStem(
        stemPoints,
        baseThickness * 1.1,
        baseThickness * 0.35,
        "straight",
        24
      );
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Hojas a lo largo del tirabuzón repartidas en 360°
      for (let i = 0; i < leafCount; i++) {
        const u = 0.18 + (i / leafCount) * 0.68;
        // Ángulo áureo que garantiza dispersión en todas las direcciones
        const rAngle = i * (Math.PI * 2 / 1.6180339887);
        attachLeafRadial(plantGroup, stemCurve, u, rAngle, leafSize, leafType, stemMat, baseThickness * 0.6);
      }

      // Zarcillos elásticos
      for (let ti = 0; ti < 3; ti++) {
        const tu = 0.28 + ti * 0.28;
        const tPos = stemCurve.getPointAt(tu);
        const tGeom = createTendril(tPos, new THREE.Vector3(Math.cos(ti * 2.2), 0.65, Math.sin(ti * 2.2)), 0.95, 3.0, 0.24);
        const tMesh = new THREE.Mesh(tGeom, stemMat);
        tMesh.castShadow = true;
        plantGroup.add(tMesh);
      }

      flowerSites.push({
        position: stemPoints[stemPoints.length - 1],
        scale: 1.0,
        isPrimary: true
      });

    } else if (shape === "sinuous") {
      // --------------------------------------------------------
      // 5. SINUOSO FLEXUOSO (CURVAS AMPLIAS ESCULTURALES EN S)
      // Tronco orgánico con curvas y contra-curvas marcadas
      // --------------------------------------------------------
      const stemPoints = [];
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Curvas pronunciadas en S
        const x = Math.sin(t * Math.PI * 1.8) * (0.95 * curvature);
        const z = Math.cos(t * Math.PI * 1.4) * (0.55 * curvature) - (t * 0.3);
        const y = t * height;
        stemPoints.push(new THREE.Vector3(x, y, z));
      }

      const { geometry: stemGeom, curve: stemCurve } = createSculptedStem(
        stemPoints,
        baseThickness * 1.35,
        baseThickness * 0.32,
        "straight",
        24
      );
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Hojas balanceadas en 360° en torno a las curvas
      for (let i = 0; i < leafCount; i++) {
        const u = 0.16 + (i / leafCount) * 0.70;
        const rAngle = i * (Math.PI * 2 / 1.6180339887);
        attachLeafRadial(plantGroup, stemCurve, u, rAngle, leafSize, leafType, stemMat, baseThickness * 0.7);
      }

      flowerSites.push({
        position: stemPoints[stemPoints.length - 1],
        scale: 1.0,
        isPrimary: true
      });

    } else if (shape === "nodose") {
      // --------------------------------------------------------
      // 6. NUDOSO ARTICULADO (BAMBÚ CON ANILLOS Y BANDAS LEÑOSAS)
      // Caña vertical con nudos prominentes y hojas agrupadas
      // --------------------------------------------------------
      const stemPoints = [];
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.sin(t * Math.PI) * (0.16 * curvature);
        const z = Math.cos(t * Math.PI * 0.8) * (0.10 * curvature) * (1 - t);
        const y = t * height;
        stemPoints.push(new THREE.Vector3(x, y, z));
      }

      const { geometry: stemGeom, curve: stemCurve } = createSculptedStem(
        stemPoints,
        baseThickness * 1.15,
        baseThickness * 0.45,
        "nodose",
        32
      );
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Hojas que brotan en los 5 nudos del bambú orientadas en 360°
      const nodesCount = 5;
      for (let n = 1; n <= nodesCount; n++) {
        const nu = (n / (nodesCount + 1));
        // Dos hojas opuestas en cada nudo
        const baseAngle = n * 1.25;
        attachLeafRadial(plantGroup, stemCurve, nu, baseAngle, leafSize * 0.85, "ribbon", stemMat, baseThickness * 0.6);
        attachLeafRadial(plantGroup, stemCurve, nu, baseAngle + Math.PI, leafSize * 0.85, "ribbon", stemMat, baseThickness * 0.6);
      }

      flowerSites.push({
        position: stemPoints[stemPoints.length - 1],
        scale: 0.95,
        isPrimary: true
      });

    } else {
      // --------------------------------------------------------
      // 7. ESCAPO ERGUIDO (CLÁSICO TALLO FLORAL VERTICAL)
      // Porte erguido y esbelto con hojas abrazadoras en la base
      // --------------------------------------------------------
      const stemPoints = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.sin(t * Math.PI) * (0.10 * curvature);
        const z = Math.sin(t * Math.PI * 0.7) * (0.06 * curvature);
        const y = t * height;
        stemPoints.push(new THREE.Vector3(x, y, z));
      }

      const { geometry: stemGeom, curve: stemCurve } = createSculptedStem(
        stemPoints,
        baseThickness,
        baseThickness * 0.28,
        "straight",
        24
      );
      const stemMesh = new THREE.Mesh(stemGeom, stemMat);
      stemMesh.castShadow = true;
      stemMesh.receiveShadow = true;
      plantGroup.add(stemMesh);

      // Hojas distribuidas equilibradamente en los 4 cuadrantes (360°)
      for (let i = 0; i < leafCount; i++) {
        const u = 0.14 + (i / leafCount) * 0.68;
        const rAngle = (i / leafCount) * Math.PI * 2 + (i * 0.35);
        attachLeafRadial(plantGroup, stemCurve, u, rAngle, leafSize, leafType, stemMat, baseThickness * 0.5);
      }

      flowerSites.push({
        position: stemPoints[stemPoints.length - 1],
        scale: 1.0,
        isPrimary: true
      });
    }

    // ========================================================
    // 2. FLORACIONES ESCULTÓRICAS EN LOS SITIOS FLORALES
    // ========================================================
    const petalsCount = parseInt(params.petalsCount) || 7;
    const flowerLayers = parseInt(params.flowerLayers) || 2;
    const baseFlowerScale = parseFloat(params.flowerScale) || 1.0;
    const flowerOpen = parseFloat(params.flowerOpen) || 0.75;
    const petalCurl = parseFloat(params.petalCurl) || 0.5;
    const flowerType = params.flowerType || "lotus";
    const centerType = params.centerType || "stamens";

    flowerSites.forEach((site) => {
      const flowerGroup = new THREE.Group();
      flowerGroup.position.copy(site.position);
      const flowerScale = baseFlowerScale * site.scale;

      // Cáliz botánico de sépalos verdes de soporte
      const sepalCount = 5;
      for (let s = 0; s < sepalCount; s++) {
        const sAngle = (s / sepalCount) * Math.PI * 2;
        const sepalGeom = createSculptedLeafGeometry("ribbon", 0.42 * flowerScale, 0.28);
        const sepalMesh = new THREE.Mesh(sepalGeom, stemMat);
        sepalMesh.rotation.y = sAngle;
        sepalMesh.rotation.x = 1.1;
        sepalMesh.position.y = -0.04 * flowerScale;
        sepalMesh.castShadow = true;
        flowerGroup.add(sepalMesh);
      }

      // Capas concéntricas de pétalos con ondulaciones
      for (let layer = 0; layer < flowerLayers; layer++) {
        const layerRatio = layer / Math.max(1, flowerLayers - 1);
        const layerPetalCount = Math.max(3, Math.round(petalsCount * (1.0 - layerRatio * 0.32)));
        const layerLength = (1.4 - layerRatio * 0.48) * flowerScale;
        const layerWidth = (0.78 - layerRatio * 0.28) * flowerScale;
        const layerOpen = THREE.MathUtils.lerp(flowerOpen, flowerOpen * 0.5, layerRatio);
        const angleOffset = layer * (Math.PI / layerPetalCount);

        for (let p = 0; p < layerPetalCount; p++) {
          const pAngle = (p / layerPetalCount) * Math.PI * 2 + angleOffset;
          const petalGeom = createSculptedPetalGeometry(
            flowerType,
            layerLength,
            layerWidth,
            layerOpen,
            petalCurl * (1.0 + layerRatio * 0.3)
          );
          const petalMesh = new THREE.Mesh(petalGeom, flowerMat);

          petalMesh.rotation.y = pAngle;
          petalMesh.position.y = layer * 0.12 * flowerScale;
          petalMesh.rotation.z = 0.08 * Math.sin(pAngle * 2);
          petalMesh.castShadow = true;
          petalMesh.receiveShadow = true;
          flowerGroup.add(petalMesh);
        }
      }

      // Corazón floral auténtico
      if (centerType === "stamens") {
        const filamentMat = new THREE.MeshStandardMaterial({
          color: 0xFFF9E6,
          roughness: 0.35,
          emissive: 0xFFE5A3,
          emissiveIntensity: 0.35
        });
        const antherMat = new THREE.MeshStandardMaterial({
          color: 0xE8A850,
          roughness: 0.25,
          emissive: 0xF3C68F,
          emissiveIntensity: 0.65
        });

        const stamenCount = site.isPrimary ? 14 : 8;
        for (let s = 0; s < stamenCount; s++) {
          const sa = (s / stamenCount) * Math.PI * 2 + (s % 2) * 0.2;
          const sRadius = (0.14 + (s % 3) * 0.05) * flowerScale;
          const sHeight = (0.42 + (s % 2) * 0.14) * flowerScale;

          const sPts = [
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(Math.cos(sa) * (sRadius * 0.6), sHeight * 0.5, Math.sin(sa) * (sRadius * 0.6)),
            new THREE.Vector3(Math.cos(sa) * sRadius, sHeight, Math.sin(sa) * sRadius)
          ];
          const sCurve = new THREE.CatmullRomCurve3(sPts);
          const filMesh = new THREE.Mesh(new THREE.TubeGeometry(sCurve, 8, 0.014 * flowerScale, 6, false), filamentMat);
          flowerGroup.add(filMesh);

          const antherGeom = new THREE.CylinderGeometry(0.022 * flowerScale, 0.018 * flowerScale, 0.08 * flowerScale, 6);
          const antherMesh = new THREE.Mesh(antherGeom, antherMat);
          antherMesh.position.copy(sPts[sPts.length - 1]);
          antherMesh.rotation.z = Math.cos(sa) * 0.6;
          antherMesh.rotation.x = Math.sin(sa) * 0.6;
          flowerGroup.add(antherMesh);
        }

        if (site.isPrimary) {
          const innerGlow = new THREE.PointLight(0xFFE5A3, 0.7, 3.2);
          innerGlow.position.y = 0.25 * flowerScale;
          flowerGroup.add(innerGlow);
        }

      } else if (centerType === "rosette") {
        const rosettePetals = 6;
        for (let rp = 0; rp < rosettePetals; rp++) {
          const rAngle = (rp / rosettePetals) * Math.PI * 2;
          const rGeom = createSculptedPetalGeometry("lotus", 0.45 * flowerScale, 0.25 * flowerScale, 0.25, 0.8);
          const rMesh = new THREE.Mesh(rGeom, flowerMat);
          rMesh.rotation.y = rAngle;
          rMesh.position.y = 0.14 * flowerScale;
          rMesh.castShadow = true;
          flowerGroup.add(rMesh);
        }

      } else if (centerType === "spadix") {
        const spadixMat = new THREE.MeshStandardMaterial({
          color: 0xFFEFBA,
          roughness: 0.35,
          emissive: 0xFFE082,
          emissiveIntensity: 0.55
        });
        const spPts = [
          new THREE.Vector3(0, 0.05, 0),
          new THREE.Vector3(0.08 * flowerScale, 0.4 * flowerScale, 0.05 * flowerScale),
          new THREE.Vector3(0.18 * flowerScale, 0.85 * flowerScale, 0.12 * flowerScale),
          new THREE.Vector3(0.24 * flowerScale, 1.15 * flowerScale, 0.16 * flowerScale)
        ];
        const spCurve = new THREE.CatmullRomCurve3(spPts);
        const spadixGeom = new THREE.TubeGeometry(spCurve, 18, 0.058 * flowerScale, 8, false);
        const spadixMesh = new THREE.Mesh(spadixGeom, spadixMat);
        spadixMesh.castShadow = true;
        flowerGroup.add(spadixMesh);

      } else if (centerType === "dewdrops") {
        const dewMat = new THREE.MeshPhysicalMaterial({
          color: 0xFFFFFF,
          roughness: 0.05,
          transmission: 0.92,
          thickness: 0.3,
          transparent: true,
          opacity: 0.95
        });
        for (let d = 0; d < 8; d++) {
          const da = (d / 8) * Math.PI * 2 + 0.2;
          const drad = (0.16 + (d % 3) * 0.05) * flowerScale;
          const dew = new THREE.Mesh(new THREE.SphereGeometry(0.055 * flowerScale, 10, 10), dewMat);
          dew.position.set(Math.cos(da) * drad, (0.08 + (d % 2) * 0.03) * flowerScale, Math.sin(da) * drad);
          flowerGroup.add(dew);
        }

      } else { // hollow
        const calyxBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18 * flowerScale, 0.08 * flowerScale, 0.14 * flowerScale, 12),
          stemMat
        );
        calyxBase.position.y = 0.05 * flowerScale;
        calyxBase.castShadow = true;
        flowerGroup.add(calyxBase);
      }

      plantGroup.add(flowerGroup);
    });

    plantGroup.userData = {
      ...params,
      id: params.id || "plant_" + Date.now(),
      likes: params.likes || 0,
      notes: params.notes || [],
      createdAt: params.createdAt || new Date().toISOString()
    };

    return plantGroup;
  }

  return {
    buildPlant: buildPlant,
    createPlantMaterial: createPlantMaterial
  };

})();
