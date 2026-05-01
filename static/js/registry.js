const CardRegistry = {
    "v1": {
        // --- NEW META DATA FOR THE MENU ---
        id: "v1",
        name: "Classic Greeting Card",
        description: "A traditional card that opens to reveal left and right inner pages.",
        stats: "4 Pages • 3 Sections per page",
        previewImg: "static/images/preview-v1.png", // Or use an emoji/icon for now
        tags: ["3D Fold", "Classic"],

        // --- EXISTING LOGIC ---
        cardHtml: "templates/cards/v1_card.html",
        menuHtml: "templates/cards/v1_menu.html",
        initCard: (container) => { /* ... */ },
        defaultData: () => JSON.parse(JSON.stringify(cardV1_defaults)),
        applyStyles: (json, cardObj) => applyCustomizationToCardV1(json, cardObj),
        bindings: () => cardV1_bindings,
        onTabSwitch: (index, card) => { /* ... */ }
    },
    // "v2": { ... future postcard template ... }
};