const CardRegistry = {
    "v1": {
        name: "Standard 3-Section Card",
        cardHtml: "templates/cards/v1_card.html",
        menuHtml: "templates/cards/v1_menu.html",

        // Tells the system to use the CardV1 class!
        initCard: (container) => {
            const scene = container.querySelector(".scene");
            return scene ? new CardV1(scene) : null;
        },

        defaultData: () => JSON.parse(JSON.stringify(cardV1_defaults)),
        applyStyles: (json, cardObj) => applyCustomizationToCardV1(json, cardObj),
        bindings: () => cardV1_bindings,

        onTabSwitch: (index, card) => {
            if (index === 1) card.state = 0;
            else if (index === 2 || index === 3) card.state = 1;
            else if (index === 4) card.state = 2;
            card.updateCardState();
        }
    }
};