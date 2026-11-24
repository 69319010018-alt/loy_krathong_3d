/**
 * world.js - Breathtaking Thai Festival Fairgrounds & Atmospheric World
 * Features:
 * - Volumetric Moonbeam God Rays casting moonlight across river and temple
 * - Multi-layered glowing Full Moon & Shooting Stars (ดาวตก)
 * - Tropical Coconut Palms & Banana groves
 * - Grand Thai Ubosot with illuminated stained-glass windows & Golden Chedi with Naga stairs
 * - Giant spinning Ferris Wheel with neon starburst
 * - Retro Ramwong folk dance stage with disco festival lights
 * - Stalls, glowing lanterns, and festive bunting
 */

import * as THREE from 'three';

export class FestivalWorld {
  constructor(scene) {
    this.scene = scene;
    this.skyLanterns = [];
    this.ferrisWheel = null;
    this.ferrisLights = [];
    this.interactables = [];
    this.shootingStars = [];
    this.stageLights = [];
    this.init();
  }

  init() {
    this.setupEnvironmentLighting();
    this.buildSkyAndMoon();
    this.buildMoonbeams();
    this.buildSkyLanterns();
    this.buildGroundAndPier();
    this.buildTempleArchitecture();
    this.buildFerrisWheel();
    this.buildRamwongStage();
    this.buildFairgroundStalls();
    this.buildFlora();
    this.buildFestivalDecorations();
  }

  // 1. Lighting Setup
  setupEnvironmentLighting() {
    // Deep midnight indigo ambient light
    const ambientLight = new THREE.AmbientLight(0x1e2b4d, 1.4);
    this.scene.add(ambientLight);

    // Moonlight: Directional light from high above the river
    const moonLight = new THREE.DirectionalLight(0xdbe9ff, 2.0);
    moonLight.position.set(-60, 85, -45);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 10;
    moonLight.shadow.camera.far = 220;
    moonLight.shadow.camera.left = -50;
    moonLight.shadow.camera.right = 50;
    moonLight.shadow.camera.top = 50;
    moonLight.shadow.camera.bottom = -50;
    moonLight.shadow.bias = -0.001;
    this.scene.add(moonLight);

    // Warm golden festival ground fill light
    const groundFill = new THREE.DirectionalLight(0xffa834, 0.75);
    groundFill.position.set(35, 25, 25);
    this.scene.add(groundFill);
  }

  // 2. Starry Celestial Sky & Multi-layered Full Moon (พระจันทร์วันเพ็ญ)
  buildSkyAndMoon() {
    // 2.1 Starfield with twinkling colors
    const starCount = 800;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 260;

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) + 10;
      starPos[i * 3 + 2] = r * Math.cos(phi);

