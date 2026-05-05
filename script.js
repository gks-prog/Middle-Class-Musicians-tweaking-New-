document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =============================================
     0. SFX ENGINE — All synthesized via Web Audio API
        No external files, no CORS. Pure math.
     ============================================= */
  let sfxCtx = null;

  const getSFXCtx = () => {
    if (!sfxCtx) {
      try {
        sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (sfxCtx.state === "suspended") sfxCtx.resume();
    return sfxCtx;
  };

  // Helper: gain envelope
  const makeGain = (ctx, value = 0.3) => {
    const g = ctx.createGain();
    g.gain.value = value;
    g.connect(ctx.destination);
    return g;
  };

  // SFX 1: Subtle UI tick (nav hover, small interactions)
  const sfxTick = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = makeGain(ctx, 0.06);
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  };

  // SFX 2: Pleasant chime (WhatsApp / primary CTA buttons)
  const sfxChime = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5 chord
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.04 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 0.5);
    });
  };

  // SFX 3: Rubber pop (magic hub expand/collapse)
  const sfxPop = (open = true) => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = makeGain(ctx, 0.25);
    osc.type = "sine";
    if (open) {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
    }
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.16);
  };

  // SFX 4: Carousel whoosh
  const sfxWhoosh = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.18);
    filter.Q.value = 1.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + 0.22);
  };

  // SFX 5: Track pop/sweep (portfolio item open)
  const sfxSweep = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = makeGain(ctx, 0.08);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  };

  // SFX 6: Close / dismiss descending tone
  const sfxClose = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = makeGain(ctx, 0.08);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  };

  // SFX 7: Typewriter tick (form focus)
  const sfxType = () => {
    const ctx = getSFXCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = makeGain(ctx, 0.04);
    osc.type = "square";
    osc.frequency.value = 1200 + Math.random() * 200;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
    osc.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  };

  // Wire up sfx-click, sfx-hover, sfx-chime, sfx-pop class selectors
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".sfx-click, .sfx-chime, .sfx-pop, .sfx-hover, .carousel-btn, .ripple-btn");
    if (!el) return;
    if (el.classList.contains("sfx-chime") || el.classList.contains("btn--whatsapp")) {
      sfxChime();
    } else if (el.classList.contains("sfx-pop")) {
      // handled in magic btn below
    } else if (el.classList.contains("carousel-btn")) {
      sfxWhoosh();
    } else {
      sfxTick();
    }
  }, { passive: true });

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(".sfx-hover")) sfxTick();
  }, { passive: true });

  // Input focus sfx-type
  document.querySelectorAll(".sfx-type").forEach(el => {
    el.addEventListener("focus", () => sfxType(), { passive: true });
  });

  /* =============================================
     1. LOADER — Typewriter reveal
     ============================================= */
  const loader = document.getElementById("loader");
  const loaderText = document.getElementById("loader-text");
  const fullText = "Middle Class Musicians";

  if (loader && loaderText) {
    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        loaderText.textContent += fullText[charIndex];
        sfxType(); // typewriter sound
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 55);

    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("hidden");
        setTimeout(() => { loader.style.display = "none"; }, 1300);
      }, 1000);
    });
  }

  /* =============================================
     2. CUSTOM CURSOR
     ============================================= */
  const cursorDot  = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");

  if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let rafId;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    const animCursor = () => {
      // Dot follows instantly
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top  = mouseY + "px";
      // Ring lags behind for easing feel
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top  = ringY + "px";
      rafId = requestAnimationFrame(animCursor);
    };
    animCursor();

    // Hover state on interactive elements
    const interactiveEls = "a, button, [role='button'], .portfolio-item, .video-card, .collage-item, .sub-node, input, textarea";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveEls)) cursorRing.classList.add("is-hovering");
    }, { passive: true });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveEls)) cursorRing.classList.remove("is-hovering");
    }, { passive: true });

    document.addEventListener("mousedown", () => cursorDot.classList.add("is-clicking"),    { passive: true });
    document.addEventListener("mouseup",   () => cursorDot.classList.remove("is-clicking"), { passive: true });
  }

  /* =============================================
     3. RIPPLE EFFECT — on all .ripple-btn elements
     ============================================= */
  document.querySelectorAll(".ripple-btn, .btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-wave";
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width  = size + "px";
      ripple.style.height = size + "px";
      ripple.style.left   = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top    = (e.clientY - rect.top  - size / 2) + "px";
      btn.style.position  = "relative";
      btn.style.overflow  = "hidden";
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }, { passive: true });
  });

  /* =============================================
     4. PARTICLE BURST — on WhatsApp / chime buttons
     ============================================= */
  const spawnParticles = (x, y, count = 10) => {
    const colors = ["#25D366", "#1ebe5a", "#ffffff", "#a8ffc4"];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 40 + Math.random() * 60;
      p.style.left = x + "px";
      p.style.top  = y + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty("--dx", Math.cos(angle) * distance + "px");
      p.style.setProperty("--dy", Math.sin(angle) * distance + "px");
      p.style.setProperty("--duration", 0.4 + Math.random() * 0.3 + "s");
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  };

  document.querySelectorAll(".sfx-chime, .fab-whatsapp").forEach(btn => {
    btn.addEventListener("click", (e) => {
      spawnParticles(e.clientX, e.clientY, 12);
    }, { passive: true });
  });

  /* =============================================
     5. HEADER SCROLL (ANTI-LAG)
     ============================================= */
  const header = document.getElementById("header");
  if (header) {
    let lastScrollY = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle("hide", lastScrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* =============================================
     6. SCROLL REVEAL — Intersection Observer
     ============================================= */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal-up").forEach(el => {
    revealObserver.observe(el);
  });

  /* =============================================
     7. HERO GLITCH — random subtle glitch on title words
     ============================================= */
  const heroWords = document.querySelectorAll(".hero__word");
  if (heroWords.length) {
    setInterval(() => {
      const word = heroWords[Math.floor(Math.random() * heroWords.length)];
      word.classList.add("glitch");
      setTimeout(() => word.classList.remove("glitch"), 250);
    }, 5000 + Math.random() * 4000);
  }

  /* =============================================
     8. MAGNETIC BUTTON EFFECT
     ============================================= */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".magnetic-btn").forEach(btn => {
      const strength = 0.35;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * strength;
        const dy   = (e.clientY - cy) * strength;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      }, { passive: true });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      }, { passive: true });
    });
  }

  /* =============================================
     9. 3D TILT on portfolio cards
     ============================================= */
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".tilt-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `
          perspective(600px)
          rotateY(${x * 12}deg)
          rotateX(${-y * 8}deg)
          translateY(-10px)
        `;
      }, { passive: true });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      }, { passive: true });
    });
  }

  /* =============================================
     10. AUDIO VISUALIZER & PLAYBACK
     ============================================= */
  const audioEl            = document.getElementById("global-audio");
  const canvas             = document.getElementById("global-visualizer");
  const visualizerContainer = document.getElementById("visualizer-container");
  const heroPlayBtn         = document.getElementById("hero-play-btn");

  let stopAudio = () => {};
  let playTrack = () => {};

  if (audioEl && canvas && visualizerContainer) {
    const ctx = canvas.getContext("2d", { alpha: false });
    let audioContext, analyser, source, dataArray, bufferLength, animationId;
    let isInitialized = false;

    const resizeCanvas = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = visualizerContainer.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const initAudio = () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        source = audioContext.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        bufferLength = analyser.frequencyBinCount / 2;
        dataArray    = new Uint8Array(bufferLength);
        resizeCanvas();
        isInitialized = true;
      } catch (e) {
        console.warn("AudioContext init failed silently.");
      }
    };

    const drawVisualizer = () => {
      animationId = requestAnimationFrame(drawVisualizer);
      if (!analyser || !dataArray) return;
      analyser.getByteFrequencyData(dataArray);
      const rect = visualizerContainer.getBoundingClientRect();
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, rect.width, rect.height);
      if (!bufferLength) return;
      const barSpacing = 3;
      const barWidth   = (rect.width / bufferLength) - barSpacing;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const percent   = dataArray[i] / 255;
        const barHeight = rect.height * percent;
        const alpha     = percent * 0.7;
        ctx.fillStyle = percent > 0.7
          ? `rgba(37, 211, 102, ${alpha})`
          : `rgba(255, 255, 255, ${percent * 0.22})`;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, rect.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, rect.height - barHeight, barWidth, barHeight);
        }
        ctx.fill();
        x += barWidth + barSpacing;
      }
    };

    stopAudio = () => {
      audioEl.pause();
      if (animationId) cancelAnimationFrame(animationId);
      visualizerContainer.classList.remove("is-active");
      if (ctx) {
        const rect = visualizerContainer.getBoundingClientRect();
        ctx.fillStyle = "#030303";
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
      document.querySelectorAll(".icon-pause").forEach(el => el.classList.add("hidden"));
      document.querySelectorAll(".icon-play").forEach(el => el.classList.remove("hidden"));
    };

    playTrack = (url) => {
      if (!isInitialized) initAudio();
      if (audioContext && audioContext.state === "suspended") audioContext.resume();
      audioEl.src = url;
      const p = audioEl.play();
      if (p !== undefined) {
        p.then(() => {
          drawVisualizer();
          visualizerContainer.classList.add("is-active");
        }).catch(() => stopAudio());
      }
    };

    if (heroPlayBtn) {
      heroPlayBtn.addEventListener("click", () => {
        const iconPlay  = heroPlayBtn.querySelector(".icon-play");
        const iconPause = heroPlayBtn.querySelector(".icon-pause");
        if (audioEl.paused || audioEl.src !== heroPlayBtn.getAttribute("data-audio-src")) {
          playTrack(heroPlayBtn.getAttribute("data-audio-src"));
          if (iconPlay)  iconPlay.classList.add("hidden");
          if (iconPause) iconPause.classList.remove("hidden");
        } else {
          stopAudio();
        }
      });
    }
  }

  /* =============================================
     11. PORTFOLIO CAROUSEL
     ============================================= */
  const track      = document.getElementById("portfolio-track");
  const prevBtn    = document.getElementById("prev-btn");
  const nextBtn    = document.getElementById("next-btn");
  const wrapper    = document.getElementById("portfolio-wrapper");
  const portfolioItems   = document.querySelectorAll(".portfolio-item");
  const zoomedOverlay    = document.getElementById("zoomed-overlay");
  const closeZoomedBtn   = document.getElementById("close-zoomed");

  let isDraggingCarousel = false;

  if (track && wrapper && track.firstElementChild) {
    let carouselInterval;
    let slideTime = 3000;
    let hasInteracted = false;
    let isAnimating = false;

    const handleInteraction = () => {
      if (!hasInteracted) { hasInteracted = true; slideTime = 5500; }
      clearInterval(carouselInterval);
      carouselInterval = setInterval(moveNext, slideTime);
    };

    const getGap = () => {
      try {
        return parseFloat(window.getComputedStyle(track).gap) || 32;
      } catch { return 32; }
    };

    const moveNext = () => {
      if (isAnimating || !track.firstElementChild) return;
      isAnimating = true;
      const first = track.firstElementChild;
      const move  = first.offsetWidth + getGap();
      track.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      track.style.transform  = `translateX(-${move}px)`;
      setTimeout(() => {
        track.style.transition = "none";
        track.appendChild(first);
        track.style.transform  = "translateX(0)";
        isAnimating = false;
      }, 610);
    };

    const movePrev = () => {
      if (isAnimating || !track.lastElementChild) return;
      isAnimating = true;
      const last = track.lastElementChild;
      const move = last.offsetWidth + getGap();
      track.style.transition = "none";
      track.insertBefore(last, track.firstElementChild);
      track.style.transform = `translateX(-${move}px)`;
      void track.offsetWidth;
      track.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
      track.style.transform  = "translateX(0)";
      setTimeout(() => { isAnimating = false; }, 610);
    };

    if (prevBtn && nextBtn) {
      nextBtn.addEventListener("click", () => { handleInteraction(); moveNext(); });
      prevBtn.addEventListener("click", () => { handleInteraction(); movePrev(); });
    }

    // Touch swipe
    let startX = 0;
    wrapper.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDraggingCarousel = false;
    }, { passive: true });

    wrapper.addEventListener("touchmove", () => {
      isDraggingCarousel = true;
    }, { passive: true });

    wrapper.addEventListener("touchend", (e) => {
      if (e.changedTouches.length > 0) {
        const diff = startX - e.changedTouches[0].clientX;
        if (diff > 50)  { handleInteraction(); moveNext(); }
        if (diff < -50) { handleInteraction(); movePrev(); }
      }
      setTimeout(() => { isDraggingCarousel = false; }, 100);
    }, { passive: true });

    carouselInterval = setInterval(moveNext, slideTime);
  }

  // Zoomed overlay
  if (zoomedOverlay && closeZoomedBtn && portfolioItems.length) {
    portfolioItems.forEach(item => {
      item.addEventListener("click", () => {
        if (isDraggingCarousel) return;
        const img    = item.querySelector(".portfolio-item__image");
        const title  = item.querySelector(".portfolio-item__title");
        const artist = item.querySelector(".portfolio-item__artist");
        const audio  = item.getAttribute("data-audio-src");

        if (img)    document.getElementById("zoomed-img").src   = img.src;
        if (title)  document.getElementById("zoomed-title").innerText  = title.innerText;
        if (artist) document.getElementById("zoomed-artist").innerText = artist.innerText;

        zoomedOverlay.classList.add("is-active");
        if (track) track.classList.add("is-dimmed");
        sfxSweep();
        stopAudio();
        if (audio) playTrack(audio);
      });
    });

    closeZoomedBtn.addEventListener("click", () => {
      zoomedOverlay.classList.remove("is-active");
      if (track) track.classList.remove("is-dimmed");
      sfxClose();
      stopAudio();
    });
  }

  /* =============================================
     12. MAGIC HUB — with staggered node reveals + SFX
     ============================================= */
  const magicBtn  = document.getElementById("magic-btn");
  const magicHub  = document.getElementById("magic-hub");
  const subNodes  = document.querySelectorAll(".reveal-node");

  if (magicBtn && magicHub) {
    const btnText = magicBtn.querySelector(".btn-text");

    magicBtn.addEventListener("click", () => {
      const isOpen = magicHub.classList.toggle("is-active");
      sfxPop(isOpen);

      if (isOpen) {
        if (btnText) btnText.innerText = "One Stop Solution for Artists";
        magicBtn.classList.add("is-active");
        magicBtn.setAttribute("aria-expanded", "true");
        // Stagger nodes
        subNodes.forEach((node, i) => {
          setTimeout(() => {
            node.classList.add("is-visible");
          }, i * 80);
        });
      } else {
        if (btnText) btnText.innerText = "Don\u2019t Touch It";
        magicBtn.classList.remove("is-active");
        magicBtn.setAttribute("aria-expanded", "false");
        subNodes.forEach(node => node.classList.remove("is-visible"));
      }
    });
  }

  /* =============================================
     13. WHATSAPP BOOKING FORM
     ============================================= */
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name  = (document.getElementById("name")?.value  || "").trim();
      const phone = (document.getElementById("phone")?.value || "").trim();
      const ig    = (document.getElementById("ig")?.value    || "").trim();
      const query = (document.getElementById("query")?.value || "").trim();

      if (!name || !phone) return;

      const _a = "9193", _b = "1577", _c = "8147";
      const number = _a + _b + _c;

      sfxChime();
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 18);

      const msg = `*New Studio Inquiry*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Instagram:* ${ig}\n*Query:* ${query}`;
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, "_blank");
      bookingForm.reset();
    });
  }

  /* =============================================
     14. FLOATING MUSICAL NOTES
     ============================================= */
  const initFloatingNotes = () => {
    const container = document.getElementById("floating-notes-container");
    if (!container) return;
    const symbols = ["♪", "♫", "♩", "♬", "♭", "♮"];
    const notes   = [];

    for (let i = 0; i < 32; i++) {
      const el   = document.createElement("span");
      const left  = Math.random() * 100;
      const size  = Math.random() * 1.8 + 0.8;
      const opacity = Math.random() * 0.12 + 0.03;
      const speed = Math.random() * 0.4 + 0.15;
      const drift = Math.random() * 0.08 - 0.04; // gentle lateral drift
      const startY = Math.random() * window.innerHeight;
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];

      el.innerText = symbol;
      el.style.cssText = `
        position: absolute;
        left: ${left}%;
        font-size: ${size}rem;
        color: #ffffff;
        opacity: ${opacity};
        will-change: transform;
        user-select: none;
        pointer-events: none;
        transform: translate3d(0, ${startY}px, 0);
      `;
      container.appendChild(el);
      notes.push({ el, speed, drift, startY, left });
    }

    let notesTicking = false;
    window.addEventListener("scroll", () => {
      if (!notesTicking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const winH    = window.innerHeight;
          notes.forEach(note => {
            let y = note.startY - scrollY * note.speed;
            const total = winH + 200;
            y = ((y + 100) % total);
            if (y < 0) y += total;
            y -= 100;
            note.el.style.transform = `translate3d(${note.drift * scrollY}px, ${y}px, 0)`;
          });
          notesTicking = false;
        });
        notesTicking = true;
      }
    }, { passive: true });
  };

  initFloatingNotes();

  /* =============================================
     15. LUCIDE ICON INIT
     ============================================= */
  setTimeout(() => {
    if (window.lucide) {
      lucide.createIcons();
    }
  }, 500);

  /* =============================================
     16. TOAST — visual SFX feedback on chime buttons
     ============================================= */
  const createToast = (message) => {
    let toast = document.querySelector(".sfx-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "sfx-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  document.querySelectorAll(".fab-whatsapp").forEach(btn => {
    btn.addEventListener("click", () => createToast("Opening WhatsApp..."), { passive: true });
  });

  document.querySelectorAll(".btn--whatsapp").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!btn.type || btn.type !== "submit") return;
      // form submission handled separately
    }, { passive: true });
  });

});
