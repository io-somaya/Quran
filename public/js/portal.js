/**
 * ==============================================================================
 * بوابة الأنس بالقرآن (Portal Gateway Controller & Particles Engine)
 * تحكم تفاعلي ذكي ببوابة الفن الإسلامي والأنيميشن والجسيمات الذهبية
 * Made with craftsmanship by io-somaya (https://somaya-hassan.pages.dev/)
 * ==============================================================================
 */

(function () {
  'use strict';

  // --- محرك الجسيمات الذهبية والأثير الأندلسي (Golden Particles Canvas Engine) ---
  class GoldenDustEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.numParticles = 40;
      this.isRunning = false;
      this.animationFrameId = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.createParticles();
      this.start();
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = this.canvas.width = rect.width;
      this.height = this.canvas.height = rect.height;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.numParticles; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.7 + 0.2,
          speedY: -(Math.random() * 0.6 + 0.2), // صعود بطيء وناعم
          speedX: (Math.random() - 0.5) * 0.4,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseVal: Math.random() * Math.PI,
          hue: Math.random() > 0.3 ? 43 : 155 // مزيج بين الذهب والزمرد الخافت
        });
      }
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.loop();
    }

    stop() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }

    loop() {
      if (!this.isRunning) return;
      this.render();
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }

    render() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let p of this.particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseVal += p.pulseSpeed;

        const currentAlpha = Math.max(0.05, Math.min(0.9, p.alpha + Math.sin(p.pulseVal) * 0.3));

        // إعادة التدوير عند الخروج من الشاشة
        if (p.y < -10) {
          p.y = this.height + 10;
          p.x = Math.random() * this.width;
        }
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;

        // رسم النجم / الذرة المتوهجة
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        if (p.hue === 43) {
          // ذرة ذهبية معتمدة
          grad.addColorStop(0, `rgba(255, 238, 170, ${currentAlpha})`);
          grad.addColorStop(0.5, `rgba(223, 178, 62, ${currentAlpha * 0.6})`);
          grad.addColorStop(1, 'rgba(196, 154, 69, 0)');
        } else {
          // ذرة زمردية ناعمة
          grad.addColorStop(0, `rgba(167, 243, 208, ${currentAlpha})`);
          grad.addColorStop(0.5, `rgba(5, 150, 105, ${currentAlpha * 0.5})`);
          grad.addColorStop(1, 'rgba(6, 60, 46, 0)');
        }

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      }
    }
  }

  // --- تهيئة عناصر البوابة والتفاعل ---
  function initPortalHub() {
    const portalSection = document.getElementById('section-portal');
    if (!portalSection) return;

    // تشغيل محرك الجسيمات
    const particlesEngine = new GoldenDustEngine('portalParticlesCanvas');

    // ربط بطاقات الوجهات
    document.querySelectorAll('[data-portal-jump]').forEach((card) => {
      const activateJump = () => {
        const targetTab = card.getAttribute('data-portal-jump');
        if (targetTab && window.switchTab) {
          card.style.transform = 'scale(0.98)';
          setTimeout(() => {
            card.style.transform = '';
            window.switchTab(targetTab);
          }, 180);
        }
      };

      card.addEventListener('click', (e) => {
        e.preventDefault();
        activateJump();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateJump();
        }
      });
    });

    // تحديث بيانات العلامة المرجعية في البوابة
    function updatePortalBookmark() {
      const resumeBtn = document.getElementById('portalResumeBtn');
      const resumeText = document.getElementById('portalResumeText');
      if (!resumeBtn || !resumeText) return;

      try {
        const raw = localStorage.getItem('qurani_bookmark');
        if (raw) {
          const b = JSON.parse(raw);
          if (b && b.page) {
            resumeBtn.classList.remove('d-none');
            const surahName = b.surahName || (window.QuraniData ? window.QuraniData.surahs.find(s => s.id === b.surah)?.name : '') || '';
            resumeText.textContent = `استئناف القراءة: ${surahName ? 'سورة ' + surahName + ' — ' : ''}صفحة ${b.page}`;
            return;
          }
        }
      } catch (err) {
        console.warn('Bookmark read error in portal:', err);
      }
      resumeBtn.classList.add('d-none');
    }

    // مزامنة التاريخ الهجري في البوابة
    function updatePortalHijriDate() {
      const portalHijri = document.getElementById('portalHijriDateDisplay');
      const navHijri = document.getElementById('hijriDateDisplay');
      if (portalHijri && navHijri) {
        portalHijri.textContent = navHijri.textContent || 'اليوم المبارك';
      }
    }

    // استمع لأحداث التحديث
    window.addEventListener('qurani:bookmark_saved', updatePortalBookmark);
    updatePortalBookmark();
    updatePortalHijriDate();

    // تشغيل وإيقاف الجسيمات عند إخفاء وإظهار البوابة لتوفير الموارد
    const observer = new MutationObserver(() => {
      if (portalSection.classList.contains('d-none')) {
        particlesEngine.stop();
      } else {
        particlesEngine.resize();
        particlesEngine.start();
        updatePortalBookmark();
      }
    });

    observer.observe(portalSection, { attributes: true, attributeFilter: ['class'] });

    window.QuraniPortal = {
      updateBookmark: updatePortalBookmark,
      engine: particlesEngine
    };
  }

  // تشغيل عند اكتمال تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortalHub);
  } else {
    initPortalHub();
  }
})();
