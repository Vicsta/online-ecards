// ========================================================
// 1. THE INDIVIDUAL SPRITE (Heart/Confetti)
// ========================================================
class FloatingSprite {
    constructor(parent) {
        this.parent = parent;
        this.el = document.createElement("div");

        this.x = Math.random() * 100;
        this.y = Math.random() * 100;
        this.size = Math.random() * 1.5 + 1;
        this.speed = Math.random() * 1.5 + 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 4;
        this.sway = Math.random() * 3;

        this.el.innerHTML = parent.emojis[Math.floor(Math.random() * parent.emojis.length)];

        this.el.style.position = "absolute";
        this.el.style.top = "0px";
        this.el.style.left = "0px";
        this.el.style.fontSize = this.size + "rem";
        this.el.style.opacity = Math.random() * 0.5 + 0.3;
        this.el.style.userSelect = "none";
        this.el.style.zIndex = "-1";
        this.el.style.willChange = "transform";

        parent.container.appendChild(this.el);

        // Setup the Time Bucket
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animate(this.lastTime);
    }

    // THE LOCKED PHYSICS MATH
    updatePhysics() {
        if (this.parent.direction === 'up') {
            this.y -= this.speed * 0.4;
            if (this.y < -10) this.y = 110;
        } else {
            this.y += this.speed * 0.4;
            if (this.y > 110) this.y = -10;
        }

        this.x += Math.sin(this.y / 10) * (this.sway * 0.1);
        this.rotation += this.rotationSpeed;
    }

    // THE SCREEN PAINTING
    renderDOM() {
        this.el.style.transform = `translate3d(${this.x}vw, ${this.y}vh, 0) rotate(${this.rotation}deg)`;
    }

    // THE GAME LOOP
    animate(currentTime) {
        if (!this.parent.active) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap giant spikes if the user tabs out
        if (deltaTime > 100) deltaTime = 100;

        // Pour time into the bucket
        this.accumulator += deltaTime;

        // Scoop out exactly one 60fps frame (16.67ms) at a time
        while (this.accumulator >= 16.67) {
            this.updatePhysics();
            this.accumulator -= 16.67;
        }

        // Draw it once the math is caught up
        this.renderDOM();

        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
}

// ========================================================
// 2. THE MAIN CONTROLLER
// ========================================================
class FloatingSpritesAnim {
    constructor(container, config) {
        this.container = container;
        this.sprites = [];
        this.active = true;
        this.direction = config.direction;

        if (config.sprite === 'heart') {
            this.emojis = ['💖', '💕', '💗', '💓', '💘'];
            this.count = 30;
        } else {
            this.emojis = ['✨', '🎉', '🎊', '🎈', '⭐'];
            this.count = 50;
        }

        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.sprites.push(new FloatingSprite(this));
        }
    }

    destroy() {
        this.active = false;
        this.sprites.forEach(sprite => sprite.el.remove());
        this.sprites = [];
    }
}