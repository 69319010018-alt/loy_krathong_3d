/**
 * krathong.js - 3D Krathong Generator & River Flotilla Manager
 * Beautiful procedural Krathongs with glowing flames, incense smoke,
 * golden Thai coins, and sparkling river trails.
 */

import * as THREE from 'three';

export class KrathongFactory {
  // Candle Flame with inner core and soft glowing radial sprite
  static createCandle(color = 0xffb703, withLight = false) {
    const group = new THREE.Group();

    // Wax candle cylinder
    const waxGeom = new THREE.CylinderGeometry(0.08, 0.09, 0.6, 8);
    const waxMat = new THREE.MeshStandardMaterial({ color: 0xfffbe6, roughness: 0.3 });
    const wax = new THREE.Mesh(waxGeom, waxMat);
    wax.position.y = 0.3;
    group.add(wax);

    // Candle wick
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.1, 4),
      new THREE.MeshBasicMaterial({ color: 0x222222 })
    );
    wick.position.y = 0.65;
    group.add(wick);

    // Teardrop Flame (Outer Warm Mantle)
    const flameGeom = new THREE.ConeGeometry(0.08, 0.28, 6);
    flameGeom.translate(0, 0.14, 0);
    const flame = new THREE.Mesh(
      flameGeom,
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.95 })
    );
    flame.position.y = 0.68;
    group.add(flame);

    // Inner White/Hot Core
    const coreGeom = new THREE.ConeGeometry(0.04, 0.16, 6);
    coreGeom.translate(0, 0.08, 0);
    const core = new THREE.Mesh(coreGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    core.position.y = 0.69;
    group.add(core);

    // Flame Glow Halo Sprite (Additive Blending)
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 64; haloCanvas.height = 64;
    const hCtx = haloCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    hGrad.addColorStop(0, 'rgba(255, 230, 140, 0.9)');
    hGrad.addColorStop(0.4, 'rgba(255, 150, 40, 0.4)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 64, 64);

    const flameGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(haloCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    flameGlow.scale.set(0.9, 0.9, 1);
    flameGlow.position.set(0, 0.8, 0);
    group.add(flameGlow);

    let flameLight = null;
    if (withLight) {
      flameLight = new THREE.PointLight(color, 1.4, 5.5);
      flameLight.position.y = 0.8;
      group.add(flameLight);
    }

    group.userData = { flame, core, flameGlow, flameLight, baseColor: color };
    return group;
  }

  // 3 Incense sticks with glowing red tips
  static createIncenseSticks() {
    const group = new THREE.Group();
    const stickGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.9, 4);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });

    for (let i = 0; i < 3; i++) {
      const stick = new THREE.Mesh(stickGeom, stickMat);
      stick.rotation.z = (i - 1) * 0.14;
      stick.rotation.x = 0.08;
      stick.position.set((i - 1) * 0.06, 0.45, -0.15);
      group.add(stick);

      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.02, 4, 4), emberMat);
      ember.position.set(0, 0.45, 0);
      stick.add(ember);
    }
    return group;
  }

  // Thai Lucky Coin
  static createCoin(value = 1) {
    const coinGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 12);
    const color = value === 10 ? 0xd4af37 : (value === 5 ? 0xc0c0c0 : 0xcd7f32);
    const coin = new THREE.Mesh(coinGeom, new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.2 }));
    coin.position.set(0.15, 0.15, 0.12);
    coin.rotation.x = Math.PI / 12;
    return coin;
  }

  // 1. Traditional Banana Leaf Krathong (กระทงใบตองวิจิตร)
  static createTraditionalKrathong(candleColor = 0xffb703, coinValue = 1, withLight = false) {
    const krathong = new THREE.Group();

    // Banana trunk disc base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.95, 0.25, 14),
      new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.6 })
    );
    base.position.y = 0.12;
    krathong.add(base);

    // Inner leaf circle
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.02, 14),
      new THREE.MeshStandardMaterial({ color: 0x3d7e2f })
    );
    inner.position.y = 0.26;
    krathong.add(inner);

    // Folded pointed banana leaves around rim
    const petalGeom = new THREE.ConeGeometry(0.16, 0.55, 4);
    petalGeom.rotateX(Math.PI / 2);
    const petalMat = new THREE.MeshStandardMaterial({ color: 0x38761d, roughness: 0.5 });
    const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3 });

    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeom, petalMat);
      petal.position.set(Math.cos(angle) * 0.92, 0.2, Math.sin(angle) * 0.92);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = -0.4;
      krathong.add(petal);
    }

    // Flowers (Marigolds & Purple Orchids)
    const flowerGeom = new THREE.DodecahedronGeometry(0.12, 0);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.4 });
    const orchidMat = new THREE.MeshStandardMaterial({ color: 0x9d4edd, roughness: 0.4 });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const flower = new THREE.Mesh(flowerGeom, i % 2 === 0 ? flowerMat : orchidMat);
      flower.position.set(Math.cos(angle) * 0.45, 0.3, Math.sin(angle) * 0.45);
      krathong.add(flower);
    }

    const candle = this.createCandle(candleColor, withLight);
    candle.position.set(0, 0.26, 0.05);
    krathong.add(candle);
    krathong.userData.flame = candle.userData.flame;
    krathong.userData.flameGlow = candle.userData.flameGlow;
    krathong.userData.flameLight = candle.userData.flameLight;

    krathong.add(this.createIncenseSticks());
    krathong.add(this.createCoin(coinValue));
    krathong.scale.set(1.1, 1.1, 1.1);
    return krathong;
  }

  // 2. Sacred Lotus Krathong (กระทงดอกบัวสวรรค์)
  static createLotusKrathong(candleColor = 0xff006e, coinValue = 5, withLight = false) {
    const krathong = new THREE.Group();

    const pod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.5, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x2d6a4f })
    );
    pod.position.y = 0.12;
    krathong.add(pod);

    const petalGeom = new THREE.ConeGeometry(0.22, 0.6, 4);
    petalGeom.rotateX(Math.PI / 2);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0xff758c, roughness: 0.3 });

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeom, outerMat);
      petal.position.set(Math.cos(angle) * 0.78, 0.2, Math.sin(angle) * 0.78);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = -0.45;
      krathong.add(petal);
    }

    const candle = this.createCandle(candleColor, withLight);
    candle.position.set(0, 0.28, 0.05);
    krathong.add(candle);
    krathong.userData.flame = candle.userData.flame;
    krathong.userData.flameGlow = candle.userData.flameGlow;
    krathong.userData.flameLight = candle.userData.flameLight;

    krathong.add(this.createIncenseSticks());
    krathong.add(this.createCoin(coinValue));
    krathong.scale.set(1.15, 1.15, 1.15);
    return krathong;
  }

  // 3. Bread Turtle Krathong (กระทงขนมปังเต่าน้อย)
  static createBreadKrathong(candleColor = 0xffb703, coinValue = 1, withLight = false) {
    const krathong = new THREE.Group();
    const breadMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.85 });

    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), breadMat);
    shell.position.y = 0.1;
    krathong.add(shell);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), breadMat);
    head.position.set(0, 0.2, 0.95);
    krathong.add(head);

    const candle = this.createCandle(candleColor, withLight);
    candle.position.set(0, 0.35, 0.05);
    krathong.add(candle);
    krathong.userData.flame = candle.userData.flame;
    krathong.userData.flameGlow = candle.userData.flameGlow;
    krathong.userData.flameLight = candle.userData.flameLight;

    krathong.add(this.createIncenseSticks());
    krathong.add(this.createCoin(coinValue));
    krathong.scale.set(1.05, 1.05, 1.05);
    return krathong;
  }

  // 4. Crystal Neon Krathong (กระทงแก้วเรืองแสง)
  static createCrystalKrathong(candleColor = 0x00f5d4, coinValue = 10, withLight = false) {
    const krathong = new THREE.Group();
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.6, 0.3, 10), crystalMat);
    base.position.y = 0.15;
    krathong.add(base);

    const petalGeom = new THREE.OctahedronGeometry(0.28);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeom, crystalMat);
      petal.position.set(Math.cos(angle) * 0.75, 0.3, Math.sin(angle) * 0.75);
      krathong.add(petal);
    }

    const candle = this.createCandle(candleColor, withLight);
    candle.position.set(0, 0.3, 0.05);
    krathong.add(candle);
    krathong.userData.flame = candle.userData.flame;
    krathong.userData.flameGlow = candle.userData.flameGlow;
    krathong.userData.flameLight = candle.userData.flameLight;

    krathong.add(this.createIncenseSticks());
    krathong.add(this.createCoin(coinValue));
    krathong.scale.set(1.1, 1.1, 1.1);
    return krathong;
  }

  // Floating Thai Wish Banner
  static createWishSprite(wishText) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(8, 20, 42, 0.88)';
    ctx.roundRect(10, 10, 492, 108, 22);
    ctx.fill();

    ctx.strokeStyle = '#ffd868';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = 'bold 36px "Kanit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffd868';
    ctx.shadowBlur = 12;

    const text = wishText.length > 22 ? wishText.substring(0, 20) + '...' : wishText;
    ctx.fillText('✨ ' + text + ' ✨', 256, 64);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false
    }));
    sprite.scale.set(3.5, 0.88, 1);
    sprite.position.y = 1.4;
    return sprite;
  }
}

