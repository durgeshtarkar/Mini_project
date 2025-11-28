document.addEventListener('DOMContentLoaded', function() {
    // Canvas animation for stars and meteors
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();

        // Stars array
        const stars = [];
        const numStars = 150;
        
        // Initialize stars
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.3,
                alpha: Math.random() * 0.7 + 0.3,
            });
        }

        // Meteors array
        const meteors = [];
        const maxMeteors = 8;
        const meteorInterval = 2000;
        let lastMeteorTime = 0;

        class Meteor {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = -50;
                this.length = Math.random() * 60 + 20;
                this.width = Math.random() * 2 + 1.5;
                this.speed = Math.random() * 2 + 2;
                this.angle = Math.PI / 4 + ((Math.random() * Math.PI) / 8 - Math.PI / 16);
                this.alpha = 1;
                this.fadeSpeed = 0.006;
                this.color = "white";
            }

            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                this.alpha -= this.fadeSpeed;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x - Math.cos(this.angle) * this.length,
                    this.y - Math.sin(this.angle) * this.length
                );
                ctx.lineWidth = this.width;
                ctx.strokeStyle = this.color;
                ctx.stroke();
                ctx.restore();
            }
        }

        const animate = (currentTime) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            ctx.fillStyle = "white";
            stars.forEach((star) => {
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Add meteors
            if (currentTime - lastMeteorTime > meteorInterval && meteors.length < maxMeteors) {
                meteors.push(new Meteor());
                lastMeteorTime = currentTime;
            }

            // Update and draw meteors
            for (let i = meteors.length - 1; i >= 0; i--) {
                const meteor = meteors[i];
                meteor.update();
                meteor.draw(ctx);

                // Remove meteors that are off-screen or faded
                if (meteor.alpha <= 0 || meteor.y > canvas.height + meteor.length || meteor.x > canvas.width + meteor.length) {
                    meteors.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Start animation
        animationFrameId = requestAnimationFrame(animate);

        // Handle window resize
        window.addEventListener('resize', () => {
            setCanvasSize();
            // Regenerate stars for new canvas size
            stars.length = 0;
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.2 + 0.3,
                    alpha: Math.random() * 0.7 + 0.3,
                });
            }
        });

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            cancelAnimationFrame(animationFrameId);
        });
    }

    // Scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all content sections
    const sections = document.querySelectorAll('.section-container');
    sections.forEach((section) => {
        observer.observe(section);
    });
});

// Navigation functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu if open
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && mobileNav.classList.contains('active')) {
        toggleMobileMenu();
    }
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileNav) {
        mobileNav.classList.toggle('active');
        menuBtn.classList.toggle('active');
    }
}

