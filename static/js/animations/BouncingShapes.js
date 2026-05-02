// ========================================================
// 1. THE INDIVIDUAL SHAPE CLUSTER
// ========================================================
class BouncingShape {
    constructor(parent, startX, colorIndex) {
        this.parent = parent;
        this.wrapper = document.createElement("div");
        this.wrapper.className = "anim-wrapper";

        this.size = Math.random() * 3 + 5;
        this.color = parent.colors[colorIndex % parent.colors.length];
        this.layers = [];

        this.y = 0;
        this.targetY = Math.random() * 200 + 300;
        this.maxSpeed = Math.random() * 20 + 20;
        this.direction = 1;
        this.unshiftRatio = 0; // Stored for rendering

        this.buildLayers(startX);
        parent.container.appendChild(this.wrapper);

        // Setup the Time Bucket
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.animate(this.lastTime);
    }

    buildLayers(startX) {
        let outer = document.createElement("div");
        outer.className = "anim-shape outer-shape";
        outer.style.width = outer.style.height = this.size + "vw";
        outer.style.left = startX + "vw";
        outer.style.bottom = "0px"; // Anchored for Hardware Acceleration!
        outer.style.zIndex = parseInt(this.size);
        outer.style.borderColor = this.color;
        outer.style.borderWidth = "2px";
        outer.style.opacity = "0.15";
        outer.style.borderRadius = this.parent.borderRadius;
        outer.style.willChange = "transform";
        this.wrapper.appendChild(outer);
        this.layers.push({ el: outer, index: 0 });

        for(let i = this.size - 1; i >= 1; i--) {
            let inner = document.createElement("div");
            inner.className = "anim-shape inner-shape";
            inner.style.width = inner.style.height = i + "vw";
            inner.style.left = (startX + (this.size - i) / 2) + "vw";
            inner.style.bottom = "0px"; // Anchored for Hardware Acceleration!
            inner.style.zIndex = parseInt(i);
            inner.style.background = this.color;
            inner.style.opacity = "0.1";
            inner.style.borderRadius = this.parent.borderRadius;
            inner.style.willChange = "transform";
            this.wrapper.appendChild(inner);
            this.layers.push({ el: inner, index: i });
        }
    }

    // THE LOCKED PHYSICS MATH
    updatePhysics() {
        let ratio = this.y / (this.targetY / 2);
        if(ratio > 1) ratio = 2 - ratio;
        if(ratio < 0.02) ratio = 0.02;

        let speed = (this.maxSpeed * ratio);
        this.unshiftRatio = ratio;

        this.y += (speed * this.direction);

        if (this.direction === 1 && this.y >= this.targetY) {
            this.direction = -1;
            this.y = this.targetY;
        } else if (this.direction === -1 && this.y <= 0) {
            this.y = 0;
            this.direction = 1;
            this.targetY = Math.random() * 200 + 300;
            this.maxSpeed = Math.random() * 20 + 20;
        }
    }

    // THE SCREEN PAINTING (Now using Hardware Acceleration!)
    renderDOM() {
        this.layers.forEach((layer) => {
            if (layer.index === 0) {
                // Moving UP requires a negative Y value in translate3d
                layer.el.style.transform = `translate3d(0, -${this.y}px, 0)`;
            } else {
                let offsetModifier = this.direction === 1 ? -1 : 1;
                let trailOffset = (Math.pow(this.unshiftRatio, 1) * layer.index * 40);

                // Combining PX and VW inside a CSS calc function natively on the GPU
                layer.el.style.transform = `translate3d(0, calc(-${this.y + (trailOffset * offsetModifier)}px - ${0.5 * layer.index}vw), 0)`;
            }
        });
    }

    // THE GAME LOOP
    animate(currentTime) {
        if (!this.parent.active) return;

        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (deltaTime > 100) deltaTime = 100;

        this.accumulator += deltaTime;

        while (this.accumulator >= 16.67) {
            this.updatePhysics();
            this.accumulator -= 16.67;
        }

        this.renderDOM();

        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
}

// ========================================================
// 2. THE MAIN CONTROLLER
// ========================================================
class BouncingShapesAnim {
    constructor(container, config) {
        this.container = container;
        this.shapes = [];
        this.active = true;

        this.colors = config.theme === 'dark'
            ? ['#8ab4f8', '#a0c4ff', '#b5d4ff', '#cce4ff']
            : ['#5C6BC0', '#8BC34A', '#F44336', '#FFB74D'];

        this.borderRadius = config.shape === 'circle' ? '50%' : '0%';

        this.init();
    }

    init() {
        let colorCounter = 0;
        for (let startX = Math.random() * -4; startX < 100; startX += Math.random() * 4 + 5) {
            this.shapes.push(new BouncingShape(this, startX, colorCounter));
            colorCounter++;
        }
    }

    destroy() {
        this.active = false;
        this.shapes.forEach(shape => shape.wrapper.remove());
        this.shapes = [];
    }
}