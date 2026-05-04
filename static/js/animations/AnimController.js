const AnimController = (function() {
    let currentAnimation = null;
    let container = null;

    // Mapping Themes to highly specific emoji arrays and directions!
    const themeMap = {
        'dark':       { type: 'BouncingShapes',  config: { theme: 'dark', shape: 'square' } },

        // STANDARD OCCASIONS
        'birthday':   { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🎉', '🎂', '🎈'], direction: 'down' } },
        'valentine':  { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['💖', '💘', '🌹'], direction: 'up' } },
        'thankyou':   { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🌻', '🙏', '✨'], direction: 'down' } },
        'goodluck':   { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🍀', '🤞', '🐞'], direction: 'up' } },
        'getwell':    { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🍵', '🩹', '💙', '💊'], direction: 'up' } },
        'graduation': { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🎓', '📜', '⭐'], direction: 'down' } },

        // HOLIDAYS
        'halloween':  { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🎃', '👻', '🦇'], direction: 'up' } },
        'christmas':  { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🎄', '❄️', '⛄'], direction: 'down' } },
        'easter':     { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🐰', '🥚', '🌷'], direction: 'up' } },
        'newyear':    { type: 'FloatingSprites', config: { sprite: 'emoji', emojis: ['🎆', '🥂', '🎇'], direction: 'down' } }
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

            // Factory Pattern: Launch the correct animation class and pass the emoji config!
            if (setup.type === 'BouncingShapes') {
                currentAnimation = new BouncingShapesAnim(container, setup.config);
            } else if (setup.type === 'FloatingSprites') {
                currentAnimation = new FloatingSpritesAnim(container, setup.config);
            }
        }
    };
})();