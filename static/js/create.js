console.log("in create.js");

let createCard = null; // Stores the card instance
let cardData = JSON.parse(JSON.stringify(cardV1)); // Deep copy of cardV1 for modifications

function runCreatePage() {
    console.log("Running create page");

    replaceElementWithCard(document.getElementById("createCard"), "templates/cards/cardV1.html").then(
        card => {
            createCard = card;
            updateCard(); // Apply current `cardData` values
        }
    );

    const tabs = document.querySelectorAll(".menuPageTab");
    const menus = document.querySelectorAll(".leftMenu");

    function switchMenu(index) {
        menus.forEach(menu => menu.classList.add("hidden")); // Hide all menus
        menus[index].classList.remove("hidden"); // Show selected menu

        tabs.forEach(tab => tab.classList.remove("menuPageTabSelected")); // Remove highlight
        tabs[index].classList.add("menuPageTabSelected"); // Highlight active tab
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => switchMenu(index));
    });

    function updateCard() {
        if (!createCard) return;
        applyCustomizationToCardV1(cardData, createCard);
    }

    function setupInputBindings() {
        const bindings = {
            "fontSizeInput": "fontSize",
            "fontStyleInput": "font",
            "paddingInput": "padding",

            // Page 1
            "text1Top": "text1",
            "text1Middle": "text2",
            "text1Bottom": "text3",

            // Page 2
            "text2Top": "text4",
            "text2Middle": "text5",
            "text2Bottom": "text6",

            // Page 3
            "text3Top": "text7",
            "text3Middle": "text8",
            "text3Bottom": "text9",

            // Page 4
            "text4Top": "text10",
            "text4Middle": "text11",
            "text4Bottom": "text12",
        };

        Object.keys(bindings).forEach(inputId => {
            const key = bindings[inputId];
            const input = document.getElementById(inputId);

            if (input) {
                // Set input value from `cardData`
                input.value = cardData[key] || "";

                // Update `cardData` and refresh the card when input changes
                input.addEventListener("input", (event) => {
                    cardData[key] = event.target.value;
                    updateCard();
                });
            }
        });
    }

    setupInputBindings();

    tabs[0].classList.add("menuPageTabSelected");
}

// ✅ Ensure this runs when the DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runCreatePage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runCreatePage);
}
