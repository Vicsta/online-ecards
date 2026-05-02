const AnimatedBackground = (function() {
    let container;
    let shapes = [];
    let currentTheme = 'dark'; // Changed default to dark to match your site

    // --- THEMES & SHAPES CONFIG (Stripped of background colors!) ---
    const config = {
        themes: {
            light: {
                colors: ['#5C6BC0', '#8BC34A', '#F44336', '#FFB74D'] // Blue, Green, Red, Yellow
            },
            dark: {
                colors: ['#8ab4f8', '#a0c4ff', '#b5d4ff', '#cce4ff'] // Soft blues
            }
        },
        shapeProps: {
            square: { borderRadius: '0%', widthMult: 1, heightMult: 1 },
            circle: { borderRadius: '50%', widthMult: 1, heightMult: 1 },
            tallRect: { borderRadius: '4px', widthMult: 0.6, heightMult: 1.5 },
            wideRect: { borderRadius: '4px', widthMult: 1.5, heightMult: 0.6 }
        },
        activeShape: 'square'
    };

    class BouncingShape {
        constructor(startX, colorIndex) {
            this.wrapper = document.createElement("div");
            this.wrapper.className = "anim-wrapper";

            this.size = Math.random() * 3 + 5; // Base size in VW
            this.colorIndex = colorIndex;
            this.layers = [];

            // Animation State
            this.y = 0; // Current bottom position in PX
            this.targetY = Math.random() * 200 + 300;
            this.maxSpeed = Math.random() * 20 + 20;
            this.direction = 1; // 1 for up, -1 for down

            this.buildLayers(startX);
            container.appendChild(this.wrapper);

            // Start animating this specific shape cluster
            this.animate();
        }

        buildLayers(startX) {
            let colors = config.themes[currentTheme].colors;
            let color = colors[this.colorIndex % colors.length];
            let shapeStyle = config.shapeProps[config.activeShape];

            // Build the outer stroke layer
            let outer = document.createElement("div");
            outer.className = "anim-shape outer-shape";
            outer.style.width = (this.size * shapeStyle.widthMult) + "vw";
            outer.style.height = (this.size * shapeStyle.heightMult) + "vw";
            outer.style.left = startX + "vw";
            outer.style.bottom = "0px";
            outer.style.zIndex = parseInt(this.size);
            outer.style.borderColor = color;
            outer.style.borderWidth = "2px";
            outer.style.opacity = "0.15";
            outer.style.borderRadius = shapeStyle.borderRadius;

            this.wrapper.appendChild(outer);
            this.layers.push({ el: outer, isOuter: true });

            // Build the inner trailing layers
            for(let i = this.size - 1; i >= 1; i--) {
                let inner = document.createElement("div");
                inner.className = "anim-shape inner-shape";

                let innerW = (i * shapeStyle.widthMult);
                let innerH = (i * shapeStyle.heightMult);

                inner.style.width = innerW + "vw";
                inner.style.height = innerH + "vw";
                inner.style.left = (startX + ((this.size * shapeStyle.widthMult) - innerW) / 2) + "vw";
                inner.style.zIndex = parseInt(i);
                inner.style.background = color;
                inner.style.opacity = "0.1";
                inner.style.borderRadius = shapeStyle.borderRadius;

                this.wrapper.appendChild(inner);
                this.layers.push({ el: inner, isOuter: false, index: i, originalSize: i });
            }
        }

        updateColors() {
            let colors = config.themes[currentTheme].colors;
            let color = colors[this.colorIndex % colors.length];
            this.layers.forEach(layer => {
                if (layer.isOuter) layer.el.style.borderColor = color;
                else layer.el.style.background = color;
            });
        }

        updateShape() {
            let shapeStyle = config.shapeProps[config.activeShape];
            this.layers.forEach(layer => {
                layer.el.style.borderRadius = shapeStyle.borderRadius;
                // Note: dynamically changing width/height mid-animation is complex due to centering.
                // For now, this just updates the border-radius smoothly.
            });
        }

        animate() {
            // Your original easing math
            let ratio = this.y / (this.targetY / 2);
            if(ratio > 1) ratio = 2 - ratio;
            if(ratio < 0.02) ratio = 0.02;

            let speed = this.maxSpeed * ratio;
            let unshiftRatio = ratio;

            // Move Y
            this.y += (speed * this.direction);

            // Check boundaries
            if (this.direction === 1 && this.y >= this.targetY) {
                this.direction = -1; // Fall down
            } else if (this.direction === -1 && this.y <= 0) {
                this.y = 0;
                this.direction = 1; // Jump up
                this.targetY = Math.random() * 200 + 300; // Pick new height
                this.maxSpeed = Math.random() * 20 + 20;  // Pick new speed
            }

            // Apply to DOM
            this.layers.forEach((layer, arrayIndex) => {
                if (arrayIndex === 0) {
                    // Lead element
                    layer.el.style.bottom = this.y + "px";
                } else {
                    // Trailing elements (using your original offset math)
                    let offsetModifier = this.direction === 1 ? -1 : 1;
                    let trailOffset = (Math.pow(unshiftRatio, 1) * layer.index * 40);
                    let baseVwOffset = (0.5 * layer.index);

                    layer.el.style.bottom = `calc(${this.y + (trailOffset * offsetModifier)}px + ${baseVwOffset}vw)`;
                }
            });

            requestAnimationFrame(() => this.animate());
        }
    }

    return {
            init: function() {
                container = document.createElement("div");
                container.id = "animated-bg";
                document.body.prepend(container);

                // REMOVED the container.style.backgroundColor line from here!

                let colorCounter = 0;
                for(let startX = Math.random() * -4; startX < 100; startX += Math.random() * 4 + 5) {
                    shapes.push(new BouncingShape(startX, colorCounter));
                    colorCounter++;
                }
            },

            setTheme: function(themeName) {
                if (config.themes[themeName]) {
                    currentTheme = themeName;
                    // REMOVED the container.style.backgroundColor line from here!
                    shapes.forEach(shape => shape.updateColors());
                }
            },

            setShape: function(shapeName) {
                if (config.shapeProps[shapeName]) {
                    config.activeShape = shapeName;
                    shapes.forEach(shape => shape.updateShape());
                }
            }
        };
    })();
})();

// Auto-start on load
window.addEventListener('load', () => {
    AnimatedBackground.init();
});