      // Subtle celestial star tints (white, gold, cyan, soft lavender)
      const tint = Math.random();
      if (tint < 0.6) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
      } else if (tint < 0.8) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.88; starColors[i * 3 + 2] = 0.6;
      } else {
        starColors[i * 3] = 0.65; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      }
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });
    this.starPoints = new THREE.Points(starGeom, starMat);
    this.scene.add(this.starPoints);

    // 2.2 Realistic 3D Full Moon with Crater Canvas Texture
    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 512;
    moonCanvas.height = 512;
    const mCtx = moonCanvas.getContext('2d');

    const grad = mCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, '#fffef2');
    grad.addColorStop(0.65, '#fef2b8');
    grad.addColorStop(0.9, '#ecd17d');
    grad.addColorStop(1, '#c9a449');
    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, 512, 512);

    // Detailed lunar maria & craters
    mCtx.fillStyle = 'rgba(175, 145, 80, 0.25)';
    const craters = [
      [180, 200, 75], [310, 290, 90], [260, 160, 55],
      [360, 180, 48], [170, 320, 62], [240, 360, 42],
      [220, 240, 35], [300, 210, 30]
    ];
    craters.forEach(([cx, cy, cr]) => {
      mCtx.beginPath();
      mCtx.arc(cx, cy, cr, 0, Math.PI * 2);
      mCtx.fill();
    });

    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    const moonGeom = new THREE.SphereGeometry(15, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTexture,
      color: 0xfff6cf
    });
    this.moon = new THREE.Mesh(moonGeom, moonMat);
    this.moon.position.set(-95, 115, -75);
    this.scene.add(this.moon);

    // Multi-Layered Glowing Moon Corona (Inner Gold + Outer Mystical Cyan Halo)
    this.buildMoonCorona(this.moon.position);

    // 2.3 Shooting Stars System (ดาวตก)
    this.initShootingStars();
  }

  // Multi-layered glowing moon halo
  buildMoonCorona(pos) {
    // Layer 1: Warm golden inner glow
    const hCanvas = document.createElement('canvas');
    hCanvas.width = 256; hCanvas.height = 256;
    const hCtx = hCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(128, 128, 15, 128, 128, 128);
    hGrad.addColorStop(0, 'rgba(255, 248, 200, 0.85)');
    hGrad.addColorStop(0.35, 'rgba(255, 215, 120, 0.4)');
    hGrad.addColorStop(0.7, 'rgba(255, 180, 70, 0.15)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 256, 256);

    const halo1 = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(hCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    halo1.scale.set(65, 65, 1);
    halo1.position.copy(pos);
    this.scene.add(halo1);

    // Layer 2: Ethereal outer blue-cyan halo
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 256; bCanvas.height = 256;
    const bCtx = bCanvas.getContext('2d');
    const bGrad = bCtx.createRadialGradient(128, 128, 30, 128, 128, 128);
    bGrad.addColorStop(0, 'rgba(120, 200, 255, 0.25)');
    bGrad.addColorStop(0.6, 'rgba(80, 140, 255, 0.08)');
    bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bCtx.fillStyle = bGrad;
    bCtx.fillRect(0, 0, 256, 256);

    const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(bCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    halo2.scale.set(110, 110, 1);
    halo2.position.copy(pos);
    this.scene.add(halo2);
  }

  // Volumetric Moonbeam God Rays (ลำแสงจันทร์ส่องต้องสายน้ำ)
  buildMoonbeams() {
    const beamGeom = new THREE.CylinderGeometry(8, 35, 160, 16, 1, true);
    beamGeom.rotateX(-0.65);
    beamGeom.rotateY(0.4);

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x88ccee,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const moonbeam = new THREE.Mesh(beamGeom, beamMat);
    moonbeam.position.set(-55, 55, -35);
    this.scene.add(moonbeam);
    this.moonbeam = moonbeam;
  }

  // Shooting Stars System
  initShootingStars() {
    this.starTimer = 0;
    this.shootingStarMesh = null;

    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(6); // 2 vertices for a line streak
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    this.shootingStarMesh = new THREE.Line(geom, mat);
    this.shootingStarMesh.visible = false;
    this.scene.add(this.shootingStarMesh);
  }

  spawnShootingStar() {
    if (!this.shootingStarMesh) return;
    const startX = -80 + Math.random() * 120;
    const startY = 80 + Math.random() * 40;
    const startZ = -100 + Math.random() * 80;

    this.starData = {
      pos: new THREE.Vector3(startX, startY, startZ),
      vel: new THREE.Vector3(35 + Math.random() * 25, -25 - Math.random() * 15, 20 + Math.random() * 20),
      life: 1.0
    };
    this.shootingStarMesh.visible = true;
  }

  // 3. Sky Lanterns (โคมลอยยี่เป็งเรืองแสง)
  buildSkyLanterns() {
    const lanternGeom = new THREE.CylinderGeometry(0.38, 0.48, 0.95, 8);
    const lanternMat = new THREE.MeshBasicMaterial({
      color: 0xffa834,
      transparent: true,
      opacity: 0.92
    });

    for (let i = 0; i < 40; i++) {
      const lantern = new THREE.Mesh(lanternGeom, lanternMat);
      const x = -50 + Math.random() * 110;
      const y = 8 + Math.random() * 75;
      const z = -70 + Math.random() * 130;

      lantern.position.set(x, y, z);
      this.scene.add(lantern);

      this.skyLanterns.push({
        mesh: lantern,
        speedY: 0.8 + Math.random() * 1.4,
        driftX: 0.2 + Math.random() * 0.35,
        seed: Math.random() * 10
      });
    }
  }

  // 4. Courtyard, Embankment & Pier (ท่าน้ำวัดริมคลอง)
  buildGroundAndPier() {
    const groundGeom = new THREE.PlaneGeometry(75, 220, 16, 16);
    groundGeom.rotateX(-Math.PI / 2);

    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 256; groundCanvas.height = 256;
    const gCtx = groundCanvas.getContext('2d');
    gCtx.fillStyle = '#261f18';
    gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = 'rgba(255, 220, 150, 0.06)';
    gCtx.lineWidth = 2;
    for (let i = 0; i < 256; i += 32) {
      gCtx.beginPath(); gCtx.moveTo(i, 0); gCtx.lineTo(i, 256); gCtx.stroke();
      gCtx.beginPath(); gCtx.moveTo(0, i); gCtx.lineTo(256, i); gCtx.stroke();
    }

    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(15, 45);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3d3328,
      roughness: 0.85,
      map: groundTexture
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.set(32, 0, 0);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // River embankment
    const bankGeom = new THREE.BoxGeometry(6, 1.2, 220);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x241e17, roughness: 0.9 });
    const bank = new THREE.Mesh(bankGeom, bankMat);
    bank.position.set(-4, -0.2, 0);
    bank.rotation.z = -0.15;
    this.scene.add(bank);

    // The Wooden Pier (ท่าน้ำวัดริมคลอง)
    const pierGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x543b2a, roughness: 0.7 });

    const deckGeom = new THREE.BoxGeometry(12, 0.35, 14);
    const deck = new THREE.Mesh(deckGeom, woodMat);
    deck.position.set(-8, 0.1, 0);
    deck.receiveShadow = true;
    pierGroup.add(deck);

    // Stilts
    const stiltGeom = new THREE.CylinderGeometry(0.2, 0.2, 3.5, 6);
    [[-13.5, -1.2, -6], [-13.5, -1.2, 6], [-8, -1.2, -6], [-8, -1.2, 6], [-3, -1.2, -6], [-3, -1.2, 6]].forEach(([sx, sy, sz]) => {
      const stilt = new THREE.Mesh(stiltGeom, woodMat);
      stilt.position.set(sx, sy, sz);
      pierGroup.add(stilt);
    });

    // Lower steps to water
    const stepGeom = new THREE.BoxGeometry(3, 0.2, 6);
    for (let s = 1; s <= 3; s++) {
      const step = new THREE.Mesh(stepGeom, woodMat);
      step.position.set(-13.5 - (s * 1.2), 0.1 - (s * 0.2), 0);
      pierGroup.add(step);
    }

    // Railing posts with glowing lanterns
    const postGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.6, 6);
    const pLanternGeom = new THREE.SphereGeometry(0.25, 8, 8);
    const pLanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });

    const railingPoints = [
      [-13.5, 0.8, -6.5], [-8, 0.8, -6.5], [-3, 0.8, -6.5],
      [-13.5, 0.8, 6.5], [-8, 0.8, 6.5], [-3, 0.8, 6.5]
    ];
    railingPoints.forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeom, woodMat);
      post.position.set(px, py, pz);
      pierGroup.add(post);

      const pLantern = new THREE.Mesh(pLanternGeom, pLanternMat);
      pLantern.position.set(px, py + 0.9, pz);
      pierGroup.add(pLantern);
    });

    // 1 Shared Warm Pier Light
    const pierLight = new THREE.PointLight(0xffaa22, 2.2, 18);
    pierLight.position.set(-8, 2.2, 0);
    pierGroup.add(pierLight);

    // Pier Entrance Arch (ซุ้มท่าน้ำ)
    const archGroup = new THREE.Group();
    const pillarGeom = new THREE.CylinderGeometry(0.25, 0.25, 4.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const p1 = new THREE.Mesh(pillarGeom, pillarMat);
    p1.position.set(-2, 2.1, -3.5);
    const p2 = new THREE.Mesh(pillarGeom, pillarMat);
    p2.position.set(-2, 2.1, 3.5);
    archGroup.add(p1, p2);

    const archTopGeom = new THREE.BoxGeometry(0.6, 0.5, 8);
    const archTopMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 });
    const archTop = new THREE.Mesh(archTopGeom, archTopMat);
    archTop.position.set(-2, 4.3, 0);
    archGroup.add(archTop);

    pierGroup.add(archGroup);
    this.scene.add(pierGroup);

    this.interactables.push({
      type: 'pier',
      position: new THREE.Vector3(-14, 0, 0),
      radius: 4.5,
      label: 'กด [E] หรือคลิก เพื่อลอยกระทงลงสู่แม่น้ำ 🪷'
    });
  }

  // 5. Thai Temple Architecture (พระอุโบสถ & พระบรมธาตุเจดีย์สีทอง)
  buildTempleArchitecture() {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(38, 0, -20);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffc837, metalness: 0.88, roughness: 0.22 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0x9b1b1b, roughness: 0.4 });

    // 5.1 Golden Chedi (พระบรมธาตุเจดีย์สีทอง)
    const chediGroup = new THREE.Group();
    chediGroup.position.set(0, 0, -25);

    // Tiered Pedestal with Lotus base
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(16, 2, 16), whiteMat);
    tier1.position.y = 1;
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(13, 1.8, 13), whiteMat);
    tier2.position.y = 2.9;
    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.5, 10.5), goldMat);
    tier3.position.y = 4.5;
    chediGroup.add(tier1, tier2, tier3);

    // Bell-shaped dome
    const bellGeom = new THREE.CylinderGeometry(2.8, 4.8, 6.5, 20);
    const bell = new THREE.Mesh(bellGeom, goldMat);
    bell.position.y = 8.5;
    chediGroup.add(bell);

    // Golden Throne & Pointed Spire
    const throne = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 3.2), goldMat);
    throne.position.y = 12.2;
    chediGroup.add(throne);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(2.0, 14, 16), goldMat);
    spire.position.y = 19.5;
    chediGroup.add(spire);

    // Glowing Golden Finial Gem on Spire Peak
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfffae0 }));
    gem.position.y = 26.5;
    chediGroup.add(gem);

    // Chedi Spotlight
    const chediSpot = new THREE.SpotLight(0xffd700, 3.5, 55, Math.PI / 4, 0.4);
    chediSpot.position.set(0, 1, 15);
    chediSpot.target = chediGroup;
    chediGroup.add(chediSpot);

    templeGroup.add(chediGroup);

    // 5.2 Ubosot (พระอุโบสถทรงไทยพร้อมหน้าต่างเรืองแสง)
    const ubosotGroup = new THREE.Group();
    ubosotGroup.position.set(0, 0, 10);

    const hallBase = new THREE.Mesh(new THREE.BoxGeometry(18, 1.5, 28), whiteMat);
    hallBase.position.y = 0.75;
    const hallWalls = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 24), whiteMat);
    hallWalls.position.y = 5.0;
    ubosotGroup.add(hallBase, hallWalls);

    // Columns
    const colGeom = new THREE.CylinderGeometry(0.4, 0.45, 7, 8);
    for (let c = -1; c <= 1; c += 2) {
      for (let z = -11; z <= 11; z += 5.5) {
        const col = new THREE.Mesh(colGeom, redMat);
        col.position.set(c * 7.5, 5.0, z);
        ubosotGroup.add(col);
      }
    }

    // Glowing Stained Glass Temple Windows (หน้าต่างอุโบสถส่องแสงอบอุ่น)
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffcc44 });
    const winGeom = new THREE.BoxGeometry(0.1, 2.2, 1.2);
    for (let z = -7; z <= 7; z += 4.5) {
      const wLeft = new THREE.Mesh(winGeom, winMat);
      wLeft.position.set(-7.06, 5.0, z);
      const wRight = new THREE.Mesh(winGeom, winMat);
      wRight.position.set(7.06, 5.0, z);
      ubosotGroup.add(wLeft, wRight);
    }

    // Tiered Thai Gable Roof
    for (let r = 0; r < 3; r++) {
      const roofGeom = new THREE.ConeGeometry(12 - r * 1.8, 4.5, 4);
      roofGeom.rotateY(Math.PI / 4);
      roofGeom.scale(1.2, 0.7, 2.2);
      const roof = new THREE.Mesh(roofGeom, redMat);
      roof.position.set(0, 9.5 + r * 2.2, 0);
      ubosotGroup.add(roof);

      // Golden Chofa Finials (ช่อฟ้า)
      const chofaGeom = new THREE.ConeGeometry(0.3, 2.2, 4);
      const chofaFront = new THREE.Mesh(chofaGeom, goldMat);
      chofaFront.position.set(0, 11.2 + r * 2.2, 12 - r * 2.5);
      chofaFront.rotation.x = 0.4;
      const chofaBack = chofaFront.clone();
      chofaBack.position.z = -(12 - r * 2.5);
      chofaBack.rotation.x = -0.4;
      ubosotGroup.add(chofaFront, chofaBack);
    }

    // Golden Entrance Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.8, 5, 0.4), goldMat);
    door.position.set(0, 4.2, 12.1);
    ubosotGroup.add(door);

    templeGroup.add(ubosotGroup);
    this.scene.add(templeGroup);
  }

  // 6. Giant Ferris Wheel with Neon Starburst (ชิงช้าสวรรค์ไฟนีออน)
  buildFerrisWheel() {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(45, 0, 45);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.8, roughness: 0.3 });

    // A-frame Legs
    const legGeom = new THREE.CylinderGeometry(0.4, 0.5, 26, 6);
    const leg1 = new THREE.Mesh(legGeom, metalMat);
    leg1.position.set(0, 12, 7); leg1.rotation.x = 0.28;
    const leg2 = new THREE.Mesh(legGeom, metalMat);
    leg2.position.set(0, 12, -7); leg2.rotation.x = -0.28;
    wheelGroup.add(leg1, leg2);

    // Rotating Wheel
    const rotatingWheel = new THREE.Group();
    rotatingWheel.position.set(0, 22, 0);

    const rimGeom = new THREE.TorusGeometry(14, 0.3, 8, 30);
    rimGeom.rotation.y = Math.PI / 2;
    rotatingWheel.add(new THREE.Mesh(rimGeom, metalMat));

    // Central Glowing Neon Starburst Hub
    const starHub = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.6),
      new THREE.MeshBasicMaterial({ color: 0xffea00 })
    );
    rotatingWheel.add(starHub);
    this.ferrisStarHub = starHub;

    const spokeGeom = new THREE.CylinderGeometry(0.12, 0.12, 28, 6);
    const neonColors = [0xff0055, 0x00f5d4, 0xffb703, 0x7b2cbf, 0x38ef7d, 0xff70a6];
    const cabinCount = 12;

    for (let i = 0; i < cabinCount; i++) {
      const angle = (i / cabinCount) * Math.PI * 2;

      if (i < cabinCount / 2) {
        const spoke = new THREE.Mesh(spokeGeom, metalMat);
        spoke.rotation.x = angle;
        rotatingWheel.add(spoke);
      }

      const cabinGroup = new THREE.Group();
      cabinGroup.position.set(0, Math.sin(angle) * 14, Math.cos(angle) * 14);

      const color = neonColors[i % neonColors.length];
      const cabinBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.0), new THREE.MeshStandardMaterial({ color: color, roughness: 0.4 }));
      cabinBody.position.y = -1.2;
      cabinGroup.add(cabinBody);

      // Glowing Neon bulb
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
      bulb.position.y = -1.2;
      cabinGroup.add(bulb);

      rotatingWheel.add(cabinGroup);
      this.ferrisLights.push({ cabinGroup });
    }

    wheelGroup.add(rotatingWheel);
    this.ferrisWheel = rotatingWheel;
    this.scene.add(wheelGroup);
  }

  // 7. Retro Thai Folk Dance Stage (เวทีรำวงย้อนยุค)
  buildRamwongStage() {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(30, 0, -2);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.7 });

    // Raised Circular Stage
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.0, 1.2, 18), woodMat);
    platform.position.y = 0.6;
    stageGroup.add(platform);

    // Glowing Neon Banner Frame
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.4, 7),
      new THREE.MeshBasicMaterial({ color: 0xff0077 })
    );
    banner.position.set(0, 4.2, 0);
    stageGroup.add(banner);

    // Colored Party Disco Spotlights
    const partyColors = [0xff0055, 0x00f5d4, 0xffd700, 0x9d4edd];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spot = new THREE.SpotLight(partyColors[i], 2.0, 22, Math.PI / 5, 0.5);
      spot.position.set(Math.cos(angle) * 6, 4.5, Math.sin(angle) * 6);
      spot.target = platform;
      stageGroup.add(spot);
      this.stageLights.push(spot);
    }

    this.scene.add(stageGroup);
  }

  // 8. Stalls (ร้านกระทง, ร้านปาลูกโป่ง, ซุ้มเซียมซี, สตรีทฟู้ด)
  buildFairgroundStalls() {
    // ร้านกระทงลุงสมคิด
    this.createStall({
      pos: new THREE.Vector3(8, 0, 5),
      roofColor: 0x2d6a4f
    });

    const sample1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 10), new THREE.MeshStandardMaterial({ color: 0x38761d }));
    sample1.position.set(8, 1.2, 5.2);
    const sample2 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 10), new THREE.MeshStandardMaterial({ color: 0xff758c }));
    sample2.position.set(9.2, 1.2, 5.2);
    this.scene.add(sample1, sample2);

    this.createShopkeeperNPC(new THREE.Vector3(8, 0, 3.8));

    this.interactables.push({
      type: 'shop',
      position: new THREE.Vector3(8, 0, 6.5),
      radius: 3.5,
      label: 'กด [E] หรือคลิก เพื่อเลือกลอยกระทงกับลุงสมคิด 🪷'
    });

    // ร้านปาลูกโป่งงานวัด
    this.createStall({
      pos: new THREE.Vector3(12, 0, 22),
      roofColor: 0xff0055
    });

    const balloonBoard = new THREE.Group();
    balloonBoard.position.set(12, 2.2, 21.2);
    const bColors = [0xff0055, 0x00f5d4, 0xffb703, 0xff70a6, 0x9d4edd];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 6, 6),
          new THREE.MeshStandardMaterial({ color: bColors[(r * 5 + c) % bColors.length] })
        );
        b.position.set((c - 2) * 0.6, (r - 1) * 0.55, 0);
        balloonBoard.add(b);
      }
    }
    this.scene.add(balloonBoard);

    this.interactables.push({
      type: 'balloon',
      position: new THREE.Vector3(12, 0, 23.5),
      radius: 3.5,
      label: 'กด [E] หรือคลิก เพื่อเล่นเกมปาลูกโป่ง 🎯'
    });

    // ซุ้มเสี่ยงเซียมซีมงคล
    this.createStall({
      pos: new THREE.Vector3(8, 0, -18),
      roofColor: 0x9d4edd
    });

    this.interactables.push({
      type: 'esiimsi',
      position: new THREE.Vector3(8, 0, -16.5),
      radius: 3.5,
      label: 'กด [E] หรือคลิก เพื่อเสี่ยงเซียมซีขอพร 🎋'
    });

    // ร้านสตรีทฟู้ด ลูกชิ้นปิ้ง พร้อมเตาถ่านแดงเรืองแสง
    const foodStall = this.createStall({
      pos: new THREE.Vector3(22, 0, 6),
      roofColor: 0xff8008
    });

    // Glowing charcoal grill (เตาถ่านไฟแดง)
    const grill = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.4, 0.7),
      new THREE.MeshBasicMaterial({ color: 0xff3300 })
    );
    grill.position.set(22, 1.25, 6);
    this.scene.add(grill);
  }

  createStall({ pos, roofColor }) {
    const stall = new THREE.Group();
    stall.position.copy(pos);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x543b2a, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.5 });

    const table = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 1.6), woodMat);
    table.position.set(0, 0.55, 0);
    stall.add(table);

    const postGeom = new THREE.CylinderGeometry(0.1, 0.1, 3.2, 6);
    [[-2, 1.6, -1], [2, 1.6, -1], [-2, 1.6, 0.8], [2, 1.6, 0.8]].forEach(([px, py, pz]) => {
      const post = new THREE.Mesh(postGeom, woodMat);
      post.position.set(px, py, pz);
      stall.add(post);
    });

    const roofGeom = new THREE.ConeGeometry(3.5, 1.4, 4);
    roofGeom.rotateY(Math.PI / 4);
    roofGeom.scale(1.2, 0.8, 1.0);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(0, 3.6, 0);
    stall.add(roof);

    // Warm Hanging Lantern
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffcc33 }));
    lantern.position.set(0, 2.7, 0.4);
    stall.add(lantern);

    this.scene.add(stall);
    return stall;
  }

  createShopkeeperNPC(pos) {
    const npc = new THREE.Group();
    npc.position.copy(pos);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfa07e, roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x1d3557, roughness: 0.7 });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), skinMat);
    head.position.y = 1.65;
    npc.add(head);

    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 10), new THREE.MeshStandardMaterial({ color: 0xd4a373 }));
    hat.position.set(0, 1.88, 0);
    npc.add(hat);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.35), clothMat);
    torso.position.y = 1.15;
    npc.add(torso);

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.38), new THREE.MeshStandardMaterial({ color: 0xe63946 }));
    sash.position.y = 0.85;
    npc.add(sash);

    this.scene.add(npc);
  }

  // 9. Tropical Flora (ต้นมะพร้าว & ดงกล้วยริมน้ำ)
  buildFlora() {
    const palmLocations = [
      [-1.5, 0, -25], [-2, 0, 28], [15, 0, 35], [2, 0, -50], [28, 0, -35]
    ];
    palmLocations.forEach(([x, y, z]) => {
      this.createPalmTree(x, y, z);
    });

    const bananaLocations = [
      [2, 0, -10], [1, 0, 18], [-1, 0, -40]
    ];
    bananaLocations.forEach(([x, y, z]) => {
      this.createBananaTree(x, y, z);
    });
  }

  createPalmTree(x, y, z) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e5239, roughness: 0.8 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.5, side: THREE.DoubleSide });

    // Curved Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.28, 0.45, 9, 8);
    trunkGeom.translate(0, 4.5, 0);
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.rotation.z = (Math.random() - 0.5) * 0.18;
    tree.add(trunk);

    // Arching Palm Fronds
    const frondGeom = new THREE.ConeGeometry(0.6, 4.8, 3);
    frondGeom.scale(1.0, 1.0, 0.2);
    frondGeom.rotateX(Math.PI / 2);

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const frond = new THREE.Mesh(frondGeom, frondMat);
      frond.position.set(0, 8.8, 0);
      frond.rotation.y = angle;
      frond.rotation.x = -0.55;
      tree.add(frond);
    }
    this.scene.add(tree);
  }

  createBananaTree(x, y, z) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4f772d, roughness: 0.6 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x55a630, roughness: 0.4, side: THREE.DoubleSide });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 3.8, 6), trunkMat);
    trunk.position.y = 1.9;
    tree.add(trunk);

    // Broad tropical banana leaves
    const leafGeom = new THREE.ConeGeometry(0.8, 3.2, 4);
    leafGeom.scale(1.2, 1.0, 0.1);
    leafGeom.rotateX(Math.PI / 2);

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeom, leafMat);
      leaf.position.set(0, 3.6, 0);
      leaf.rotation.y = angle;
      leaf.rotation.x = -0.65;
      tree.add(leaf);
    }
    this.scene.add(tree);
  }

  // 10. Festive Bunting Flags & Hanging Lanterns
  buildFestivalDecorations() {
    const flagColors = [0xff0055, 0xffb703, 0x00f5d4, 0x9d4edd, 0x38ef7d, 0xff70a6];

    const lines = [
      [[-2, 4, -20], [25, 4, -20]],
      [[-2, 4, 15], [25, 4, 15]],
      [[10, 4, -15], [10, 4, 25]]
    ];

    lines.forEach(([start, end]) => {
      const p1 = new THREE.Vector3(...start);
      const p2 = new THREE.Vector3(...end);
      const dist = p1.distanceTo(p2);
      const flagCount = Math.floor(dist / 1.5);

      for (let i = 0; i < flagCount; i++) {
        const t = i / flagCount;
        const pos = new THREE.Vector3().lerpVectors(p1, p2, t);
        pos.y -= Math.sin(t * Math.PI) * 0.4;

        const flagGeom = new THREE.ConeGeometry(0.28, 0.5, 3);
        flagGeom.rotateX(Math.PI);
        const flagMat = new THREE.MeshBasicMaterial({
          color: flagColors[i % flagColors.length],
          side: THREE.DoubleSide
        });
        const flag = new THREE.Mesh(flagGeom, flagMat);
        flag.position.copy(pos);
        this.scene.add(flag);
      }
    });

    // Hanging spherical festival lanterns
    const lanternPositions = [
      [5, 3.2, -5, 0xffb703],
      [15, 3.2, -10, 0xff006e],
      [18, 3.2, 12, 0x00f5d4],
      [28, 3.2, -2, 0x9d4edd]
    ];

    lanternPositions.forEach(([x, y, z, color]) => {
      const lMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 8, 8),
        new THREE.MeshBasicMaterial({ color: color })
      );
      lMesh.position.set(x, y, z);
      this.scene.add(lMesh);
    });

    const festLight1 = new THREE.PointLight(0xffb703, 1.8, 25);
    festLight1.position.set(10, 3.5, 0);
    const festLight2 = new THREE.PointLight(0xff006e, 1.5, 25);
    festLight2.position.set(25, 3.5, 10);
    this.scene.add(festLight1, festLight2);
  }

  update(delta, time) {
    // 1. Rotate Ferris Wheel & Pulse Neon Hub
    if (this.ferrisWheel) {
      this.ferrisWheel.rotation.x += delta * 0.2;

      this.ferrisLights.forEach(({ cabinGroup }) => {
        cabinGroup.rotation.x = -this.ferrisWheel.rotation.x;
      });

      if (this.ferrisStarHub) {
        const s = 1.0 + Math.sin(time * 4) * 0.15;
        this.ferrisStarHub.scale.set(s, s, s);
      }
    }

    // 2. Animate Sky Lanterns
    for (let i = 0; i < this.skyLanterns.length; i++) {
      const sl = this.skyLanterns[i];
      const pos = sl.mesh.position;

      pos.y += sl.speedY * delta;
      pos.x += sl.driftX * delta;
      pos.z += Math.sin(time + sl.seed) * 0.15 * delta;

      if (pos.y > 90) {
        pos.y = 8 + Math.random() * 5;
        pos.x = -50 + Math.random() * 60;
        pos.z = -70 + Math.random() * 120;
      }
    }

    // 3. Subtle Sway for Moonbeam God Rays
    if (this.moonbeam) {
      this.moonbeam.material.opacity = 0.1 + Math.sin(time * 0.8) * 0.03;
    }

    // 4. Update Shooting Stars
    this.starTimer += delta;
    if (this.starTimer > 6.0) {
      this.starTimer = Math.random() * 2;
      this.spawnShootingStar();
    }

    if (this.shootingStarMesh && this.starData) {
      this.starData.life -= delta * 1.4;
      if (this.starData.life <= 0) {
        this.shootingStarMesh.visible = false;
        this.starData = null;
      } else {
        const posAttr = this.shootingStarMesh.geometry.attributes.position;
        const cur = this.starData.pos;
        cur.addScaledVector(this.starData.vel, delta);

        const tail = cur.clone().addScaledVector(this.starData.vel, -0.06);

        posAttr.setXYZ(0, cur.x, cur.y, cur.z);
        posAttr.setXYZ(1, tail.x, tail.y, tail.z);
        posAttr.needsUpdate = true;
      }
    }

    // 5. Ramwong stage disco spotlights sway
    for (let i = 0; i < this.stageLights.length; i++) {
      const spot = this.stageLights[i];
      spot.intensity = 1.4 + Math.sin(time * 5 + i) * 0.8;
    }
  }
}
