// Typewriter Effect
class Typewriter {
    constructor(element) {
        this.element = element;
        this.phrases = JSON.parse(element.getAttribute('data-phrases'));
        this.currentPhraseIndex = 0;
        this.currentText = '';
        this.isDeleting = false;
        this.typingSpeed = 100;
        this.deletingSpeed = 50;
        this.pauseTime = 2000;
        this.type();
    }

    type() {
        const currentPhrase = this.phrases[this.currentPhraseIndex];

        if (this.isDeleting) {
            this.currentText = currentPhrase.substring(0, this.currentText.length - 1);
        } else {
            this.currentText = currentPhrase.substring(0, this.currentText.length + 1);
        }

        this.element.textContent = this.currentText;

        let typeSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

        if (!this.isDeleting && this.currentText === currentPhrase) {
            typeSpeed = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentText === '') {
            this.isDeleting = false;
            this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
        new Typewriter(typewriterElement);
    }

    // Initialize particle network
    initParticleNetwork();

    // Initialize branch tabs
    initBranchTabs();

    // Initialize Terms Modal
    initTermsModal();

    // Initialize Privacy Modal
    initPrivacyModal();

    // Initialize Values Accordion
    initValuesAccordion();

    // Initialize Interactive Map
    initInteractiveMap();
});

