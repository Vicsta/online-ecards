const AnimController = (function() {
    let currentAnimation = null;
    let container = null;

    // The mapping of Themes to their specific animations
    const themeMap = {
        'dark': { type: 'BouncingShapes', config: { theme: 'dark', shape: 'square' } },
        'birthday': { type: 'FloatingSprites', config: { sprite: 'confetti', direction: 'down' } },
        'valentine': { type: 'FloatingSprites', config: { sprite: 'heart', direction: 'up' } }
    };

    function clearCurrentAnimation() {
        if (currentAnimation && typeof currentAnimation.destroy === 'function') {
            currentAnimation.destroy();
        }
        if (container) {
            container.innerHTML = ''; // Wipe the canvas clean
        }
    }

    return {
        init: function() {
            // Create the master background container once
            if (!document.getElementById("animated-bg")) {
                container = document.createElement("div");
                container.id = "animated-bg";
                document.body.prepend(container);
            } else {
                container = document.getElementById("animated-bg");
            }
        },

        setTheme: function(themeName) {
            clearCurrentAnimation();

            const setup = themeMap[themeName] || themeMap['dark']; // Fallback to dark

            // Factory Pattern: Launch the correct animation class
            if (setup.type === 'BouncingShapes') {
                currentAnimation = new BouncingShapesAnim(container, setup.config);
            } else if (setup.type === 'FloatingSprites') {
                currentAnimation = new FloatingSpritesAnim(container, setup.config);
            }
        }
    };
})();