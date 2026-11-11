/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

// Data konfigurasi undangan wisuda Fatha D. H. Tamher
const C = {
  name: 'Fatha D. H. Tamher, S.Kom.',
  nick: 'Fatha',
  degree: 'Sarjana S1 Komputer, Program Studi Ilmu Komputer',
  univ: 'Universitas Doktor Husni Ingratubun Tual',
  gtag: 'Wisuda Periode Tahun 2026',
  photo: '/assets/aistudio/Screenshot_2026-11-11_093422_5fb9ef48.png',
  family: 'Dengan penuh cinta, Keluarga Besar\nBapak Suaib Tamher/Pulu, SE & Ibu Nur Sudirman',
  event: {
    when: '2026-11-12T13:00:00+09:00',
    time: '13:00 WIT - Selesai',
    place: 'Wearhir',
    address: 'Jl. Dr. G.A Siwabessy RT 001/RW 001 Wearhir',
    map: 'https://maps.google.com/?q=Wearhir+Kota+Tual+Maluku',
  },
  music: '/audio/story_of_my_life.mp3',
};

const EVENT_DATE = new Date(C.event.when);
const DATE_LONG = EVENT_DATE.toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [guestName, setGuestName] = useState('Ilkom Ak25');
  const [isPlaying, setIsPlaying] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    ended: false,
    endedText: '',
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoScrollFrame = useRef<number>(0);
  const autoScrollActive = useRef<boolean>(false);
  const autoScrollLastTime = useRef<number>(0);
  const autoScrollPosition = useRef<number>(0);
  const prevScrollBehavior = useRef<string>('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // 1. Initial URL Params & Theme Setup
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawGuest = params.get('to');
      if (rawGuest && rawGuest.trim()) {
        setGuestName(rawGuest.trim().slice(0, 80));
      } else {
        setGuestName('Rivan & Pasangan');
      }
    } catch {
      // Fallback
    }

    let activeTheme: 'light' | 'dark' = 'light';
    try {
      const stored = localStorage.getItem('undangan-theme');
      if (stored === 'light' || stored === 'dark') {
        activeTheme = stored;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        activeTheme = 'dark';
      }
    } catch {
      // ignore
    }
    setTheme(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 2. Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = EVENT_DATE.getTime();
      const now = Date.now();
      const remaining = targetTime - now;

      if (remaining <= 0) {
        setCountdown({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          ended: true,
          endedText:
            remaining > -3600000
              ? 'Acara wisuda sedang berlangsung'
              : 'Acara wisuda telah berlangsung',
        });
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        ended: false,
        endedText: '',
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3. Scroll hint and autoscroll cancellation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolledPastHero(true);
      } else {
        setIsScrolledPastHero(false);
      }
    };

    const stopAutoScroll = () => {
      if (!autoScrollActive.current) return;
      cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = 0;
      autoScrollActive.current = false;
      autoScrollLastTime.current = 0;
      document.documentElement.style.scrollBehavior = prevScrollBehavior.current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const cancelEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    cancelEvents.forEach((evt) => {
      window.addEventListener(evt, stopAutoScroll, { passive: true });
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelEvents.forEach((evt) => {
        window.removeEventListener(evt, stopAutoScroll);
      });
    };
  }, []);

  // 4. Reveal Animations via IntersectionObserver
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-v');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-current', entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('.rv').forEach((el) => revealObserver.observe(el));
    document.querySelectorAll('.s').forEach((el) => sectionObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, [coverGone]);

  // Autoscroll runner
  const continueAutoScroll = (time: number) => {
    if (!autoScrollActive.current) return;
    if (!autoScrollLastTime.current) autoScrollLastTime.current = time;
    const elapsed = Math.min(time - autoScrollLastTime.current, 40);
    autoScrollLastTime.current = time;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (autoScrollPosition.current >= maxScroll) {
      autoScrollActive.current = false;
      document.documentElement.style.scrollBehavior = prevScrollBehavior.current;
      return;
    }

    autoScrollPosition.current = Math.min(autoScrollPosition.current + elapsed * 0.008, maxScroll);
    window.scrollTo(0, autoScrollPosition.current);
    autoScrollFrame.current = requestAnimationFrame(continueAutoScroll);
  };

  const startAutoScroll = () => {
    const reducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && window.scrollY < document.documentElement.scrollHeight - window.innerHeight) {
      autoScrollActive.current = true;
      autoScrollPosition.current = window.scrollY;
      prevScrollBehavior.current = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      autoScrollLastTime.current = 0;
      autoScrollFrame.current = requestAnimationFrame(continueAutoScroll);
    }
  };

  // Open Invitation Action
  const handleOpenInvitation = () => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
            showToast('Musik siap diputar. Tekan tombol musik di kanan bawah.');
          });
      } else {
        setIsPlaying(true);
      }
    }

    setIsOpen(true);
    document.body.classList.add('open');

    const reducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coverDuration = reducedMotion ? 50 : 950;

    setTimeout(() => {
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
    }, coverDuration);

    setTimeout(() => {
      setCoverGone(true);
    }, coverDuration + 100);

    setTimeout(() => {
      startAutoScroll();
    }, coverDuration + 350);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('undangan-theme', nextTheme);
    } catch {
      showToast('Mode berubah, tetapi preferensi tema tidak dapat disimpan di browser ini.');
    }
  };

  // Toggle Music Playback
  const handleToggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
            showToast('Musik belum dapat diputar. Tekan tombol musik untuk mencoba lagi.');
          });
      } else {
        setIsPlaying(true);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const initialLetter = (C.nick || C.name || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      {/* SVG Symbol Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <symbol id="br" viewBox="0 0 200 20">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 10 H88" />
            <path d="M112 10 H194" />
          </g>
          <g fill="currentColor">
            <path d="M100 2 L108 10 L100 18 L92 10Z" />
            <circle cx="84" cy="10" r="1.6" />
            <circle cx="116" cy="10" r="1.6" />
          </g>
        </symbol>
        <symbol id="cap" viewBox="0 0 64 64">
          <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
            <path d="M32 12 L60 25 L32 38 L4 25Z" />
            <path d="M16 32 V45 Q32 55 48 45 V32" />
            <path d="M56 27 V44" />
            <circle cx="56" cy="47" r="2.2" fill="currentColor" />
          </g>
        </symbol>
        <symbol id="calendar" viewBox="0 0 24 24">
          <rect x="3.5" y="5" width="17" height="16" rx="2" />
          <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
        </symbol>
        <symbol id="clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </symbol>
        <symbol id="pin" viewBox="0 0 24 24">
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.3" />
        </symbol>
        <symbol id="sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </symbol>
        <symbol id="moon" viewBox="0 0 24 24">
          <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
        </symbol>
      </svg>

      {/* AUDIO ELEMENT: Story of my life - One Direction */}
      <audio
        ref={audioRef}
        src={C.music}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          showToast('File musik sedang dimuat atau periksa koneksi browser.');
        }}
      />

      {/* ===== COVER: 3 LEMBAR MEWAH ===== */}
      {!coverGone && (
        <div id="cover" className={isOpen ? 'open' : ''}>
          {/* Flap Kiri */}
          <div className="p pl" aria-hidden="true">
            <span className="side">{C.nick} Tamher</span>
          </div>

          {/* Bagian Tengah */}
          <div className="p pc">
            {/* Corner ornaments */}
            <div className="cor a" />
            <div className="cor b" />
            <div className="cor c" />
            <div className="cor d" />

            <div className="cin">
              <small>UNDANGAN WISUDA</small>
              <svg className="cover-cap" aria-hidden="true">
                <use href="#cap" />
              </svg>
              <p className="cover-greeting">Dengan penuh syukur</p>
              <div className="cover-rule" aria-hidden="true">
                <span />
              </div>

              <div className="to">
                <p>Kepada Yth. Bapak/Ibu/Saudara/i</p>
                <b id="guest">{guestName}</b>
              </div>

              <p className="cover-date">{DATE_LONG}</p>

              <button
                className="btn cover-button"
                id="openBtn"
                onClick={handleOpenInvitation}
              >
                BUKA UNDANGAN
              </button>
            </div>
          </div>

          {/* Flap Kanan */}
          <div className="p pr" aria-hidden="true">
            <span className="side">Wisuda {C.nick}</span>
          </div>
        </div>
      )}

      {/* ===== ISI UNDANGAN ===== */}
      <main>
        {/* SECTION 1: HERO */}
        <section className="s hero tx" id="top">
          {/* Aesthetic Ambient Aurora & Stardust Layer */}
          <div className="bg-ambient-layer" aria-hidden="true">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="shooting-star shooting-star-1" />
          </div>

          <div className="stardust-container" aria-hidden="true">
            {[10, 25, 40, 55, 70, 85, 20, 60, 75, 90].map((leftPos, i) => (
              <span
                key={i}
                className="stardust-dot"
                style={{
                  left: `${leftPos}%`,
                  width: `${(i % 3) + 2}px`,
                  height: `${(i % 3) + 2}px`,
                  animationDuration: `${12 + (i % 6) * 3}s`,
                  animationDelay: `${(i * 1.5) % 8}s`,
                }}
              />
            ))}
          </div>

          <div className="gold-bokeh" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="frame">
            <div className="cor a" />
            <div className="cor b" />
            <div className="cor c" />
            <div className="cor d" />
          </div>

          <div className="in">
            {/* Foto Portrait Wisudawan with luminous aura & rotating ring */}
            <div className="hero-portrait-wrapper rv">
              <div className="hero-portrait-aura" aria-hidden="true" />
              <div className="hero-portrait-ring" aria-hidden="true" />
              <div className="hero-portrait">
                <div className="photo-frame">
                  {(!photoLoaded || photoError) && (
                    <span id="heroInitials" aria-hidden="true">
                      {initialLetter}
                    </span>
                  )}
                  <img
                    id="heroPhoto"
                    src={C.photo}
                    alt={`Foto ${C.name}`}
                    decoding="async"
                    onLoad={() => {
                      setPhotoLoaded(true);
                      setPhotoError(false);
                    }}
                    onError={() => {
                      setPhotoLoaded(false);
                      setPhotoError(true);
                    }}
                    hidden={!photoLoaded || photoError}
                  />
                </div>
              </div>
            </div>

            <p className="pre rv">Dengan penuh syukur</p>

            {/* Target element: CSS selector 1 */}
            <h2 className="rv gf" style={{ '--d': '.1s' } as React.CSSProperties}>
              {C.name}
            </h2>

            <p className="dg rv" style={{ '--d': '.2s' } as React.CSSProperties}>
              {C.degree}
            </p>
            <p className="dg rv" style={{ '--d': '.25s' } as React.CSSProperties}>
              {C.univ}
            </p>
            <p className="dt rv" style={{ '--d': '.3s' } as React.CSSProperties}>
              {DATE_LONG}
            </p>
          </div>

          {/* Petunjuk Scroll ke bawah */}
          <a
            className={`scroll-hint ${isScrolledPastHero ? 'is-hidden' : ''}`}
            href="#details"
            aria-label="Gulir ke informasi wisuda"
          >
            <span>GULIR KE BAWAH</span>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 4v15m-6-6 6 6 6-6" />
            </svg>
          </a>
        </section>

        {/* SECTION 2: DETAILS */}
        <section className="s alt tx details" id="details">
          {/* Aesthetic Ambient Layer */}
          <div className="bg-ambient-layer" aria-hidden="true">
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />
            <div className="shooting-star shooting-star-2" />
          </div>

          <div className="frame">
            <div className="cor a" />
            <div className="cor b" />
            <div className="cor c" />
            <div className="cor d" />
          </div>

          <div className="in">
            <h3 className="rv">Informasi Wisuda</h3>

            <div className="info-card rv">
              {/* Tanggal */}
              <div className="info-item">
                <span className="info-icon">
                  <svg aria-hidden="true">
                    <use href="#calendar" />
                  </svg>
                </span>
                <div>
                  <p className="detail-label">Tanggal</p>
                  <p className="detail-value">{DATE_LONG}</p>
                </div>
              </div>

              {/* Waktu */}
              <div className="info-item">
                <span className="info-icon">
                  <svg aria-hidden="true">
                    <use href="#clock" />
                  </svg>
                </span>
                <div>
                  <p className="detail-label">Waktu</p>
                  <p className="detail-value" id="eventTime">
                    {C.event.time}
                  </p>
                </div>
              </div>

              {/* Tempat: Target element: CSS selector 2 */}
              <div className="info-item">
                <span className="info-icon">
                  <svg aria-hidden="true">
                    <use href="#pin" />
                  </svg>
                </span>
                <div>
                  <p className="detail-label">Tempat</p>
                  <p className="detail-value">
                    <a
                      className="detail-location"
                      id="eventPlace"
                      href={C.event.map}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {C.event.address}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <a
              className="btn o rv"
              id="mapLink"
              href={C.event.map}
              target="_blank"
              rel="noopener noreferrer"
            >
              BUKA LOKASI
            </a>
          </div>
        </section>

        {/* SECTION 3: END / PENUTUP */}
        <section className="s tx end">
          {/* Aesthetic Ambient Layer */}
          <div className="bg-ambient-layer" aria-hidden="true">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-3" />
          </div>

          <div className="frame">
            <div className="cor a" />
            <div className="cor b" />
            <div className="cor c" />
            <div className="cor d" />
          </div>

          <div className="in">
            <h3 className="rv">Kami Menantikan Kehadiran Anda</h3>
            <p className="rv">
              Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
            </p>

            {/* Countdown Menuju Hari H */}
            <div className="countdown-wrap rv" id="countdownWrap">
              <p className="countdown-title">Menuju Hari Wisuda</p>
              {!countdown.ended ? (
                <div
                  className="countdown"
                  id="countdown"
                  role="timer"
                  aria-label="Hitung mundur menuju wisuda"
                >
                  <div className="count-unit">
                    <b id="countDays">{countdown.days}</b>
                    <span>Hari</span>
                  </div>
                  <div className="count-unit">
                    <b id="countHours">{countdown.hours}</b>
                    <span>Jam</span>
                  </div>
                  <div className="count-unit">
                    <b id="countMinutes">{countdown.minutes}</b>
                    <span>Menit</span>
                  </div>
                  <div className="count-unit">
                    <b id="countSeconds">{countdown.seconds}</b>
                    <span>Detik</span>
                  </div>
                </div>
              ) : (
                <p className="countdown-ended" id="countdownEnded">
                  {countdown.endedText}
                </p>
              )}
            </div>

            {/* Footer Keluarga */}
            <footer data-b="family">{C.family}</footer>
          </div>

          {/* Design Credit */}
          <p className="design-credit">
            Design{' '}
            <a
              href="https://www.instagram.com/rightarm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @rightarm"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="18" cy="6" r=".8" fill="currentColor" />
              </svg>
              @rightarm
            </a>
          </p>
        </section>
      </main>

      {/* ===== FLOATING CONTROLS ===== */}

      {/* Theme Toggle (Bottom Left) */}
      <button
        id="themeToggle"
        type="button"
        className="ready"
        onClick={handleToggleTheme}
        aria-pressed={theme === 'dark'}
        aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      >
        <svg aria-hidden="true">
          <use id="themeIcon" href={theme === 'dark' ? '#moon' : '#sun'} />
        </svg>
        <span id="themeLabel">{theme === 'dark' ? 'Gelap' : 'Terang'}</span>
      </button>

      {/* Music Toggle (Bottom Right) */}
      <button
        id="mus"
        type="button"
        className={isPlaying ? 'on' : ''}
        onClick={handleToggleMusic}
        aria-label={isPlaying ? 'Hentikan musik' : 'Putar musik'}
        aria-pressed={isPlaying}
        title="Putar atau hentikan musik: Story of My Life - One Direction"
      >
        &#9835;
      </button>

      {/* Toast Notification */}
      <div className={`toast ${toastMessage ? 'show' : ''}`} id="toast" role="alert">
        {toastMessage}
      </div>

    </>
  );
}
