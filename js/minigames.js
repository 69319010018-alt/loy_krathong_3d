/**
 * minigames.js - Temple Fair Mini-Games
 * 1. Balloon Dart Mini-game (เกมปาลูกโป่งงานวัด)
 * 2. Esiimsi Fortune Sticks (เซียมซีมงคลเจ้าแม่คงคา)
 */

export class MiniGameManager {
  constructor(soundEngine, onCelebrate) {
    this.soundEngine = soundEngine;
    this.onCelebrate = onCelebrate;

    // Balloon game state
    this.balloonScore = 0;
    this.dartsLeft = 5;
    this.balloonColors = ['#ff0055', '#00f5d4', '#ffb703', '#9d4edd', '#38ef7d', '#ff70a6'];

    // Authentic Thai Fortune poems for Esiimsi
    this.fortunes = [
      {
        num: 1,
        title: 'ดีเลิศประเสริฐยิ่ง (เอกอุ)',
        poem: 'ใบที่หนึ่งเปรียบเหมือนเดือนสิบสอง น้ำนองคลองผ่องแผ้วไร้หมองหม่น\nการที่หวังจะสำเร็จสัมฤทธิ์ผล ลาภหลั่งล้นเงินทองกองเนืองนอง\nคนรักใคร่เมตตาอุปถัมภ์ โรคภัยช้ำมลายสิ้นสมใจปอง'
      },
      {
        num: 2,
        title: 'ร่มเย็นเป็นสุข (มงคล)',
        poem: 'ใบที่สองเหมือนต้นไทรงามสง่า แผ่กิ่งก้านสาขาให้ร่มเงา\nเรื่องทุกข์ร้อนผ่านพ้นเริ่มบรรเทา สิ่งหนักเอาเบาสู้จะลุพลัน\nพบมิตรสหายที่ดีคอยเกื้อหนุน การเงินอุ่นหนาฝาคั่งดังหวังขวัญ'
      },
      {
        num: 3,
        title: 'สมปรารถนาในรักและงาน',
        poem: 'ใบที่สามความหวังดั่งแสงจันทร์ ส่องสว่างกลางฝันอันสดใส\nถามถึงคู่เสน่หาจะได้ใจ ถามการงานก้าวไกลไร้โรคา\nหมั่นทำบุญกุศลหนุนชะตา เทพเทวารักษาพาเจริญ'
      },
      {
        num: 4,
        title: 'ลาภลอยก้อนใหญ่มาเยือน',
        poem: 'ใบที่สี่ลอยกระทงลงสู่สาย พัดเคราะห์ร้ายออกไปไกลลับตา\nมีเกณฑ์รับทรัพย์สินศฤงคาร จากทิศาพายัพประจักษ์ครัน\nคนโสดพบเนื้อคู่ร่วมชีวัน สุขอนันต์ตลอดศกนี้แล'
      },
      {
        num: 5,
        title: 'ก้าวหน้าไร้อุปสรรค',
        poem: 'ใบที่ห้าล่องนาวาฝ่าคลื่นลม สู่ฝั่งสมความมุ่งมาดปรารถนา\nค้าขายดีมีกำไรไหลหลั่งมา สติปัญญาพาให้พ้นโพยภัย\nขอให้อดทนตั้งมั่นอย่าหวั่นไหว ผลลัพธ์ไซร้งดงามดั่งตั้งใจ'
      }
    ];

    this.initDOM();
  }

