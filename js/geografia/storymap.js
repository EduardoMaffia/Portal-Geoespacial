/* ════ storymap.js — Interações do StoryMap de geografia.html ════
   (1) Navegação vertical por pontos (scrollspy), (2) botão de retorno ao topo,
   (3) carrossel de fisiografia com abas. Extraído do script inline sem
   alterar a lógica. Carregado como módulo (executa após o DOM montado). */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Navegação Vertical por Pontos (Scrollspy) ---
    const sections = document.querySelectorAll('.story-section');
    const navDots = document.querySelectorAll('.dot-item');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navDots.forEach(dot => {
                    if (dot.getAttribute('href') === `#${activeId}`) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Rolagem suave ao clicar nos pontos da lateral
    navDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = dot.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 1b. Opacidade progressiva da navegação conforme a hero sai da tela (linear) ---
    const dotNav = document.getElementById('story-dot-nav');
    const hero = document.getElementById('hero');
    const LIMIAR_CLIQUE = 0.25;
    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function aplicarProgressoNav(prog) {
        if (!dotNav) return;
        const progresso = Math.min(1, Math.max(0, prog));
        const visivel = progresso > 0;
        const ativa = progresso >= LIMIAR_CLIQUE;
        dotNav.classList.toggle('visible', visivel);
        dotNav.style.opacity = progresso.toFixed(3);
        dotNav.style.pointerEvents = ativa ? 'auto' : 'none';
        dotNav.setAttribute('aria-hidden', String(!ativa));
        navDots.forEach(dot => {
            if (ativa) {
                dot.removeAttribute('tabindex');
            } else {
                dot.setAttribute('tabindex', '-1');
            }
        });
    }

    function definirVisibilidadeNav(visivel) {
        aplicarProgressoNav(visivel ? 1 : 0);
    }

    if (dotNav && hero && !reduzirMovimento) {
        let ticking = false;
        function atualizarNavPeloScroll() {
            ticking = false;
            const alturaHero = hero.offsetHeight || 1;
            const fundoHero = hero.getBoundingClientRect().bottom;
            aplicarProgressoNav(1 - fundoHero / alturaHero);
        }
        function agendarAtualizacaoNav() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(atualizarNavPeloScroll);
            }
        }
        window.addEventListener('scroll', agendarAtualizacaoNav, { passive: true });
        window.addEventListener('resize', agendarAtualizacaoNav);
        atualizarNavPeloScroll();
    } else if (dotNav && hero) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                definirVisibilidadeNav(!entry.isIntersecting);
            });
        }, { threshold: 0 });
        heroObserver.observe(hero);
    } else {
        definirVisibilidadeNav(true);
    }

    // --- 2. Botão Flutuante de Retorno ao Topo ---
    const backToTopBtn = document.getElementById('back-to-top-btn');

    window.addEventListener('scroll', () => {
        // Exibe o botão após rolar 350px além do topo
        if (window.scrollY > 350) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- 3. Carrossel Deslizante de Fisiografia com Abas ---
    const track = document.getElementById('carousel-track');
    const cards = document.querySelectorAll('.carousel-card');
    const pillBtns = document.querySelectorAll('.pill-btn');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    let currentSlide = 0;
    const totalSlides = cards.length;

    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentSlide = index;

        // Move o trilho suavemente
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Atualiza o estado visual das pílulas
        pillBtns.forEach((btn, i) => {
            if (i === currentSlide) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Atualiza os botões anterior/próximo
        if (prevBtn && nextBtn) {
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;
        }
    }

    // Clique nas pílulas transparentes
    pillBtns.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            goToSlide(i);
        });
    });

    // Clique nas setas do carrossel
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
        });
    }

    // Inicializa no primeiro slide
    goToSlide(0);
});
