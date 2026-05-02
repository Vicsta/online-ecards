class FloatingSpritesAnim {
    constructor(container, config) {
        this.container = container;
        this.sprites = [];
        this.active = true;
        this.direction = config.direction; // 'up' or 'down'

        // Define what emojis and colors we use based on the theme
        if (config.sprite === 'heart') {
            this.emojis = ['💖', '💕', '💗', '💓', '💘'];
            this.count = 30; // Fewer hearts
        } else if (config.sprite === 'confetti') {
            this.emojis = ['✨', '🎉', '🎊', '🎈', '⭐'];
            this.count = 50; // More confetti
        }

        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.sprites.push(new this.SpriteInstance(this));
        }
    }

    destroy() {
        this.active = false;
        this.sprites = [];
    }

    SpriteInstance = class {
        constructor(parent) {
            this.parent = parent;
            this.el = document.createElement("div");

            // Randomize starting properties
            this.x = Math.random() * 100; // 0 to 100vw
            this.y = Math.random() * 100; // 0 to 100vh
            this.size = Math.random() * 1.5 + 1; // 1rem to 2.5rem
            this.speed = Math.random() * 1.5 + 0.5; // 0.5 to 2
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 4; // spin left or right
            this.sway = Math.random() * 3; // horizontal swaying

            // Set emoji
            this.el.innerHTML = parent.emojis[Math.floor(Math.random() * parent.emojis.length)];

            // Base styling
            this.el.style.position = "absolute";
            this.el.style.left = this.x + "vw";
            this.el.style.fontSize = this.size + "rem";
            this.el.style.opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
            this.el.style.userSelect = "none";
            this.el.style.zIndex = "-1";

            parent.container.appendChild(this.el);
            this.animate();
        }

        animate() {
            if (!this.parent.active) return;

            // Move Vertical
            if (this.parent.direction === 'up') {
                this.y -= this.speed * 0.2; // Move up (-vh)
                if (this.y < -10) this.y = 110; // Reset to bottom
            } else {
                this.y += this.speed * 0.2; // Move down (+vh)
                if (this.y > 110) this.y = -10; // Reset to top
            }

            // Move Horizontal (Swaying in the wind)
            this.x += Math.sin(this.y / 10) * (this.sway * 0.05);

            // Spin
            this.rotation += this.rotationSpeed;

            // Apply to DOM
            this.el.style.top = this.y + "vh";
            this.el.style.left = this.x + "vw";
            this.el.style.transform = `rotate(${this.rotation}deg)`;

            requestAnimationFrame(() => this.animate());
        }
    }
}