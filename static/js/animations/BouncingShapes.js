class BouncingShapesAnim {
    constructor(container, config) {
        this.container = container;
        this.shapes = [];
        this.active = true; // Kill switch for the animation loop

        this.colors = config.theme === 'dark'
            ? ['#8ab4f8', '#a0c4ff', '#b5d4ff', '#cce4ff']
            : ['#5C6BC0', '#8BC34A', '#F44336', '#FFB74D'];

        this.borderRadius = config.shape === 'circle' ? '50%' : '0%';

        this.init();
    }

    init() {
        let colorCounter = 0;
        for (let startX = Math.random() * -4; startX < 100; startX += Math.random() * 4 + 5) {
            this.shapes.push(new this.ShapeInstance(this, startX, colorCounter));
            colorCounter++;
        }
    }

    destroy() {
        this.active = false; // Stops the requestAnimationFrame loop
        this.shapes = [];
    }

    // --- The individual shape logic (nested class for scope) ---
    ShapeInstance = class {
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

            this.buildLayers(startX);
            parent.container.appendChild(this.wrapper);
            this.animate();
        }

        buildLayers(startX) {
            // Build Outer
            let outer = document.createElement("div");
            outer.className = "anim-shape outer-shape";
            outer.style.width = outer.style.height = this.size + "vw";
            outer.style.left = startX + "vw";
            outer.style.bottom = "0px";
            outer.style.zIndex = parseInt(this.size);
            outer.style.borderColor = this.color;
            outer.style.borderWidth = "2px";
            outer.style.opacity = "0.15";
            outer.style.borderRadius = this.parent.borderRadius;
            this.wrapper.appendChild(outer);
            this.layers.push({ el: outer, index: 0 });

            // Build Inner Trails
            for(let i = this.size - 1; i >= 1; i--) {
                let inner = document.createElement("div");
                inner.className = "anim-shape inner-shape";
                inner.style.width = inner.style.height = i + "vw";
                inner.style.left = (startX + (this.size - i) / 2) + "vw";
                inner.style.zIndex = parseInt(i);
                inner.style.background = this.color;
                inner.style.opacity = "0.1";
                inner.style.borderRadius = this.parent.borderRadius;
                this.wrapper.appendChild(inner);
                this.layers.push({ el: inner, index: i });
            }
        }

        animate() {
            if (!this.parent.active) return; // Stop animating if theme changed

            let ratio = this.y / (this.targetY / 2);
            if(ratio > 1) ratio = 2 - ratio;
            if(ratio < 0.02) ratio = 0.02;

            let speed = this.maxSpeed * ratio;
            let unshiftRatio = ratio;

            this.y += (speed * this.direction);

            if (this.direction === 1 && this.y >= this.targetY) {
                this.direction = -1;
            } else if (this.direction === -1 && this.y <= 0) {
                this.y = 0;
                this.direction = 1;
                this.targetY = Math.random() * 200 + 300;
                this.maxSpeed = Math.random() * 20 + 20;
            }

            this.layers.forEach((layer) => {
                if (layer.index === 0) {
                    layer.el.style.bottom = this.y + "px";
                } else {
                    let offsetModifier = this.direction === 1 ? -1 : 1;
                    let trailOffset = (Math.pow(unshiftRatio, 1) * layer.index * 40);
                    layer.el.style.bottom = `calc(${this.y + (trailOffset * offsetModifier)}px + ${0.5 * layer.index}vw)`;
                }
            });

            requestAnimationFrame(() => this.animate());
        }
    }
}