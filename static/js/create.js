console.log("in create.js");

let createCard = null; // Stores the card instance
// Deep copy of cardV1 for modifications (assumes cardV1 is defined globally in another script)
let cardData = JSON.parse(JSON.stringify(cardV1));

function runCreatePage() {
    console.log("Running create page");

    replaceElementWithCard(document.getElementById("createCard"), "templates/cards/cardV1.html").then(
        card => {
            createCard = card;
            updateCard(); // Apply current `cardData` values immediately
        }
    );

    // --- Tab Switching Logic ---
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

    // --- Live Preview Updater ---
    function updateCard() {
        if (!createCard) return;
        applyCustomizationToCardV1(cardData, createCard);
    }

    // --- The Master Binding Dictionary ---
    function setupInputBindings() {
        const bindings = {
            // General Settings
            "fontSizeInput": "fontSize",
            "fontStyleInput": "font",
            "paddingInput": "padding",

            // Full Page Backgrounds
            "bgFront": "front",
            "bgPage1": "page1",
            "bgPage2": "page2",
            "bgBack": "back",

            // Front Page (Page 1)
            "text1Top": "text1",
            "text1Middle": "text2",
            "text1Bottom": "text3",
            "bg1Top": "s1",
            "bg1Middle": "s2",
            "bg1Bottom": "s3",

            // Inside Left (Page 2)
            "text2Top": "text4",
            "text2Middle": "text5",
            "text2Bottom": "text6",
            "bg2Top": "s4",
            "bg2Middle": "s5",
            "bg2Bottom": "s6",

            // Inside Right (Page 3)
            "text3Top": "text7",
            "text3Middle": "text8",
            "text3Bottom": "text9",
            "bg3Top": "s7",
            "bg3Middle": "s8",
            "bg3Bottom": "s9",

            // Back Page (Page 4)
            "text4Top": "text10",
            "text4Middle": "text11",
            "text4Bottom": "text12",
            "bg4Top": "s10",
            "bg4Middle": "s11",
            "bg4Bottom": "s12",
        };

        Object.keys(bindings).forEach(inputId => {
            const key = bindings[inputId];
            const input = document.getElementById(inputId);

            if (input) {
                // Remove 'px' if it exists just for setting the initial input value
                let initialValue = cardData[key] || "";
                if (typeof initialValue === "string" && initialValue.endsWith("px")) {
                    initialValue = initialValue.replace("px", "");
                }
                input.value = initialValue;

                // Update `cardData` and refresh the card when input changes
                input.addEventListener("input", (event) => {
                    let val = event.target.value;

                    // Crucial Fix: CSS needs 'px' to apply properly
                    if (inputId === "fontSizeInput" || inputId === "paddingInput") {
                        if (val !== "") val += "px";
                    }

                    cardData[key] = val;
                    updateCard();
                });
            }
        });
    }

    // --- Export Link Logic ---
    document.getElementById("exportBtn").addEventListener("click", () => {
        // Encode the current state of the card
        let compressedData = encodeCardJSON(cardData);

        // Build the final URL (Ensure your encode function is accessible)
        let finalUrl = "https://online-ecards.com/view?c=" + compressedData;

        // Display the result
        let resultDiv = document.getElementById("exportResult");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `<a href="${finalUrl}" target="_blank" style="color: blue; text-decoration: underline;">Test Link</a><br><br><small>Link copied to clipboard!</small>`;

        // Copy to clipboard
        navigator.clipboard.writeText(finalUrl).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // Initialize Bindings and activate the first tab
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