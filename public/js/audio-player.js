/**
 * مشغل التلاوات الصوتية لمصحف «قرءاني»
 * Qur'ani Audio Player Engine
 */
(function(window) {
  'use strict';

  class QuranAudioPlayer {
    constructor() {
      this.audio = new Audio();
      this.isPlaying = false;
      this.currentSurah = 1;
      this.currentAyah = 1;
      this.currentReciter = 'ar.alafasy';
      this.playbackMode = 'surah'; // 'surah' or 'ayah'
      
      this.initEvents();
    }

    initEvents() {
      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.updateUI();
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.updateUI();
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.onEnded();
      });

      this.audio.addEventListener('timeupdate', () => {
        this.onTimeUpdate();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('تعذر تحميل الملف الصوتي:', e);
        this.isPlaying = false;
        this.updateUI();
      });
    }

    setReciter(reciterId) {
      this.currentReciter = reciterId;
      if (this.isPlaying) {
        this.playSurah(this.currentSurah);
      }
    }

    playSurah(surahNumber) {
      this.currentSurah = parseInt(surahNumber, 10);
      this.playbackMode = 'surah';
      const url = window.QuraniData ? window.QuraniData.getSurahAudioUrl(this.currentSurah, this.currentReciter) : '';
      if (!url) return;

      this.audio.src = url;
      this.audio.play().catch(err => {
        console.log('تشغيل الصوت يتطلب تفاعل المستخدم أولاً:', err);
      });
      this.updateUI();
    }

    playAyah(surahNumber, ayahNumber) {
      this.currentSurah = parseInt(surahNumber, 10);
      this.currentAyah = parseInt(ayahNumber, 10);
      this.playbackMode = 'ayah';
      const url = window.QuraniData ? window.QuraniData.getAyahAudioUrl(this.currentSurah, this.currentAyah, this.currentReciter) : '';
      if (!url) return;

      this.audio.src = url;
      this.audio.play().catch(err => {
        console.log('تشغيل الصوت يتطلب تفاعل المستخدم أولاً:', err);
      });
      this.updateUI();
    }

    togglePlay() {
      if (!this.audio.src) {
        this.playSurah(this.currentSurah);
        return;
      }
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play().catch(console.error);
      }
    }

    seek(percent) {
      if (this.audio.duration) {
        this.audio.currentTime = (percent / 100) * this.audio.duration;
      }
    }

    onTimeUpdate() {
      const progressBar = document.getElementById('audioProgressBar');
      const timeCurrent = document.getElementById('audioCurrentTime');
      const timeDuration = document.getElementById('audioDuration');

      if (progressBar && this.audio.duration) {
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        progressBar.style.width = pct + '%';
      }

      if (timeCurrent) {
        timeCurrent.textContent = this.formatTime(this.audio.currentTime);
      }
      if (timeDuration && this.audio.duration) {
        timeDuration.textContent = this.formatTime(this.audio.duration);
      }
    }

    onEnded() {
      if (this.playbackMode === 'surah') {
        if (this.currentSurah < 114) {
          this.playSurah(this.currentSurah + 1);
        }
      }
      this.updateUI();
    }

    formatTime(sec) {
      if (isNaN(sec)) return '00:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    updateUI() {
      const playerBar = document.getElementById('quranAudioPlayerBar');
      const playBtnIcons = document.querySelectorAll('.audio-play-icon');
      const surahNameElem = document.getElementById('audioSurahName');
      const reciterNameElem = document.getElementById('audioReciterName');

      if (playerBar) {
        playerBar.classList.toggle('d-none', !this.audio.src);
      }

      playBtnIcons.forEach(icon => {
        if (this.isPlaying) {
          icon.classList.remove('bi-play-fill');
          icon.classList.add('bi-pause-fill');
        } else {
          icon.classList.remove('bi-pause-fill');
          icon.classList.add('bi-play-fill');
        }
      });

      if (window.QuraniData) {
        const surah = window.QuraniData.getSurahByNumber(this.currentSurah);
        const reciter = window.QuraniData.reciters.find(r => r.id === this.currentReciter);
        if (surahNameElem && surah) surahNameElem.textContent = surah.name;
        if (reciterNameElem && reciter) reciterNameElem.textContent = reciter.name;
      }
    }
  }

  window.QuraniAudioPlayer = new QuranAudioPlayer();
})(window);
