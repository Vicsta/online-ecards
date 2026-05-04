// ========================================================
// 1. THE INDIVIDUAL SPRITE (GPU-Accelerated DOM)
// ========================================================
class FloatingSprite {
    constructor(parent) {
        this.parent = parent;
        this.el = document.createElement("div");

        // Randomize starting positions using vw/vh so it auto-scales to the screen
        this.x = Math.random() * 100;
        this.y = Math.random() * 120 - 10; // Start randomly across the whole screen height

        this.size = Math.random() * 1.5 + 1.2; // rem size
        this.speed = Math.random() * 1.5 + 0.5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.sway = Math.random() * 3;

        // Grab a random emoji from the theme config!
        this.el.innerHTML = parent.emojis[Math.floor(Math.random() * parent.emojis.length)];

        // GPU-Accelerated CSS Setup
        this.el.style.position = "absolute";
        this.el.style.top = "0px";
        this.el.style.left = "0px";
        this.el.style.fontSize = this.size + "rem";
        this.el.style.opacity = Math.random() * 0.5 + 0.4;
        this.el.style.userSelect = "none";
        this.el.style.pointerEvents = "none"; // Let clicks pass through to the site
        this.el.style.zIndex = "-1";
        this.el.style.willChange = "transform"; // Tells the GPU to take over

        parent.container.appendChild(this.el);

        // Setup the Time Bucket
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animate(this.lastTime);
    }

    // THE LOCKED PHYSICS MATH
    updatePhysics() {
        if (this.parent.direction === 'up') {
            this.y -= this.speed * 0.15;
            if (this.y < -15) this.y = 115; // Wrap to bottom
        } else {
            this.y += this.speed * 0.15;
            if (this.y > 115) this.y = -15; // Wrap to top
        }

        // Horizontal sway
        this.x += Math.sin(this.y / 10) * (this.sway * 0.05);

        // Horizontal wrap around
        if (this.x < -5) this.x = 105;
        if (this.x > 105) this.x = -5;

        this.rotation += this.rotationSpeed;
    }

    // THE SCREEN PAINTING (Pushed to the GPU)
    renderDOM() {
        this.el.style.transform = `translate3d(${this.x}vw, ${this.y}vh, 0) rotate(${this.rotation}deg)`;
    }

    // THE GAME LOOP (Your original smooth math)
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
        this.config = config || {};
        this.sprites = [];
        this.active = true;

        // Read the custom emoji array and direction from the AnimController
        this.emojis = this.config.emojis || ['✨'];
        this.direction = this.config.direction || 'up';

        // Spawn 35 of them (a good balance of full screen without clutter)
        this.count = 35;

        // Fix container stacking so it stays in the background
        this.container.style.position = "fixed";
        this.container.style.top = "0";
        this.container.style.left = "0";
        this.container.style.width = "100vw";
        this.container.style.height = "100vh";
        this.container.style.pointerEvents = "none";
        this.container.style.zIndex = "-1";
        this.container.style.overflow = "hidden";

        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.sprites.push(new FloatingSprite(this));
        }
    }

    destroy() {
        this.active = false; // Kills the animation loops
        this.sprites.forEach(sprite => sprite.el.remove()); // Wipes the DOM elements
        this.sprites = [];
    }
}