export class FlotillaManager {
  constructor(scene, riverWater) {
    this.scene = scene;
    this.riverWater = riverWater;
    this.krathongs = [];
    this.populateBackgroundKrathongs();
  }

  populateBackgroundKrathongs() {
    const types = ['traditional', 'lotus', 'bread', 'crystal'];
    const colors = [0xffb703, 0xff006e, 0x00f5d4, 0xffffff, 0xff70a6];

    for (let i = 0; i < 18; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      let mesh;

      if (type === 'traditional') mesh = KrathongFactory.createTraditionalKrathong(color, 1, false);
      else if (type === 'lotus') mesh = KrathongFactory.createLotusKrathong(color, 5, false);
      else if (type === 'bread') mesh = KrathongFactory.createBreadKrathong(color, 1, false);
      else mesh = KrathongFactory.createCrystalKrathong(color, 10, false);

      const x = -38 + Math.random() * 24;
      const z = -90 + Math.random() * 180;
      const y = this.riverWater.getWaterHeight(x, z, 0);

      mesh.position.set(x, y, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(mesh);

      this.krathongs.push({
        mesh: mesh,
        flame: mesh.userData.flame,
        flameGlow: mesh.userData.flameGlow,
        speedZ: 0.8 + Math.random() * 1.2,
        driftX: (Math.random() - 0.5) * 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        seed: Math.random() * 100,
        isPlayer: false
      });
    }
  }

  addPlayerKrathong(krathongMesh, wishText, startX = -12, startZ = 0) {
    const wishSprite = KrathongFactory.createWishSprite(wishText);
    krathongMesh.add(wishSprite);

    const y = this.riverWater.getWaterHeight(startX, startZ, 0);
    krathongMesh.position.set(startX, y, startZ);
    this.scene.add(krathongMesh);

    this.krathongs.push({
      mesh: krathongMesh,
      flame: krathongMesh.userData.flame,
      flameGlow: krathongMesh.userData.flameGlow,
      flameLight: krathongMesh.userData.flameLight,
      speedZ: 1.1,
      driftX: -0.15,
      rotSpeed: 0.15,
      seed: Math.random() * 100,
      isPlayer: true
    });

    return krathongMesh;
  }

  update(delta, time) {
    for (let i = 0; i < this.krathongs.length; i++) {
      const k = this.krathongs[i];
      const pos = k.mesh.position;

      pos.z += k.speedZ * delta;
      pos.x += k.driftX * delta;

      if (pos.z > 95) {
        pos.z = -95;
        pos.x = -38 + Math.random() * 24;
      }

      pos.y = this.riverWater.getWaterHeight(pos.x, pos.z, time);
      k.mesh.rotation.y += k.rotSpeed * delta;
      k.mesh.rotation.x = Math.sin(time * 2.0 + k.seed) * 0.04;
      k.mesh.rotation.z = Math.cos(time * 1.8 + k.seed) * 0.04;

      // Realistic flame flicker
      if (k.flame) {
        const s = 0.88 + Math.sin(time * 12.0 + k.seed) * 0.15;
        k.flame.scale.set(s, s * (1 + Math.sin(time * 18 + k.seed) * 0.1), s);
      }
      if (k.flameGlow) {
        k.flameGlow.material.opacity = 0.75 + Math.sin(time * 10 + k.seed) * 0.2;
      }
    }
  }
}
