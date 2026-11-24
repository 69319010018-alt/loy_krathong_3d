/**
 * character.js - 3D Character Controller & Thai NPC Villagers
 * Features:
 * - Playable 3D character in intricate traditional Thai costume
 *   (Golden headdress, silk sash, jeweled belt buckle, gold bracelets)
 * - Skeletal animation: Idle, Walk, Sprint, Jump, Pray & Float Krathong
 * - Golden prayer aura during ceremony
 * - Strolling festival NPCs
 */

import * as THREE from 'three';

export class PlayerCharacter {
  constructor(scene, soundEngine) {
    this.scene = scene;
    this.soundEngine = soundEngine;

    this.position = new THREE.Vector3(2, 0, 10);
    this.velocity = new THREE.Vector3();
    this.rotationY = Math.PI;
    this.isGrounded = true;
    this.isPraying = false;
    this.prayerTime = 0;
    this.heldKrathongMesh = null;
    this.prayerAura = null;

    this.animTime = 0;
    this.isMoving = false;
    this.isSprinting = false;

    this.buildCharacterModel();
  }

  buildCharacterModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5c59b, roughness: 0.55 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.8 });
    const silkMat = new THREE.MeshStandardMaterial({ color: 0xff1493, roughness: 0.35, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x581845, roughness: 0.5 });
    const gemMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

    // 1. Pelvis / Hips
    this.hips = new THREE.Group();
    this.hips.position.y = 1.0;
    this.mesh.add(this.hips);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.32), pantMat);
    this.hips.add(pelvis);

    // Golden waist belt & Jeweled buckle (เข็มขัดทองหัวพลอยทับทิม)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.36), goldMat);
    const rubyBuckle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06), gemMat);
    rubyBuckle.position.set(0, 0, 0.19);
    this.hips.add(belt, rubyBuckle);

    // 2. Spine & Torso
    this.spine = new THREE.Group();
    this.spine.position.y = 0.25;
    this.hips.add(this.spine);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.55, 0.28), silkMat);
    torso.position.y = 0.25;
    this.spine.add(torso);

    // Golden Thai Silk Sash (สไบเฉียงพาดบ่าสีทองอร่าม)
    const sabaiGeom = new THREE.BoxGeometry(0.5, 0.58, 0.32);
    sabaiGeom.rotateZ(-0.25);
    const sabai = new THREE.Mesh(sabaiGeom, goldMat);
    sabai.position.y = 0.26;
    this.spine.add(sabai);

    // 3. Head & Golden Headdress (เกี้ยวยอดทองคำ)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.6;
    this.spine.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), skinMat);
    head.position.y = 0.2;
    this.headGroup.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), hairMat);
    hair.position.set(0, 0.25, -0.05);
    this.headGroup.add(hair);

    // Golden Headdress / Crown (เกี้ยวยอดรัดเกล้าทอง)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), goldMat);
    crown.position.set(0, 0.52, -0.05);
    this.headGroup.add(crown);

    const flowerPin = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    flowerPin.position.set(0.14, 0.38, -0.05);
    this.headGroup.add(flowerPin);

    // 4. Arms with Golden Bracelets
    this.leftArm = this.createArm(skinMat, silkMat, goldMat, 1);
    this.leftArm.position.set(0.3, 0.48, 0);
    this.spine.add(this.leftArm);

    this.rightArm = this.createArm(skinMat, silkMat, goldMat, -1);
    this.rightArm.position.set(-0.3, 0.48, 0);
    this.spine.add(this.rightArm);

    // Krathong Socket
    this.krathongSocket = new THREE.Group();
    this.krathongSocket.position.set(0, 0.35, 0.45);
    this.spine.add(this.krathongSocket);

    // 5. Legs
    this.leftLeg = this.createLeg(pantMat, skinMat);
    this.leftLeg.position.set(0.16, -0.1, 0);
    this.hips.add(this.leftLeg);

    this.rightLeg = this.createLeg(pantMat, skinMat);
    this.rightLeg.position.set(-0.16, -0.1, 0);
    this.hips.add(this.rightLeg);

    // 6. Golden Prayer Blessing Aura (ออร่าพนมมือ)
    this.buildPrayerAura();

    this.scene.add(this.mesh);
  }

  buildPrayerAura() {
    const auraGeom = new THREE.SphereGeometry(1.6, 16, 12);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.prayerAura = new THREE.Mesh(auraGeom, auraMat);
    this.prayerAura.position.y = 1.0;
    this.mesh.add(this.prayerAura);
  }

  createArm(skinMat, sleeveMat, goldMat, side) {
    const armGroup = new THREE.Group();

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 6), sleeveMat);
    upper.position.y = -0.16;
    armGroup.add(upper);

    const forearmGroup = new THREE.Group();
    forearmGroup.position.y = -0.32;
    armGroup.add(forearmGroup);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.3, 6), skinMat);
    forearm.position.y = -0.15;
    forearmGroup.add(forearm);

    // Golden Bracelet (กำไลข้อมือทอง)
    const bracelet = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 4, 8), goldMat);
    bracelet.position.y = -0.26;
    bracelet.rotation.x = Math.PI / 2;
    forearmGroup.add(bracelet);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), skinMat);
    hand.position.y = -0.32;
    forearmGroup.add(hand);

    return armGroup;
  }

  createLeg(pantMat, skinMat) {
    const legGroup = new THREE.Group();

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.42, 6), pantMat);
    thigh.position.y = -0.21;
    legGroup.add(thigh);

    const shinGroup = new THREE.Group();
    shinGroup.position.y = -0.42;
    legGroup.add(shinGroup);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 6), skinMat);
    shin.position.y = -0.21;
    shinGroup.add(shin);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.06, 0.22), skinMat);
    foot.position.set(0, -0.42, 0.06);
    shinGroup.add(foot);

    return legGroup;
  }

  holdKrathong(krathongMesh) {
    if (this.heldKrathongMesh) {
      this.krathongSocket.remove(this.heldKrathongMesh);
    }
    this.heldKrathongMesh = krathongMesh;
    krathongMesh.scale.set(0.65, 0.65, 0.65);
    krathongMesh.position.set(0, 0, 0);
    this.krathongSocket.add(krathongMesh);
  }

  releaseHeldKrathong() {
    if (this.heldKrathongMesh) {
      this.krathongSocket.remove(this.heldKrathongMesh);
      const k = this.heldKrathongMesh;
      this.heldKrathongMesh = null;
      return k;
    }
    return null;
  }

  startPraying() {
    this.isPraying = true;
    this.prayerTime = 0;
  }

  update(delta, input) {
    if (this.isPraying) {
      this.prayerTime += delta;

      // Pulse Golden Prayer Aura
      if (this.prayerAura) {
        if (this.prayerTime < 4.5) {
          this.prayerAura.material.opacity = Math.min(0.35, this.prayerTime * 0.12);
          const s = 1.0 + Math.sin(this.prayerTime * 3) * 0.08;
          this.prayerAura.scale.set(s, s, s);
        } else {
          this.prayerAura.material.opacity = Math.max(0, 0.35 - (this.prayerTime - 4.5) * 0.25);
        }
      }

      // Kneel down smoothly
      if (this.prayerTime < 1.5) {
        const t = this.prayerTime / 1.5;
        this.mesh.position.y = -t * 0.45;
        this.leftLeg.rotation.x = -1.2 * t;
        this.rightLeg.rotation.x = -1.2 * t;

        this.leftArm.rotation.set(0.8 * t, 0, 0.6 * t);
        this.rightArm.rotation.set(0.8 * t, 0, -0.6 * t);
      } else if (this.prayerTime < 4.0) {
        const gentleSway = Math.sin(this.prayerTime * 3) * 0.03;
        this.headGroup.rotation.x = 0.2 + gentleSway;
      } else if (this.prayerTime < 5.5) {
        const t = (this.prayerTime - 4.0) / 1.5;
        this.leftArm.rotation.x = 0.8 + t * 0.4;
        this.rightArm.rotation.x = 0.8 + t * 0.4;
        this.spine.rotation.x = t * 0.3;
      } else {
        const t = Math.min(1.0, (this.prayerTime - 5.5) / 1.0);
        this.mesh.position.y = -0.45 * (1 - t);
        this.leftLeg.rotation.x = -1.2 * (1 - t);
        this.rightLeg.rotation.x = -1.2 * (1 - t);
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
        this.spine.rotation.x = 0;
        this.headGroup.rotation.x = 0;

        if (this.prayerTime > 6.5) {
          this.isPraying = false;
        }
      }
      return;
    }

    // Normal Movement
    const moveX = input.moveX || 0;
    const moveZ = input.moveZ || 0;
    const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;
    this.isMoving = isMoving;
    this.isSprinting = input.sprint;

    const baseSpeed = this.isSprinting ? 9.5 : 5.2;

    if (isMoving) {
      const moveAngle = Math.atan2(moveX, moveZ) + input.cameraYaw;
      this.rotationY = moveAngle;
      this.mesh.rotation.y = this.rotationY;

      const vx = Math.sin(moveAngle) * baseSpeed;
      const vz = Math.cos(moveAngle) * baseSpeed;

      const nextX = this.position.x + vx * delta;
      const nextZ = this.position.z + vz * delta;

      const isOnPier = (nextX >= -14 && nextX <= 0 && nextZ >= -7 && nextZ <= 7);
      const isOnLand = (nextX >= -4 && nextX <= 60 && nextZ >= -85 && nextZ <= 85);

      if (isOnPier || isOnLand) {
        this.position.x = nextX;
        this.position.z = nextZ;
      }

      this.animTime += delta * (this.isSprinting ? 14 : 9);
    } else {
      this.animTime += delta * 2.0;
    }

    if (input.jump && this.isGrounded) {
      this.velocity.y = 6.8;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= 18.0 * delta;
      this.position.y += this.velocity.y * delta;

      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    this.mesh.position.copy(this.position);
    this.animateBones(isMoving);
  }

  animateBones(isMoving) {
    if (isMoving) {
      const legStride = Math.sin(this.animTime) * (this.isSprinting ? 0.95 : 0.65);
      this.leftLeg.rotation.x = legStride;
      this.rightLeg.rotation.x = -legStride;

      if (this.heldKrathongMesh) {
        this.leftArm.rotation.set(0.65, 0, 0.25);
        this.rightArm.rotation.set(0.65, 0, -0.25);
      } else {
        const armSwing = Math.sin(this.animTime) * (this.isSprinting ? 0.8 : 0.5);
        this.leftArm.rotation.x = -armSwing;
        this.rightArm.rotation.x = armSwing;
      }

      this.hips.position.y = 1.0 + Math.abs(Math.sin(this.animTime * 2)) * 0.08;
      this.spine.rotation.z = Math.sin(this.animTime) * 0.04;
    } else {
      const breath = Math.sin(this.animTime) * 0.02;
      this.hips.position.y = 1.0 + breath;
      this.spine.rotation.x = breath * 0.5;
      this.headGroup.rotation.x = -breath * 0.5;

      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;

      if (this.heldKrathongMesh) {
        this.leftArm.rotation.set(0.65, 0, 0.25);
        this.rightArm.rotation.set(0.65, 0, -0.25);
      } else {
        this.leftArm.rotation.set(0.05, 0, 0.05);
        this.rightArm.rotation.set(0.05, 0, -0.05);
      }
    }
  }
}

