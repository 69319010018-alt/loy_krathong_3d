/**
 * water.js - Animated River Water with Sparkling Moonpath & River Mist
 */

import * as THREE from 'three';

export class RiverWater {
  constructor(scene) {
    this.scene = scene;
    this.time = 0;
    this.mesh = null;
    this.mistParticles = null;
    this.init();
  }

  init() {
    // 1. Procedural High-Detail Water Texture with Caustics & Glitter
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep midnight river gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    bgGrad.addColorStop(0, '#040d1a');
    bgGrad.addColorStop(0.5, '#071b34');
    bgGrad.addColorStop(1, '#051224');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Multi-layered water ripples and caustics
    for (let i = 0; i < 350; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 8 + Math.random() * 28;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, 'rgba(80, 200, 255, 0.35)');
      grad.addColorStop(0.4, 'rgba(30, 120, 200, 0.18)');
      grad.addColorStop(1, 'rgba(4, 13, 26, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moonlight sparkle glitter dots on wave crests
    for (let i = 0; i < 180; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = 'rgba(255, 250, 220, 0.45)';
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const waterTexture = new THREE.CanvasTexture(canvas);
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.repeat.set(8, 24);
    this.waterTexture = waterTexture;

    // 2. Optimized Wave Surface
    const geom = new THREE.PlaneGeometry(65, 230, 28, 56);
    geom.rotateX(-Math.PI / 2);
    this.basePositions = geom.attributes.position.clone();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x071e3d,
      roughness: 0.1,
      metalness: 0.85,
      map: waterTexture,
      bumpMap: waterTexture,
      bumpScale: 0.35,
      transparent: true,
      opacity: 0.94
    });

    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.position.set(-26, -0.4, 0);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // 3. Floating River Mist (หมอกจางๆ เหนือผิวน้ำยามค่ำคืน)
    this.buildRiverMist();

    // 4. Floating Water Lilies & Lotus pads along the riverbank
    this.buildWaterLilies();
  }

  // Floating mystical river mist billowing softly over the water
  buildRiverMist() {
    const mistCount = 45;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(mistCount * 3);
    this.mistData = [];

    for (let i = 0; i < mistCount; i++) {
      const x = -40 + Math.random() * 26;
      const y = -0.1 + Math.random() * 0.3;
      const z = -90 + Math.random() * 180;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.mistData.push({
        baseX: x,
        baseZ: z,
        speedX: 0.15 + Math.random() * 0.2,
        speedZ: 0.4 + Math.random() * 0.6,
        seed: Math.random() * 100
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Soft puff canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(180, 220, 255, 0.35)');
    grad.addColorStop(0.5, 'rgba(120, 170, 230, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const mistMat = new THREE.PointsMaterial({
      size: 14.0,
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.mistParticles = new THREE.Points(geom, mistMat);
    this.scene.add(this.mistParticles);
  }

  // Floating Water Lilies (ใบบัวและดอกบัวริมน้ำ)
  buildWaterLilies() {
    const lilyGroup = new THREE.Group();
    const padMat = new THREE.MeshStandardMaterial({ color: 0x1e5631, roughness: 0.6 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xff758c, roughness: 0.4 });

    const padGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12);
    const flowerGeom = new THREE.ConeGeometry(0.18, 0.35, 6);

    // Scatter 12 lily clusters near river bank
    for (let i = 0; i < 14; i++) {
      const x = -13 + (Math.random() - 0.5) * 4;
      const z = -60 + i * 9 + (Math.random() - 0.5) * 3;

      const pad = new THREE.Mesh(padGeom, padMat);
      pad.position.set(x, -0.32, z);
      pad.scale.set(1 + Math.random() * 0.4, 1, 1 + Math.random() * 0.4);
      lilyGroup.add(pad);

      // Pink lotus flower on some pads
      if (Math.random() < 0.6) {
        const flower = new THREE.Mesh(flowerGeom, flowerMat);
        flower.position.set(x + 0.1, -0.15, z + 0.1);
        lilyGroup.add(flower);
      }
    }
    this.scene.add(lilyGroup);
  }

  getWaterHeight(x, z, time = this.time) {
    const wave1 = Math.sin(x * 0.3 + time * 1.5) * 0.11;
    const wave2 = Math.cos(z * 0.2 + time * 2.0) * 0.07;
    return -0.4 + wave1 + wave2;
  }

  update(delta) {
    this.time += delta;

    if (this.waterTexture) {
      this.waterTexture.offset.y += delta * 0.035;
      this.waterTexture.offset.x += Math.sin(this.time * 0.4) * 0.003;
    }

    // Dynamic wave vertex animation
    if (this.mesh) {
      const posAttr = this.mesh.geometry.attributes.position;
      const basePos = this.basePositions;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const uX = basePos.getX(i);
        const uZ = basePos.getZ(i);

        const h = Math.sin(uX * 0.35 + this.time * 2.0) * 0.12 +
                  Math.cos(uZ * 0.25 + this.time * 1.8) * 0.08;

        posAttr.setY(i, h);
      }
      posAttr.needsUpdate = true;
    }

    // Drift river mist
    if (this.mistParticles) {
      const posAttr = this.mistParticles.geometry.attributes.position;
      const count = posAttr.count;

      for (let i = 0; i < count; i++) {
        const d = this.mistData[i];
        let z = posAttr.getZ(i) + d.speedZ * delta;
        let x = posAttr.getX(i) + Math.sin(this.time * 0.5 + d.seed) * 0.08 * delta;

        if (z > 95) z = -95;

        posAttr.setZ(i, z);
        posAttr.setX(i, x);
      }
      posAttr.needsUpdate = true;
    }
  }
}
