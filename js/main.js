/**
 * main.js - Master Game Controller for Loy Krathong 3D
 * Connects Three.js renderer, World, Water, Character, Krathong,
 * Audio, Fireworks, Mini-games, and HUD UI.
 */

import * as THREE from 'three';
import { SoundEngine } from './audio.js';
import { RiverWater } from './water.js';
import { FestivalWorld } from './world.js';
import { KrathongFactory, FlotillaManager } from './krathong.js';
import { PlayerCharacter, NPCManager } from './character.js';
import { FireworksManager } from './fireworks.js';
import { MiniGameManager } from './minigames.js';

class LoyKrathongApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Game state
    this.heldKrathongData = null; // { type, color, coin, wish }
    this.cameraMode = 'third_person'; // 'third_person' | 'first_person' | 'drone'
    this.cameraYaw = 0;
    this.cameraPitch = 0.25;
    this.cameraDistance = 7.5;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    // Input state
    this.keys = {};
    this.touchJoystick = { x: 0, y: 0, active: false };

    // Interactive prompt
    this.currentInteractable = null;

    this.initThree();
    this.initSubsystems();
    this.initUI();
    this.initInput();
    this.animate();
  }

  // 1. Setup Three.js Scene, Camera, and High-Fidelity WebGL Renderer
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060e20);
    this.scene.fog = new THREE.FogExp2(0x0a1630, 0.007);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Optimized pixel ratio: 1.0 - 1.25 for buttery smooth 60 FPS
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  // 2. Initialize Game Systems
  initSubsystems() {
    this.soundEngine = new SoundEngine();
    this.riverWater = new RiverWater(this.scene);
    this.world = new FestivalWorld(this.scene);
    this.flotilla = new FlotillaManager(this.scene, this.riverWater);
    this.player = new PlayerCharacter(this.scene, this.soundEngine);
    this.npcs = new NPCManager(this.scene);
    this.fireworks = new FireworksManager(this.scene, this.soundEngine);
    this.minigames = new MiniGameManager(this.soundEngine, () => {
      this.fireworks.launch(null, 45, 0xffd700);
    });
  }

  // 3. User Interface & DOM Connections
  initUI() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.hud = document.getElementById('hud');
    this.progressBar = document.getElementById('progress-bar');
    this.loadingText = document.getElementById('loading-text');
    this.startBtn = document.getElementById('start-btn');
    this.objectiveText = document.getElementById('objective-text');
    this.interactionPrompt = document.getElementById('interaction-prompt');
    this.interactionLabel = document.getElementById('interaction-label');
    this.toast = document.getElementById('toast');

    // Simulate smooth loading
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (this.progressBar) this.progressBar.style.width = progress + '%';
      if (progress >= 100) {
        clearInterval(interval);
        if (this.loadingText) this.loadingText.textContent = '✨ งานวัดและท่าน้ำพร้อมแล้ว ✨';
        if (this.startBtn) this.startBtn.style.display = 'inline-block';
      }
    }, 200);

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        this.soundEngine.init();
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
          this.loadingScreen.style.display = 'none';
          this.hud.style.display = 'flex';
          this.showToast('ยินดีต้อนรับสู่งานวันลอยกระทง 3D! 🌕');
        }, 800);
      });
    }

    // Top action buttons
    document.getElementById('btn-firework')?.addEventListener('click', () => {
      this.fireworks.launch();
      this.showToast('🎆 จุดพลุดอกไม้เพลิงฉลองวันเพ็ญเดือน ๑๒!');
    });

    // Photo Mode (Toggle UI visibility)
    let isUiHidden = false;
    document.getElementById('btn-photo')?.addEventListener('click', () => {
      isUiHidden = !isUiHidden;
      const elementsToHide = [
        document.getElementById('objective-box'),
        document.getElementById('krathong-slot'),
        document.querySelector('.pc-controls-hint')
      ];
      elementsToHide.forEach(el => {
        if (el) el.style.display = isUiHidden ? 'none' : '';
      });
      this.showToast(isUiHidden ? '📸 เข้าสู่โหมดถ่ายภาพ (กด 📸 อีกครั้งเพื่อเปิดเมนู)' : 'แสดงเมนูกลับคืนแล้ว');
    });

    // Graphics Quality & FPS Toggle
    let isPerformanceMode = true;
    const btnPerf = document.getElementById('btn-perf');
    const perfText = document.getElementById('perf-text');
    btnPerf?.addEventListener('click', () => {
      isPerformanceMode = !isPerformanceMode;
      if (isPerformanceMode) {
        this.renderer.setPixelRatio(1.0);
        this.renderer.shadowMap.enabled = false;
        if (perfText) perfText.textContent = 'โหมดลื่นไหล';
        btnPerf.classList.add('active');
        this.showToast('⚡ เปิดโหมดลื่นไหลสุดๆ 60 FPS เรียบร้อยแล้ว');
      } else {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
        this.renderer.shadowMap.enabled = true;
        if (perfText) perfText.textContent = 'โหมดภาพสวย';
        btnPerf.classList.remove('active');
        this.showToast('✨ เปิดโหมดภาพสวย คมชัดและเงาสมจริง');
      }
    });

    const btnCamera = document.getElementById('btn-camera');
    const cameraText = document.getElementById('camera-mode-text');
    btnCamera?.addEventListener('click', () => {
      if (this.cameraMode === 'third_person') {
        this.cameraMode = 'first_person';
        if (cameraText) cameraText.textContent = 'บุคคลที่ 1';
      } else if (this.cameraMode === 'first_person') {
        this.cameraMode = 'drone';
        if (cameraText) cameraText.textContent = 'มุมโดรน';
      } else {
        this.cameraMode = 'third_person';
        if (cameraText) cameraText.textContent = 'บุคคลที่ 3';
      }
      this.showToast(`เปลี่ยนมุมกล้องเป็น: ${cameraText ? cameraText.textContent : this.cameraMode}`);
    });

    const btnAudio = document.getElementById('btn-audio');
    btnAudio?.addEventListener('click', () => {
      const isMuted = this.soundEngine.toggleMute();
      btnAudio.classList.toggle('active', !isMuted);
      this.showToast(isMuted ? '🔇 ปิดเสียงแล้ว' : '🔊 เปิดเสียงดนตรีไทยแล้ว');
    });

    document.getElementById('btn-help')?.addEventListener('click', () => {
      const modal = document.getElementById('help-modal');
      if (modal) modal.style.display = 'flex';
    });

    document.getElementById('close-help-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('help-modal');
      if (modal) modal.style.display = 'none';
    });

    // Krathong Shop UI
    this.initShopModal();

    // Floating Ceremony Pier button in HUD
    document.getElementById('btn-go-pier')?.addEventListener('click', () => {
      this.player.position.set(-10, 0, 0);
      this.showToast('เดินมาถึงท่าน้ำวัดแล้ว! 🌊');
    });
  }

  initShopModal() {
    this.shopModal = document.getElementById('shop-modal');
    this.closeShopBtn = document.getElementById('close-shop-btn');
    this.confirmKrathongBtn = document.getElementById('btn-confirm-krathong');

    let selectedType = 'traditional';
    let selectedColor = 0xffb703;
    let selectedCoin = 1;

    // Card selection
    const cards = document.querySelectorAll('.krathong-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedType = card.dataset.type;
        this.soundEngine.playCoinClink();
      });
    });

    // Candle Color selection
    const dots = document.querySelectorAll('.color-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedColor = parseInt(dot.dataset.color.replace('#', '0x'));
      });
    });

    // Coin selection
    const radios = document.querySelectorAll('input[name="coin"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedCoin = parseInt(e.target.value);
        this.soundEngine.playCoinClink();
      });
    });

    // Quick wishes chips
    const chips = document.querySelectorAll('.wish-chip');
    const wishInput = document.getElementById('wish-input');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (wishInput) wishInput.value = chip.textContent;
      });
    });

    this.closeShopBtn?.addEventListener('click', () => {
      this.shopModal.style.display = 'none';
    });

    // Confirm purchase / selection
    this.confirmKrathongBtn?.addEventListener('click', () => {
      const wish = wishInput ? wishInput.value : 'ขอขมาพระแม่คงคา';
      this.heldKrathongData = {
        type: selectedType,
        color: selectedColor,
        coin: selectedCoin,
        wish: wish
      };

      // Create 3D Krathong mesh for player to carry
      let mesh;
      if (selectedType === 'traditional') mesh = KrathongFactory.createTraditionalKrathong(selectedColor, selectedCoin);
      else if (selectedType === 'lotus') mesh = KrathongFactory.createLotusKrathong(selectedColor, selectedCoin);
      else if (selectedType === 'bread') mesh = KrathongFactory.createBreadKrathong(selectedColor, selectedCoin);
      else mesh = KrathongFactory.createCrystalKrathong(selectedColor, selectedCoin);

      this.player.holdKrathong(mesh);
      this.soundEngine.playCoinClink();
      this.shopModal.style.display = 'none';

      // Update HUD
      const heldSlot = document.getElementById('held-krathong-info');
      const goPierBtn = document.getElementById('btn-go-pier');
      if (heldSlot) {
        heldSlot.classList.remove('empty');
        const icon = selectedType === 'lotus' ? '🪷' : (selectedType === 'bread' ? '🐢' : (selectedType === 'crystal' ? '✨' : '🍃'));
        heldSlot.innerHTML = `<span class="slot-icon">${icon}</span> <span class="slot-desc">${wish}</span>`;
      }
      if (goPierBtn) goPierBtn.style.display = 'inline-block';

      this.objectiveText.textContent = 'เดินไปที่ท่าน้ำริมคลองเพื่อทำพิธีลอยกระทง 🌊';
      this.showToast('ได้กระทงเรียบร้อยแล้ว! เดินไปที่ท่าน้ำเพื่อลอยกระทง 🪷');
    });
  }

  // 4. Input Controls (Keyboard, Mouse, Touch)
  initInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyE') this.handleInteraction();
      if (e.code === 'KeyC') document.getElementById('btn-camera')?.click();
      if (e.code === 'KeyM') document.getElementById('btn-audio')?.click();
      if (e.code === 'KeyF') document.getElementById('btn-firework')?.click();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse camera rotation
    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('#hud') || e.target.closest('.modal-overlay')) return;
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraYaw -= deltaX * 0.005;
      this.cameraPitch = Math.max(-0.2, Math.min(1.2, this.cameraPitch + deltaY * 0.005));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('wheel', (e) => {
      this.cameraDistance = Math.max(3.0, Math.min(18.0, this.cameraDistance + e.deltaY * 0.01));
    });

    // Touch Virtual Joystick for Mobile
    const joystickBase = document.getElementById('joystick-base');
    const joystickThumb = document.getElementById('joystick-thumb');

    if (joystickBase && joystickThumb) {
      let touchId = null;
      const baseRect = () => joystickBase.getBoundingClientRect();

      joystickBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        this.touchJoystick.active = true;
        this.updateJoystick(touch, baseRect(), joystickThumb);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.touchJoystick.active) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            this.updateJoystick(e.changedTouches[i], baseRect(), joystickThumb);
            break;
          }
        }
      });

      const endTouch = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === touchId) {
            this.touchJoystick.active = false;
            this.touchJoystick.x = 0;
            this.touchJoystick.y = 0;
            joystickThumb.style.transform = 'translate(0px, 0px)';
            break;
          }
        }
      };
      window.addEventListener('touchend', endTouch);
      window.addEventListener('touchcancel', endTouch);
    }

    // Mobile Action buttons
    document.getElementById('touch-action-btn')?.addEventListener('click', () => this.handleInteraction());
    document.getElementById('touch-run-btn')?.addEventListener('touchstart', () => { this.keys['ShiftLeft'] = true; });
    document.getElementById('touch-run-btn')?.addEventListener('touchend', () => { this.keys['ShiftLeft'] = false; });
    document.getElementById('touch-jump-btn')?.addEventListener('click', () => {
      this.player.velocity.y = 6.8;
      this.player.isGrounded = false;
    });

    // Click on interaction prompt directly
    this.interactionPrompt?.addEventListener('click', () => this.handleInteraction());
  }

  updateJoystick(touch, rect, thumb) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = rect.width / 2 - 10;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    thumb.style.transform = `translate(${dx}px, ${dy}px)`;
    this.touchJoystick.x = dx / maxRadius;
    this.touchJoystick.y = -dy / maxRadius; // Invert Y for forward
  }

  // Handle interaction trigger
  handleInteraction() {
    if (!this.currentInteractable) return;

    const type = this.currentInteractable.type;

    if (type === 'shop') {
      this.shopModal.style.display = 'flex';
      this.soundEngine.resume();
    } else if (type === 'balloon') {
      this.minigames.openBalloonGame();
      this.soundEngine.resume();
    } else if (type === 'esiimsi') {
      this.minigames.openEsiimsi();
      this.soundEngine.resume();
    } else if (type === 'pier') {
      this.performKrathongCeremony();
    }
  }

  // 5. Krathong Floating Ceremony (พิธีลอยประทีปบูชาพระแม่คงคา)
  performKrathongCeremony() {
    if (!this.heldKrathongData) {
      this.showToast('ท่านยังไม่มีกระทง! กรุณาไปเลือกกระทงที่ร้านลุงสมคิดก่อนนะจ๊ะ 🪷');
      this.objectiveText.textContent = 'เดินไปที่ร้านกระทงลุงสมคิดเพื่อเลือกกระทง';
      return;
    }

    this.soundEngine.resume();
    this.soundEngine.playTempleGong();

    // 1. Character kneels & prays
    this.player.startPraying();

    // 2. Cinematic overlay & wish display
    const ceremonyOverlay = document.getElementById('ceremony-overlay');
    const wishDisplay = document.getElementById('ceremony-wish-display');
    if (wishDisplay) wishDisplay.textContent = `"${this.heldKrathongData.wish}"`;
    if (ceremonyOverlay) ceremonyOverlay.style.display = 'flex';

    // 3. Cinematic Camera pan
    const prevMode = this.cameraMode;
    this.cameraMode = 'cinematic';

    // 4. After 4.5 seconds, release krathong onto the water
    setTimeout(() => {
      const releasedMesh = this.player.releaseHeldKrathong();
      if (releasedMesh) {
        // Place into river
        this.flotilla.addPlayerKrathong(
          releasedMesh,
          this.heldKrathongData.wish,
          -14, // Water edge
          this.player.position.z
        );
      }

      this.soundEngine.playWaterSplash();
      this.fireworks.launch(-10, 40, 0xffb703);
      this.fireworks.launch(15, 48, 0xff006e);
      this.fireworks.launch(-25, 42, 0x00f5d4);

      // Reset held slot
      this.heldKrathongData = null;
      const heldSlot = document.getElementById('held-krathong-info');
      const goPierBtn = document.getElementById('btn-go-pier');
      if (heldSlot) {
        heldSlot.classList.add('empty');
        heldSlot.innerHTML = `<span class="slot-icon">🧺</span> <span class="slot-desc">ลอยกระทงสำเร็จแล้ว ขอให้สมปรารถนา!</span>`;
      }
      if (goPierBtn) goPierBtn.style.display = 'none';

      this.objectiveText.textContent = 'ลอยกระทงสำเร็จแล้ว! เดินเที่ยวงานวัดหรือลอยกระทงใหม่อีกใบ';
      this.showToast('ขอขมาพระแม่คงคาเรียบร้อยแล้ว ขอให้คำอธิษฐานสัมฤทธิ์ผลดั่งใจปอง! ✨');
    }, 4500);

    // 5. End ceremony overlay after 7 seconds
    setTimeout(() => {
      if (ceremonyOverlay) ceremonyOverlay.style.display = 'none';
      this.cameraMode = prevMode;
    }, 7000);
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3800);
  }

  // Check nearby interactive zones (Shop, Pier, Balloon, Esiimsi)
  checkInteractions() {
    let closest = null;
    let minDist = Infinity;

    for (const item of this.world.interactables) {
      const dist = this.player.position.distanceTo(item.position);
      if (dist < item.radius && dist < minDist) {
        minDist = dist;
        closest = item;
      }
    }

    if (closest) {
      this.currentInteractable = closest;
      this.interactionLabel.textContent = closest.label;
      this.interactionPrompt.style.display = 'flex';
    } else {
      this.currentInteractable = null;
      this.interactionPrompt.style.display = 'none';
    }
  }

  // Update Camera based on active mode
  updateCamera(delta) {
    const playerPos = this.player.position;

    if (this.cameraMode === 'first_person') {
      // First person: At player head
      this.camera.position.set(playerPos.x, playerPos.y + 1.6, playerPos.z);
      const target = new THREE.Vector3(
        playerPos.x + Math.sin(this.cameraYaw),
        playerPos.y + 1.6 - Math.sin(this.cameraPitch),
        playerPos.z + Math.cos(this.cameraYaw)
      );
      this.camera.lookAt(target);
    } else if (this.cameraMode === 'drone') {
      // Drone high vantage view
      const targetPos = new THREE.Vector3(15, 32, 25);
      this.camera.position.lerp(targetPos, delta * 2.0);
      this.camera.lookAt(playerPos.x, playerPos.y + 1.0, playerPos.z);
    } else if (this.cameraMode === 'cinematic') {
      // Cinematic ceremony low angle overlooking water, character and moon
      const cinePos = new THREE.Vector3(playerPos.x + 3.5, playerPos.y + 0.8, playerPos.z - 2.8);
      this.camera.position.lerp(cinePos, delta * 3.0);
      this.camera.lookAt(playerPos.x - 2, playerPos.y + 0.4, playerPos.z + 2);
    } else {
      // Standard Third Person Orbit Camera
      const cosPitch = Math.cos(this.cameraPitch);
      const sinPitch = Math.sin(this.cameraPitch);

      const offsetX = Math.sin(this.cameraYaw) * this.cameraDistance * cosPitch;
      const offsetZ = Math.cos(this.cameraYaw) * this.cameraDistance * cosPitch;
      const offsetY = this.cameraDistance * sinPitch;

      const desiredPos = new THREE.Vector3(
        playerPos.x - offsetX,
        playerPos.y + 1.4 + offsetY,
        playerPos.z - offsetZ
      );

      this.camera.position.lerp(desiredPos, delta * 8.0);
      this.camera.lookAt(playerPos.x, playerPos.y + 1.3, playerPos.z);
    }
  }

  // 6. Master Render & Game Loop
  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Prepare Movement Input
    let moveX = 0;
    let moveZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Merge Touch Joystick if active
    if (this.touchJoystick.active) {
      moveX = this.touchJoystick.x;
      moveZ = -this.touchJoystick.y;
    }

    const input = {
      moveX: moveX,
      moveZ: moveZ,
      sprint: !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'],
      jump: !!this.keys['Space'],
      cameraYaw: this.cameraYaw
    };

    // Update Systems
    this.player.update(delta, input);
    this.npcs.update(delta);
    this.riverWater.update(delta);
    this.world.update(delta, time);
    this.flotilla.update(delta, time);
    this.fireworks.update(delta);

    this.checkInteractions();
    this.updateCamera(delta);

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new LoyKrathongApp();
});