export class NPCManager {
  constructor(scene) {
    this.scene = scene;
    this.npcs = [];
    this.initNPCs();
  }

  initNPCs() {
    const npcColors = [
      { silk: 0x00f5d4, pant: 0x1d3557 },
      { silk: 0xffb703, pant: 0x8b0000 },
      { silk: 0xff70a6, pant: 0x4a0e4e },
      { silk: 0x38ef7d, pant: 0x2d6a4f },
      { silk: 0xff8008, pant: 0x1a1a2e }
    ];

    const waypoints = [
      [2, 0, 8], [12, 0, 15], [20, 0, 2], [10, 0, -10],
      [4, 0, -5], [-8, 0, 2]
    ];

    for (let i = 0; i < 6; i++) {
      const color = npcColors[i % npcColors.length];
      const npcGroup = new THREE.Group();

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfa07e, roughness: 0.6 });
      const silkMat = new THREE.MeshStandardMaterial({ color: color.silk, roughness: 0.4 });
      const pantMat = new THREE.MeshStandardMaterial({ color: color.pant, roughness: 0.6 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.26), silkMat);
      torso.position.y = 1.15;
      npcGroup.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), skinMat);
      head.position.y = 1.6;
      npcGroup.add(head);

      const legGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.75, 6);
      const l1 = new THREE.Mesh(legGeom, pantMat);
      l1.position.set(0.12, 0.4, 0);
      const l2 = l1.clone();
      l2.position.x = -0.12;
      npcGroup.add(l1, l2);

      const startPos = waypoints[i % waypoints.length];
      npcGroup.position.set(startPos[0] + (Math.random() - 0.5) * 3, 0, startPos[1] + (Math.random() - 0.5) * 3);
      this.scene.add(npcGroup);

      this.npcs.push({
        mesh: npcGroup,
        l1, l2,
        targetPos: new THREE.Vector3(startPos[0], 0, startPos[1]),
        speed: 1.2 + Math.random() * 0.8,
        animTime: Math.random() * 10
      });
    }
  }

  update(delta) {
    for (const npc of this.npcs) {
      npc.animTime += delta * 6;

      const swing = Math.sin(npc.animTime) * 0.45;
      npc.l1.rotation.x = swing;
      npc.l2.rotation.x = -swing;

      const dist = npc.mesh.position.distanceTo(npc.targetPos);
      if (dist < 1.0) {
        npc.targetPos.set(
          -2 + Math.random() * 24,
          0,
          -15 + Math.random() * 35
        );
      } else {
        const dir = new THREE.Vector3().subVectors(npc.targetPos, npc.mesh.position).normalize();
        npc.mesh.position.addScaledVector(dir, npc.speed * delta);
        npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }
  }
}
