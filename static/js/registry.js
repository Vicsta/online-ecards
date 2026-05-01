const CardRegistry = {
    "v1": {
        // --- META DATA FOR THE MENU ---
        id: "v1",
        name: "Classic Greeting Card",
        description: "A traditional card that opens to reveal left and right inner pages.",
        stats: "4 Pages • 3 Sections per page",
        previewImg: "", // Add a path to a real image later, or leave empty to use the 📄 emoji
        tags: ["3D Fold", "Classic"],

        // --- CORE HTML ---
        cardHtml: "templates/cards/v1_card.html",
        menuHtml: "templates/cards/v1_menu.html",

        // --- INITIALIZATION ---
        // CRITICAL: The return statement here is what fixes your "undefined scene" crash!
        initCard: (container) => {
            const scene = container.querySelector(".scene");
            return scene ? new CardV1(scene) : null;
        },

        // --- DATA & STYLING ---
        // These rely on variables and functions defined in your cardV1.js file
        defaultData: () => JSON.parse(JSON.stringify(cardV1_defaults)),
        applyStyles: (json, cardObj) => applyCustomizationToCardV1(json, cardObj),
        bindings: () => cardV1_bindings,

        // --- CUSTOM UI BEHAVIOR ---
        // How this specific template reacts when the user clicks the left menu tabs
        onTabSwitch: (index, card) => {
            if (index === 1) {
                card.state = 0; // Front tab
            } else if (index === 2 || index === 3) {
                card.state = 1; // Inside L or Inside R tabs
            } else if (index === 4) {
                card.state = 2; // Back tab
            }
            card.updateCardState();
        }
    }
};