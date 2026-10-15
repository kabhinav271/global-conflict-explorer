/**
 * CinematicIntro Component — Ultra-Smooth Pudding-Style Scrollytelling
 * Features a continuous 60fps lerp render loop (linear interpolation) for liquid-smooth
 * video scrubbing and fact upward motion across the 500vh container.
 */

export class CinematicIntro {
  constructor(trackId) {
    this.track = document.getElementById(trackId);
    if (!this.track) return;

    this.sticky = document.getElementById('cinematic-intro-sticky');
    this.video = document.getElementById('cinematic-intro-video');
    this.factContainer = document.getElementById('cinematic-intro-facts');

    this.introFacts = [
      {
        id: 'fact-1',
        text: "Between 1989 and 2025, some countries in this dataset experienced conflict for only a year, while others experienced it for decades.",
        start: 0.10,
        end: 0.25
      },
      {
        id: 'fact-2',
        text: "Conflict is rarely a single event. A country can experience multiple conflicts across the same period.",
        start: 0.30,
        end: 0.45
      },
      {
        id: 'fact-3',
        text: "In this dataset, some countries recorded thousands of battle deaths, while others recorded hundreds of thousands.",
        start: 0.50,
        end: 0.65
      },
      {
        id: 'fact-4',
        text: "But time spent in conflict alone cannot tell us how many people will die.",
        start: 0.70,
        end: 0.85
      }
    ];

    this.factElements = [];
    this.videoDuration = 2.32;

    // Smooth Lerp State
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.isLoopRunning = false;

    this.init();
  }

  init() {
    if (!this.video) return;

    // Muted and playsinline for smooth scrubbing
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.pause();

    this.video.addEventListener('loadedmetadata', () => {
      if (this.video.duration && !isNaN(this.video.duration)) {
        this.videoDuration = this.video.duration;
      }
    });

    this.renderFactElements();
    this.bindScroll();
  }

  renderFactElements() {
    if (!this.factContainer) return;

    this.factContainer.innerHTML = this.introFacts.map(fact => `
      <div class="cinematic-intro-fact" id="${fact.id}" data-start="${fact.start}" data-end="${fact.end}">
        <p class="cinematic-fact-text">${fact.text}</p>
      </div>
    `).join('');

    this.factElements = this.introFacts.map(fact => ({
      ...fact,
      el: document.getElementById(fact.id)
    }));
  }

  bindScroll() {
    const updateTarget = () => {
      const rect = this.track.getBoundingClientRect();
      const trackHeight = this.track.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalDist = trackHeight - windowHeight;

      if (totalDist > 0) {
        const scrolled = -rect.top;
        this.targetProgress = Math.max(0, Math.min(1, scrolled / totalDist));
      }

      // Start render loop if not already running
      if (!this.isLoopRunning) {
        this.isLoopRunning = true;
        this.renderLoop();
      }
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    updateTarget();
  }

  renderLoop() {
    // 60fps Lerp calculation for silky smooth motion (lerp factor 0.15)
    const diff = this.targetProgress - this.currentProgress;
    
    if (Math.abs(diff) > 0.0001) {
      this.currentProgress += diff * 0.15;
    } else {
      this.currentProgress = this.targetProgress;
    }

    this.renderFrame(this.currentProgress);

    // Keep loop active while intro is near viewport or lerp is finishing
    const rect = this.track.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isVisible = rect.top < windowHeight && rect.bottom > 0;

    if (isVisible || Math.abs(diff) > 0.0001) {
      requestAnimationFrame(() => this.renderLoop());
    } else {
      this.isLoopRunning = false;
    }
  }

  renderFrame(progress) {
    // 1. Smoothly scrub video currentTime
    const duration = this.video.duration || this.videoDuration;
    const targetTime = progress * duration;

    if (!isNaN(targetTime) && Math.abs(this.video.currentTime - targetTime) > 0.015) {
      try {
        if ('fastSeek' in this.video) {
          this.video.fastSeek(targetTime);
        } else {
          this.video.currentTime = targetTime;
        }
      } catch (e) {
        // Safe catch during fast scrubbing
      }
    }

    // 2. Smoothly animate facts (bottom -> center -> top)
    this.factElements.forEach(fact => {
      if (!fact.el) return;

      if (progress < fact.start || progress > fact.end) {
        fact.el.style.opacity = '0';
        fact.el.style.transform = progress < fact.start 
          ? 'translate3d(-50%, 80vh, 0)' 
          : 'translate3d(-50%, -80vh, 0)';
        fact.el.style.pointerEvents = 'none';
      } else {
        const range = fact.end - fact.start;
        const factProgress = (progress - fact.start) / range; // 0.0 to 1.0

        // Smooth vertical displacement: +70vh (bottom) -> 0vh (center) -> -70vh (top)
        const translateY = (0.5 - factProgress) * 140;

        // Opacity curve: fade in (0 -> 0.25), solid (0.25 -> 0.75), fade out (0.75 -> 1)
        let opacity = 1;
        if (factProgress < 0.25) {
          opacity = factProgress / 0.25;
        } else if (factProgress > 0.75) {
          opacity = (1 - factProgress) / 0.25;
        }

        fact.el.style.opacity = opacity.toFixed(3);
        fact.el.style.transform = `translate3d(-50%, calc(-50% + ${translateY.toFixed(2)}vh), 0)`;
        fact.el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      }
    });
  }
}
