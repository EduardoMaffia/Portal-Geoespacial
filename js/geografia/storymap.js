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
