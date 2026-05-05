document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // 0. SFX AUDIO ENGINE
    // ==========================================
    const sfxHover = document.getElementById('sfx-hover');
    const sfxClick = document.getElementById('sfx-click');
    const sfxTriggers = document.querySelectorAll('.sfx-trigger');

    if(sfxHover) sfxHover.volume = 0.15; // Keep UI sounds subtle
    if(sfxClick) sfxClick.volume = 0.3;

    sfxTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => {
            if (sfxHover) {
                sfxHover.currentTime = 0;
                sfxHover.play().catch(() => {});
            }
        });
        trigger.addEventListener('click', () => {
            if (sfxClick) {
                sfxClick.currentTime = 0;
                sfxClick.play().catch(() => {});
            }
        });
    });

    // ==========================================
    // 1. SCROLL ANIMATION OBSERVER
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(element => {
        fadeObserver.observe(element);
    });

    // ==========================================
    // 2. LOADING SCREEN
    // ==========================================
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => { loader.style.display = 'none'; }, 1200);
            }, 800);
        });
    }

    // ==========================================
    // 3. HEADER SCROLL (ANTI-LAG)
    // ==========================================
    const header = document.getElementById('header');
    if (header) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (lastScrollY > 100) {
                        header.classList.add('hide');
                    } else {
                        header.classList.remove('hide');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ==========================================
    // 4. AUDIO VISUALIZER & PLAYBACK (STRICT CORS FIX)
    // ==========================================
    const audioEl = document.getElementById('global-audio');
    const canvas = document.getElementById('global-visualizer');
    const visualizerContainer = document.getElementById('visualizer-container');
    const heroPlayBtn = document.getElementById('hero-play-btn');

    let stopAudio = () => {};
    let playTrack = () => {};

    if (audioEl && canvas && visualizerContainer) {
        const ctx = canvas.getContext('2d', { alpha: false });
        let audioContext, analyser, source, dataArray, bufferLength, animationId;
        let isInitialized = false;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = visualizerContainer.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resizeCanvas, { passive: true });

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
                dataArray = new Uint8Array(bufferLength);
                resizeCanvas();
                isInitialized = true;
            } catch (e) { 
                console.warn("Audio Context blocked silently by browser."); 
            }
        };

        const drawVisualizer = () => {
            animationId = requestAnimationFrame(drawVisualizer);
            if (!analyser || !dataArray) return;
            
            analyser.getByteFrequencyData(dataArray);
            
            const rect = visualizerContainer.getBoundingClientRect();
            ctx.fillStyle = '#050505'; // Cinematic deep black
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            if (!bufferLength) return;

            const barSpacing = 3;
            const barWidth = (rect.width / bufferLength) - barSpacing;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const percent = dataArray[i] / 255;
                const barHeight = rect.height * percent;
                // Crimson Red Cinematic Glow Palette
                ctx.fillStyle = percent > 0.75 ? `rgba(217, 28, 53, ${percent * 0.8})` : `rgba(255, 255, 255, ${percent * 0.3})`;
                ctx.beginPath();
                ctx.roundRect(x, rect.height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
                ctx.fill();
                x += barWidth + barSpacing;
            }
        };

        stopAudio = () => {
            audioEl.pause();
            if (animationId) cancelAnimationFrame(animationId);
            visualizerContainer.classList.remove('is-active');
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const pauses = document.querySelectorAll('.icon-pause');
            const plays = document.querySelectorAll('.icon-play');
            for(let i=0; i < pauses.length; i++) pauses[i].classList.add('hidden');
            for(let i=0; i < plays.length; i++) plays[i].classList.remove('hidden');
        };

        playTrack = (url) => {
            if (!isInitialized) initAudio();
            if (audioContext && audioContext.state === 'suspended') audioContext.resume();
            
            audioEl.src = url;
            const playPromise = audioEl.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    drawVisualizer();
                    visualizerContainer.classList.add('is-active');
                }).catch(error => {
                    stopAudio();
                });
            }
        };

        if (heroPlayBtn) {
            heroPlayBtn.addEventListener('click', () => {
                const iconPlay = heroPlayBtn.querySelector('.icon-play');
                const iconPause = heroPlayBtn.querySelector('.icon-pause');
                
                if (audioEl.paused || audioEl.src !== heroPlayBtn.getAttribute('data-audio-src')) {
                    playTrack(heroPlayBtn.getAttribute('data-audio-src'));
                    if (iconPlay) iconPlay.classList.add('hidden'); 
                    if (iconPause) iconPause.classList.remove('hidden');
                } else {
                    stopAudio();
                }
            });
        }
    }

    // ==========================================
    // 5. PORTFOLIO CAROUSEL
    // ==========================================
    const track = document.getElementById('portfolio-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const wrapper = document.getElementById('portfolio-wrapper');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const zoomedOverlay = document.getElementById('zoomed-overlay');
    const closeZoomedBtn = document.getElementById('close-zoomed');

    let isDraggingCarousel = false; 

    if (track && wrapper && track.firstElementChild) {
        let carouselInterval;
        let slideIntervalTime = 3000;
        let hasInteracted = false;
        let isAnimating = false;

        const handleInteraction = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                slideIntervalTime = 5500; 
            }
            clearInterval(carouselInterval);
            carouselInterval = setInterval(moveNext, slideIntervalTime);
        };

        const moveNext = () => {
            if (isAnimating || !track.firstElementChild) return;
            isAnimating = true;
            const firstItem = track.firstElementChild;
            const itemWidth = firstItem.offsetWidth;
            
            let gap = 32;
            if (window.getComputedStyle) {
                const trackStyle = window.getComputedStyle(track);
                gap = parseFloat(trackStyle.gap) || 32;
            }
            
            const moveDistance = itemWidth + gap;
            
            track.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = `translateX(-${moveDistance}px)`;
            
            setTimeout(() => {
                track.style.transition = 'none';
                track.appendChild(firstItem); 
                track.style.transform = 'translateX(0)';
                isAnimating = false;
            }, 800); 
        };

        const movePrev = () => {
            if (isAnimating || !track.lastElementChild) return;
            isAnimating = true;
            const lastItem = track.lastElementChild;
            const itemWidth = lastItem.offsetWidth;
            
            let gap = 32;
            if (window.getComputedStyle) {
                const trackStyle = window.getComputedStyle(track);
                gap = parseFloat(trackStyle.gap) || 32;
            }

            const moveDistance = itemWidth + gap;

            track.style.transition = 'none';
            track.insertBefore(lastItem, track.firstElementChild);
            track.style.transform = `translateX(-${moveDistance}px)`;

            void track.offsetWidth; 

            track.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = 'translateX(0)';

            setTimeout(() => { isAnimating = false; }, 800);
        };

        if (prevBtn && nextBtn) {
            nextBtn.addEventListener('click', () => { handleInteraction(); moveNext(); });
            prevBtn.addEventListener('click', () => { handleInteraction(); movePrev(); });
        }

        let startX = 0;
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDraggingCarousel = false;
        }, { passive: true });

        wrapper.addEventListener('touchmove', () => {
            isDraggingCarousel = true;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                let endX = e.changedTouches[0].clientX;
                let diffX = startX - endX;

                if (diffX > 50) {
                    handleInteraction();
                    moveNext();
                } else if (diffX < -50) {
                    handleInteraction();
                    movePrev();
                }
            }
            setTimeout(() => { isDraggingCarousel = false; }, 100);
        });

        carouselInterval = setInterval(moveNext, slideIntervalTime);
    }

    if (zoomedOverlay && closeZoomedBtn && portfolioItems.length > 0) {
        for (let i = 0; i < portfolioItems.length; i++) {
            const item = portfolioItems[i];
            item.addEventListener('click', () => {
                if (isDraggingCarousel) return;

                const imgEl = item.querySelector('.portfolio-item__image');
                const titleEl = item.querySelector('.portfolio-item__title');
                const artistEl = item.querySelector('.portfolio-item__artist');
                const audioUrl = item.getAttribute('data-audio-src');

                if (imgEl) document.getElementById('zoomed-img').src = imgEl.src;
                if (titleEl) document.getElementById('zoomed-title').innerText = titleEl.innerText;
                if (artistEl) document.getElementById('zoomed-artist').innerText = artistEl.innerText;

                zoomedOverlay.classList.add('is-active');
                if (track) track.classList.add('is-dimmed');
                
                stopAudio();
                if (audioUrl) playTrack(audioUrl);
            });
        }

        closeZoomedBtn.addEventListener('click', () => {
            zoomedOverlay.classList.remove('is-active');
            if (track) track.classList.remove('is-dimmed');
            stopAudio(); 
        });
    }

    // ==========================================
    // 6. MAGIC HUB LOGIC 
    // ==========================================
    const magicBtn = document.getElementById('magic-btn');
    const magicHub = document.getElementById('magic-hub');

    if (magicBtn && magicHub) {
        const btnText = magicBtn.querySelector('.btn-text');
        
        magicBtn.addEventListener('click', () => {
            magicHub.classList.toggle('is-active');
            
            if (magicHub.classList.contains('is-active')) {
                if (btnText) btnText.innerText = "The Complete Artist Vault";
                magicBtn.classList.add('is-active');
            } else {
                if (btnText) btnText.innerText = "Don't Touch It";
                magicBtn.classList.remove('is-active');
            }
        });
    }

    // ==========================================
    // 7. WHATSAPP BOOKING FORM
    // ==========================================
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const nameEl = document.getElementById('name');
            const phoneEl = document.getElementById('phone');
            const igEl = document.getElementById('ig');
            const queryEl = document.getElementById('query');

            const name = nameEl ? nameEl.value : '';
            const phone = phoneEl ? phoneEl.value : '';
            const ig = igEl ? igEl.value : '';
            const query = queryEl ? queryEl.value : '';

            // BOT PROTECTION
            const _0x1 = '9193';
            const _0x2 = '1577';
            const _0x3 = '8147';
            const secureRoute = _0x1 + _0x2 + _0x3; 

            const rawMessage = `*New Studio Inquiry*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Instagram:* ${ig}\n*Query:* ${query}`;
            window.open(`https://wa.me/${secureRoute}?text=${encodeURIComponent(rawMessage)}`, '_blank');
            bookingForm.reset();
        });
    }

    // ==========================================
    // 8. FLOATING MUSICAL NOTES
    // ==========================================
    const initFloatingNotes = () => {
        const container = document.getElementById('floating-notes-container');
        if (!container) return;

        const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
        const noteCount = 25; 
        const notes = [];

        for (let i = 0; i < noteCount; i++) {
            const noteEl = document.createElement('span');
            const left = Math.random() * 100; 
            const size = Math.random() * 1.5 + 0.8; 
            const opacity = Math.random() * 0.08 + 0.02; 
            const speed = Math.random() * 0.4 + 0.1; 
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const startY = Math.random() * window.innerHeight; 

            noteEl.innerText = symbol;
            noteEl.style.position = 'absolute';
            noteEl.style.left = `${left}%`;
            noteEl.style.top = `0px`; 
            noteEl.style.fontSize = `${size}rem`;
            noteEl.style.color = '#ffffff';
            noteEl.style.opacity = opacity;
            noteEl.style.willChange = 'transform';
            
            noteEl.style.transform = `translate3d(0, ${startY}px, 0)`;

            container.appendChild(noteEl);
            notes.push({ el: noteEl, speed, startY });
        }

        let notesTicking = false;
        window.addEventListener('scroll', () => {
            if (!notesTicking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    const winH = window.innerHeight;
                    
                    for (let i = 0; i < notes.length; i++) {
                        const note = notes[i];
                        let currentY = note.startY - (scrollY * note.speed);
                        
                        const totalH = winH + 200; 
                        currentY = ((currentY + 100) % totalH);
                        if (currentY < 0) currentY += totalH;
                        currentY -= 100; 
                        
                        note.el.style.transform = `translate3d(0, ${currentY}px, 0)`;
                    }
                    notesTicking = false;
                });
                notesTicking = true;
            }
        }, { passive: true });
    };

    initFloatingNotes();

    // Fallback load for Lucide icons
    setTimeout(() => {
        if (window.lucide) {
            lucide.createIcons();
        }
    }, 500);
});
