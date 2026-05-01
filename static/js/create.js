let createCard = null;
let cardData = null;

function runCreatePage() {
    let container = document.getElementById("createCard");
    let menuArea = document.getElementById("dynamicMenuArea");

    if (!container || !menuArea) return console.error("Create DOM elements missing!");

    // Default to 'v1' if not provided in URL
    let params = new URLSearchParams(window.location.search);
    let selectedVersion = params.get("v") || "v1";

    let template = CardRegistry[selectedVersion];
    if (!template) return console.error("Template not found in Registry!");

    cardData = template.defaultData();

    // Fetch both the Menu and the Card HTML simultaneously
Promise.all([
        fetch(template.menuHtml).then(res => res.text()),
        fetch(template.cardHtml).then(res => res.text())
    ]).then(([menuHtml, cardHtml]) => {
        menuArea.innerHTML = menuHtml;
        container.innerHTML = cardHtml;

        // CHANGED THIS LINE:
        createCard = template.initCard(container);

        template.applyStyles(cardData, createCard);
        setupDynamicBindings(template.bindings(), template);
        setupTabs(template);
    });

    // --- Export Link Logic ---
    document.getElementById("exportBtn").addEventListener("click", () => {
        let compressedData = encodeCardJSON(cardData);
        let baseUrl = window.location.origin;
        let clipboardUrl = baseUrl + "/view?c=" + compressedData;
        let testUrl = clipboardUrl;

        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            let rootPath = window.location.pathname.replace("/create", "");
            if (rootPath === "") rootPath = "/";
            testUrl = baseUrl + rootPath + "?c=" + compressedData;
        }

        let resultDiv = document.getElementById("exportResult");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `<a href="${testUrl}" target="_blank" style="color: blue; text-decoration: underline;">Click to Test Link</a><br><br><small>Link copied to clipboard!</small>`;
        navigator.clipboard.writeText(clipboardUrl).catch(err => console.error(err));
    });
}

function setupDynamicBindings(bindingsMap, template) {
    Object.keys(bindingsMap).forEach(inputId => {
        let key = bindingsMap[inputId];
        let input = document.getElementById(inputId);

        if (input) {
            let initialValue = cardData[key] || "";
            if (typeof initialValue === "string" && initialValue.endsWith("px")) {
                initialValue = initialValue.replace("px", "");
            }
            input.value = initialValue;

            input.addEventListener("input", (event) => {
                let val = event.target.value;
                if ((inputId.toLowerCase().includes("size") || inputId.toLowerCase().includes("padding")) && val !== "") {
                    val += "px";
                }
                cardData[key] = val;
                template.applyStyles(cardData, createCard);
            });
        }
    });
}

function setupTabs(template) {
    const tabs = document.querySelectorAll(".menuPageTab");
    const menus = document.querySelectorAll(".leftMenu");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            menus.forEach(menu => menu.classList.add("hidden"));
            menus[index].classList.remove("hidden");
            tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
            tabs[index].classList.add("menuPageTabSelected");

            // Use the template's custom flipping logic
            if (createCard && template.onTabSwitch) {
                template.onTabSwitch(index, createCard);
            }
        });
    });

    if(tabs.length > 0) tabs[0].classList.add("menuPageTabSelected");
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    runCreatePage();
} else {
    document.addEventListener("DOMContentLoaded", runCreatePage);
}