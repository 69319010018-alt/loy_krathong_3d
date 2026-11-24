/**
 * fireworks.js - Spectacular Particle Fireworks System
 * Launches celebratory rockets and explodes into glowing particle bursts
 * with dynamic point-light flashes that illuminate temple roofs and the river.
 */

import * as THREE from 'three';

export class FireworksManager {
  constructor(scene, soundEngine) {
    this.scene = scene;
    this.soundEngine = soundEngine;
    this.fireworks = [];
    this.lightPool = [];
    this.initLightPool();
    this.autoTimer = 0;
  }

  initLightPool() {
    // Reusable point lights for explosion flashes
    for (let i = 0; i < 4; i++) {
      const light = new THREE.PointLight(0xffffff, 0, 80);
      this.scene.add(light);
      this.lightPool.push({ light, life: 0 });
    }
  }

  // Launch a new firework rocket
  launch(startX = null, targetY = 35 + Math.random() * 20, colorHex = null) {
    const x = startX !== null ? startX : -20 + Math.random() * 50;
    const z = -40 + Math.random() * 80;
    const y = 0;

    const colors = [
      0xffb703, // Thai Gold
      0xff0055, // Crimson Red
      0x00f5d4, // Cyan Emerald
      0xff70a6, // Lotus Pink
      0x7b2cbf, // Royal Violet
      0xffffff  // Diamond White
    ];
    const color = colorHex !== null ? colorHex : colors[Math.floor(Math.random() * colors.length)];

    // Play launch & boom sound
    if (this.soundEngine) {
      this.soundEngine.playFirework();
    }

    // Rocket projectile
    const rocketGeom = new THREE.SphereGeometry(0.3, 8, 8);
    const rocketMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    const rocketMesh = new THREE.Mesh(rocketGeom, rocketMat);
    rocketMesh.position.set(x, y, z);
    this.scene.add(rocketMesh);

    this.fireworks.push({
      type: 'rocket',
      mesh: rocketMesh,
      pos: new THREE.Vector3(x, y, z),
      vel: new THREE.Vector3((Math.random() - 0.5) * 4, 32 + Math.random() * 8, (Math.random() - 0.5) * 4),
      targetY: targetY,
      color: color,
      life: 0
    });
  }

  explode(pos, color) {
    const particleCount = 120;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Spherical explosion distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 10 + Math.random() * 16;

      velocities.push(new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      ));
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create glowing circle canvas texture for sparks
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#ffffff');
    grad.addColorStop(0.8, '#ffffff');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const sparkTexture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      color: color,
      size: 1.2,
      map: sparkTexture,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geom, mat);
    this.scene.add(points);

    // Flash light
    this.flashLight(pos, color);

    this.fireworks.push({
      type: 'sparks',
      points: points,
      geom: geom,
      mat: mat,
      velocities: velocities,
      life: 1.0, // Countdown from 1.0 to 0
      decayRate: 0.55 + Math.random() * 0.2
    });
  }

  flashLight(pos, color) {
    for (const item of this.lightPool) {
      if (item.life <= 0) {
        item.light.color.setHex(color);
        item.light.position.copy(pos);
        item.light.intensity = 4.5;
        item.life = 0.5;
        break;
      }
    }
  }

  update(delta) {
    // 1. Update point light flashes
    for (const item of this.lightPool) {
      if (item.life > 0) {
        item.life -= delta;
        item.light.intensity = (item.life / 0.5) * 4.5;
      } else {
        item.light.intensity = 0;
      }
    }

    // 2. Auto festive fireworks every 8-15 seconds
    this.autoTimer += delta;
    if (this.autoTimer > 9.0) {
      this.autoTimer = Math.random() * 3;
      this.launch();
    }

    // 3. Update active fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];

      if (fw.type === 'rocket') {
        fw.pos.addScaledVector(fw.vel, delta);
        fw.mesh.position.copy(fw.pos);

        if (fw.pos.y >= fw.targetY || fw.vel.y <= 0) {
          // Rocket detonates!
          this.scene.remove(fw.mesh);
          fw.mesh.geometry.dispose();
          fw.mesh.material.dispose();
          this.explode(fw.pos, fw.color);
          this.fireworks.splice(i, 1);
        }
      } else if (fw.type === 'sparks') {
        fw.life -= delta * fw.decayRate;
        fw.mat.opacity = Math.max(0, fw.life);

        const posAttr = fw.geom.attributes.position;
        const count = posAttr.count;

        for (let j = 0; j < count; j++) {
          const vel = fw.velocities[j];
          vel.y -= 9.8 * delta * 0.5; // Mild gravity
          vel.multiplyScalar(0.96);    // Air drag

          let x = posAttr.getX(j) + vel.x * delta;
          let y = posAttr.getY(j) + vel.y * delta;
          let z = posAttr.getZ(j) + vel.z * delta;

          posAttr.setXYZ(j, x, y, z);
        }
        posAttr.needsUpdate = true;

        if (fw.life <= 0) {
          this.scene.remove(fw.points);
          fw.geom.dispose();
          fw.mat.dispose();
          this.fireworks.splice(i, 1);
        }
      }
    }
  }
}