// Interactive Map Logic (Custom engine for mapdata.js)
async function initInteractiveMap() {
    const container = document.getElementById('peru-map-container');
    const tooltip = document.getElementById('map-tooltip');

    if (!container) return;

    try {
        // 1. Fetch the SVG map
        const response = await fetch('img/mapa.svg');
        const svgText = await response.text();

        // 2. Inject it (removing the loader)
        const loader = document.getElementById('map-loader');
        if (loader) loader.remove();

        // Parse and inject
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        if (!svgElement) throw new Error('No SVG element found');

        // Add styling classes
        svgElement.classList.add('peru-svg-interactive');
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgElement.setAttribute('viewBox', '0 0 1000 1000');

        container.appendChild(svgElement);

        // 3. City Markers & Informative Cards Logic
        const cities = [
            {
                id: 'tacna',
                name: 'Sede Tacna',
                x: 727, y: 921,
                phone: ['(052) 24 2222', '(052) 24 8080', '(052) 24 7070'],
                whatsapp: '952 978 888'
            },
            {
                id: 'ilo',
                name: 'Sede Ilo',
                x: 675, y: 895,
                phone: ['(053) 49 6060'],
                whatsapp: '952 212 122'
            },
            {
                id: 'arequipa',
                name: 'Sede Arequipa',
                x: 632, y: 826,
                phone: ['(054) 34 2525'],
                whatsapp: '980 098 900'
            },
            {
                id: 'moquegua',
                name: 'Sede Moquegua',
                x: 700, y: 881,
                phone: [],
                whatsapp: ['980 020 044', '980 020 077']
            }
        ];

        const infoCard = document.createElement('div');
        infoCard.className = 'city-info-card';
        container.appendChild(infoCard);

        let hideTimeout;

        cities.forEach(city => {
            const marker = document.createElement('div');
            marker.className = 'map-marker';
            marker.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
            marker.style.left = `${(city.x / 1000) * 100}%`;
            marker.style.top = `${(city.y / 1000) * 100}%`;
            container.appendChild(marker);

            const toggleCard = (e) => {
                e.stopPropagation(); // Avoid closing immediately

                // If it's already open for THIS city, close it
                if (infoCard.classList.contains('visible') && infoCard.getAttribute('data-active-city') === city.id) {
                    infoCard.classList.remove('visible');
                    return;
                }

                // Close any currently open card before opening a new one
                infoCard.classList.remove('visible');

                const phoneHtml = city.phone.map(p => `
                    <a href="tel:${p.replace(/\s/g, '')}" class="contact-item">
                        <i class="fas fa-phone-alt"></i> ${p}
                    </a>
                `).join('');

                const waArray = Array.isArray(city.whatsapp) ? city.whatsapp : [city.whatsapp];
                const waHtml = waArray.map(w => `
                    <a href="https://wa.me/51${w.replace(/\s/g, '')}" target="_blank" class="contact-item whatsapp">
                        <i class="fab fa-whatsapp"></i> ${w}
                    </a>
                `).join('');

                infoCard.innerHTML = `
                    <div class="card-header">
                        <h3>${city.name}</h3>
                        <span class="card-status">Atención Inmediata</span>
                    </div>
                    <div class="card-body">
                        <h4>Central Telefónica</h4>
                        <div class="contact-list">
                            ${phoneHtml}
                            ${waHtml}
                        </div>
                    </div>
                `;

                infoCard.style.left = `${(city.x / 1000) * 100}%`;
                infoCard.style.top = `${(city.y / 1000) * 100}%`;
                infoCard.setAttribute('data-active-city', city.id);
                infoCard.classList.add('visible');
            };

            marker.addEventListener('click', toggleCard);

            // Close card when clicking anywhere else
            document.addEventListener('click', (e) => {
                if (!infoCard.contains(e.target) && !marker.contains(e.target)) {
                    infoCard.classList.remove('visible');
                }
            });
        });

        // 4. Apply settings from mapdata.js
        const mapData = window.simplemaps_countrymap_mapdata;
        if (!mapData) {
            console.error('mapdata.js configuration not found');
            return;
        }

        const defaultColor = mapData.main_settings.state_color || '#e0e0e0';
        const hoverColor = mapData.main_settings.state_hover_color || '#ff6b00';
        const borderColor = mapData.main_settings.border_color || '#ffffff';

        const paths = svgElement.querySelectorAll('path');
        paths.forEach(path => {
            const id = path.id;
            const stateConfig = mapData.state_specific[id];

            // Apply base style
            path.classList.add('dept-path');
            path.style.fill = defaultColor;
            path.style.stroke = borderColor;
            path.style.strokeWidth = mapData.main_settings.border_size || '0.5';
            path.style.transition = 'all 0.3s ease';

            // Events
            path.addEventListener('mouseenter', (e) => {
                const name = stateConfig ? stateConfig.name : id;
                path.style.fill = hoverColor;

                tooltip.textContent = name;
                tooltip.classList.add('visible');
            });

            path.addEventListener('mousemove', (e) => {
                const containerRect = container.getBoundingClientRect();
                const x = e.clientX - containerRect.left;
                const y = e.clientY - containerRect.top;

                tooltip.style.left = `${x}px`;
                tooltip.style.top = `${y}px`;
            });

            path.addEventListener('mouseleave', () => {
                path.style.fill = defaultColor;
                tooltip.classList.remove('visible');
            });

            // Sync with branch tabs for specific regions
            path.addEventListener('click', () => {
                const cityMap = {
                    'PETAC': 'tacna',
                    'PEARE': 'arequipa',
                    'PEMOQ': 'moquegua'
                };

                const cityId = cityMap[id];
                if (cityId) {
                    const tabBtn = document.querySelector(`.tab-btn[data-city="${cityId}"]`);
                    if (tabBtn) tabBtn.click();

                    // Scroll to contact section
                    const contactSection = document.getElementById('contacto');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error loading map:', error);
        container.innerHTML = '<p class="error">No se pudo cargar el mapa interactivo.</p>';
    }
}

// Values Accordion Logic
function initValuesAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));

            // If the clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Terms and Conditions Modal Logic
function initTermsModal() {
    const modal = document.getElementById('terms-modal');
    const openBtn = document.getElementById('open-terms');
    const closeBtn = document.getElementById('close-terms');
    const closeBtnFooter = document.getElementById('close-terms-btn');
    const overlay = document.getElementById('modal-overlay');

    setupModalLogic(modal, openBtn, [closeBtn, closeBtnFooter, overlay]);
}

// Privacy Policy Modal Logic
function initPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    const openBtn = document.getElementById('open-privacy');
    const closeBtn = document.getElementById('close-privacy');
    const closeBtnFooter = document.getElementById('close-privacy-btn');
    const overlay = document.getElementById('privacy-overlay');

    setupModalLogic(modal, openBtn, [closeBtn, closeBtnFooter, overlay]);
}

// Helper to handle modal logic
function setupModalLogic(modal, openBtn, closeElements) {
    if (!modal || !openBtn) return;

    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    openBtn.addEventListener('click', openModal);

    closeElements.forEach(el => {
        if (el) el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Particle Network Animation
function initParticleNetwork() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    // Set canvas size
    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', () => {
        setCanvasSize();
        initParticles();
    });

    // Mouse tracking
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
        }

        draw() {
            ctx.fillStyle = 'rgba(116, 18, 18, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Mouse repulsion
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            // Return to base position
            let dx = this.baseX - this.x;
            let dy = this.baseY - this.y;
            this.x += dx * 0.05;
            this.y += dy * 0.05;

            // Gentle floating movement
            this.baseX += this.vx;
            this.baseY += this.vy;

            // Bounce off edges
            if (this.baseX < 0 || this.baseX > canvas.width) this.vx *= -1;
            if (this.baseY < 0 || this.baseY > canvas.height) this.vy *= -1;
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        let numberOfParticles = (canvas.width * canvas.height) / 15000;
        // Cap particles for performance on ultra-wide/low-zoom screens
        numberOfParticles = Math.min(numberOfParticles, 150);

        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    // Connect particles
    function connectParticles() {
        let maxDistance = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    let opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(116, 18, 18, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        connectParticles();
        requestAnimationFrame(animate);
    }

    animate();
}

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Branch Tabs Logic
function initBranchTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const branchContents = document.querySelectorAll('.branch-content');

    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.getAttribute('data-city');

            // Toggle buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle content
            branchContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === city) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Initialize branch tabs - Logic defined below

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.corp-card, .value-card, .reward-card, .branches-wrapper, .entrepreneur-banner').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');

    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
