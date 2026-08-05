/**
 * TimelineControls Component
 * Handles time slider scrubbing, play/pause animation timer, speed controls,
 * and notifies listeners when the year changes.
 */

export class TimelineControls {
  constructor(onYearChange) {
    this.onYearChange = onYearChange;
    this.currentYear = 1989;
    this.minYear = 1989;
    this.maxYear = 2025;
    
    this.isPlaying = false;
    this.speed = 1; // 1x = 1000ms per year
    this.timer = null;

    this.initDOM();
  }

  initDOM() {
    this.slider = document.getElementById('year-slider');
    this.display = document.getElementById('current-year-display');
    this.playBtn = document.getElementById('btn-play-pause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.labelPlayPause = document.getElementById('label-play-pause');

    // Slider scrubbing event
    this.slider?.addEventListener('input', (e) => {
      const year = parseInt(e.target.value, 10);
      this.setYear(year, false);
    });

    // Play/Pause toggle
    this.playBtn?.addEventListener('click', () => {
      this.togglePlay();
    });

    // Speed selector buttons
    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.speed = parseFloat(btn.dataset.speed) || 1;
        if (this.isPlaying) {
          this.restartTimer();
        }
      });
    });
  }

  setYear(year, updateSlider = true) {
    this.currentYear = year;
    
    if (this.display) {
      this.display.textContent = year;
    }

    if (updateSlider && this.slider) {
      this.slider.value = year;
    }

    if (this.onYearChange) {
      this.onYearChange(this.currentYear);
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentYear >= this.maxYear) {
      this.currentYear = this.minYear;
    }
    this.isPlaying = true;
    this.updatePlayBtnUI();
    this.startTimer();
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayBtnUI();
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();
    const interval = 1200 / this.speed;
    this.timer = setInterval(() => {
      if (this.currentYear < this.maxYear) {
        this.setYear(this.currentYear + 1, true);
      } else {
        this.pause();
      }
    }, interval);
  }

  restartTimer() {
    if (this.isPlaying) {
      this.startTimer();
    }
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updatePlayBtnUI() {
    if (this.isPlaying) {
      this.iconPlay?.classList.add('hidden');
      this.iconPause?.classList.remove('hidden');
      if (this.labelPlayPause) this.labelPlayPause.textContent = 'Pause';
    } else {
      this.iconPlay?.classList.remove('hidden');
      this.iconPause?.classList.add('hidden');
      if (this.labelPlayPause) this.labelPlayPause.textContent = 'Play';
    }
  }
}