  initDOM() {
    // Balloon elements
    this.balloonModal = document.getElementById('balloon-modal');
    this.balloonBoard = document.getElementById('balloon-board');
    this.balloonScoreEl = document.getElementById('balloon-score');
    this.dartsLeftEl = document.getElementById('darts-left');
    this.balloonStatusEl = document.getElementById('balloon-status');
    this.btnRestartBalloon = document.getElementById('btn-restart-balloon');
    this.btnCloseBalloon = document.getElementById('close-balloon-btn');

    if (this.btnCloseBalloon) {
      this.btnCloseBalloon.addEventListener('click', () => this.closeBalloonGame());
    }
    if (this.btnRestartBalloon) {
      this.btnRestartBalloon.addEventListener('click', () => this.resetBalloonGame());
    }

    // Esiimsi elements
    this.esiimsiModal = document.getElementById('esiimsi-modal');
    this.btnCloseEsiimsi = document.getElementById('close-esiimsi-btn');
    this.btnShake = document.getElementById('btn-shake-esiimsi');
    this.btnReshake = document.getElementById('btn-reshake-esiimsi');
    this.shakerView = document.getElementById('esiimsi-shaker-view');
    this.resultView = document.getElementById('esiimsi-result-view');
    this.stickNumEl = document.getElementById('stick-num');
    this.stickTitleEl = document.getElementById('stick-title');
    this.stickPoemEl = document.getElementById('stick-poem');

    if (this.btnCloseEsiimsi) {
      this.btnCloseEsiimsi.addEventListener('click', () => this.closeEsiimsi());
    }
    if (this.btnShake) {
      this.btnShake.addEventListener('click', () => this.shakeEsiimsi());
    }
    if (this.btnReshake) {
      this.btnReshake.addEventListener('click', () => this.resetEsiimsi());
    }
  }

  // ==========================================
  // BALLOON DART GAME LOGIC
  // ==========================================
  openBalloonGame() {
    if (this.balloonModal) {
      this.balloonModal.style.display = 'flex';
      this.resetBalloonGame();
    }
  }

  closeBalloonGame() {
    if (this.balloonModal) {
      this.balloonModal.style.display = 'none';
    }
  }

  resetBalloonGame() {
    this.balloonScore = 0;
    this.dartsLeft = 5;
    this.balloonScoreEl.textContent = '0';
    this.dartsLeftEl.textContent = '5';
    this.balloonStatusEl.textContent = 'คลิกที่ลูกโป่งเพื่อปาลูกดอก!';
    this.balloonBoard.innerHTML = '';

    // Create 20 balloons
    for (let i = 0; i < 20; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon-target';
      const color = this.balloonColors[i % this.balloonColors.length];
      balloon.style.backgroundColor = color;
      balloon.dataset.index = i;

      balloon.addEventListener('click', () => this.popBalloon(balloon));
      this.balloonBoard.appendChild(balloon);
    }
  }

  popBalloon(el) {
    if (this.dartsLeft <= 0 || el.classList.contains('popped')) return;

    this.dartsLeft--;
    this.dartsLeftEl.textContent = this.dartsLeft;

    // Pop effect & sound
    el.classList.add('popped');
    this.soundEngine.playBalloonPop();

    this.balloonScore += 10;
    this.balloonScoreEl.textContent = this.balloonScore;

    if (this.dartsLeft <= 0) {
      this.balloonStatusEl.innerHTML = `🎉 จบเกม! คุณได้คะแนน <strong>${this.balloonScore}</strong> คะแนน! รับรางวัลตุ๊กตาหมีงานวัด 🧸`;
      if (this.onCelebrate) this.onCelebrate();
    }
  }

  // ==========================================
  // ESIIMSI FORTUNE LOGIC
  // ==========================================
  openEsiimsi() {
    if (this.esiimsiModal) {
      this.esiimsiModal.style.display = 'flex';
      this.resetEsiimsi();
    }
  }

  closeEsiimsi() {
    if (this.esiimsiModal) {
      this.esiimsiModal.style.display = 'none';
    }
  }

  resetEsiimsi() {
    this.shakerView.style.display = 'block';
    this.resultView.style.display = 'none';
    this.btnShake.disabled = false;
    this.btnShake.textContent = 'เขย่ากระบอกเซียมซี 🎍';
  }

  shakeEsiimsi() {
    this.btnShake.disabled = true;
    this.btnShake.textContent = 'กำลังเขย่ากระบอก... 🎋';
    this.soundEngine.playBambooShake();

    // After 1.2s reveal stick
    setTimeout(() => {
      this.soundEngine.playCoinClink();
      const fortune = this.fortunes[Math.floor(Math.random() * this.fortunes.length)];

      this.stickNumEl.textContent = fortune.num;
      this.stickTitleEl.textContent = fortune.title;
      this.stickPoemEl.innerText = fortune.poem;

      this.shakerView.style.display = 'none';
      this.resultView.style.display = 'block';

      if (this.onCelebrate) this.onCelebrate();
    }, 1200);
  }
}
