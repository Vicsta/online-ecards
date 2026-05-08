let createCard = null;
let cardData = null;
let galleryListenersAttached = false; // Prevents duplicate listeners

// 1. The Entry Point
function initCreateFlow() {
    let params = new URLSearchParams(window.location.search);
    let selectedTheme = params.get("theme");

    let backBtn = document.getElementById("backToGridBtn");
    if (backBtn) {
        backBtn.onclick = () => {
            history.replaceState(null, "", window.location.pathname);
            document.body.setAttribute("data-editor-active", "false");
            showGallery();
        };
    }

    setupGalleryLogic();

    if (selectedTheme) {
        showEditor("v2", selectedTheme);
    } else {
        document.body.setAttribute("data-editor-active", "false");
        showGallery();
    }
}

// 2. Setup the Search and Collapsible Logic (BULLETPROOF EVENT DELEGATION)
function setupGalleryLogic() {
    // Only attach these document-level listeners once!
    if (galleryListenersAttached) return;

    // A. Real-time Search Filter
    document.addEventListener("input", (e) => {
        // Only run this logic if the user is typing in our specific search box
        if (e.target.id !== "gallerySearchInput") return;

        let term = e.target.value.toLowerCase().trim();
        const categories = document.querySelectorAll(".searchable-category");

        categories.forEach(category => {
            let cards = category.querySelectorAll(".gallery-card");
            let visibleCards = 0;

            cards.forEach(card => {
                let title = card.querySelector(".template-title").innerText.toLowerCase();
                let tags = card.getAttribute("data-tags") || "";

                if (title.includes(term) || tags.includes(term)) {
                    card.style.display = "block";
                    visibleCards++;
                } else {
                    card.style.display = "none";
                }
            });

            // Hide the whole category if no cards match
            if (visibleCards === 0) {
                category.style.display = "none";
            } else {
                category.style.display = "block";
            }
        });
    });

    // B. Collapsible Headers
    document.addEventListener("click", (e) => {
        // Look for the closest collapsible title to the user's click
        let titleEl = e.target.closest(".collapsible-title");
        if (!titleEl) return;

        let categoryDiv = titleEl.closest(".gallery-category");
        if (!categoryDiv) return;

        let grid = categoryDiv.querySelector(".category-grid");
        let icon = titleEl.querySelector(".collapse-icon");

        if (!grid) return;

        // getComputedStyle guarantees we know the true visual state of the grid
        let isHidden = window.getComputedStyle(grid).display === "none";

        if (isHidden) {
            grid.style.display = "grid";
            if(icon) icon.style.transform = "rotate(0deg)";
        } else {
            grid.style.display = "none";
            if(icon) icon.style.transform = "rotate(-90deg)";
        }
    });

    galleryListenersAttached = true;
}

function showGallery() {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");

    if(chooserDiv) chooserDiv.style.display = "block";
    if(editorDiv) editorDiv.style.display = "none";
}

// 3. Switch to Editor State
function showEditor(versionId, themeName) {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");

    if(chooserDiv) chooserDiv.style.display = "none";
    if(editorDiv) editorDiv.style.display = "flex";

    let viewContainer = document.getElementById("cardViewContainer");
    if (viewContainer) {
        viewContainer.innerHTML = "";
    }

    document.body.setAttribute("data-editor-active", "true");
    runCreatePage(versionId, themeName);
}

// 4. Editor Logic & Fetching
function runCreatePage(selectedVersion, themeName) {
    let container = document.getElementById("createCard");
    let menuArea = document.getElementById("dynamicMenuArea");

    if (!container || !menuArea) return console.error("Create DOM missing!");

    let template = CardRegistry[selectedVersion];
    if (!template) return console.error("Template not found!");

    cardData = template.defaultData();

    // --- CARD CONTENT RECIPES ---
    const cardRecipes = {
        "birthday":  { bg: "#e6f2ff", color: "#004080", font: "Georgia", title: "Happy Birthday!" },
        "valentine": { bg: "#fff0f5", color: "#cc0000", font: "Times New Roman", title: "Be Mine" },
        "halloween": { bg: "#1a0b2e", color: "#ff9900", font: "Verdana", title: "Happy Halloween!" },
    };

    if (themeName && themeName !== "custom") {
        let globalDropdown = document.getElementById("globalThemeSelector");
        let mobileDropdown = document.getElementById("mobileThemeSelector");

        if (globalDropdown && Array.from(globalDropdown.options).some(opt => opt.value === themeName)) {
             globalDropdown.value = themeName;
             globalDropdown.dispatchEvent(new Event('change'));
             if(mobileDropdown) mobileDropdown.value = themeName;
        }

        if (cardRecipes[themeName]) {
            let recipe = cardRecipes[themeName];
            cardData.fontColor = recipe.color;
            cardData.fontStyle = recipe.font;

            cardData.faces.forEach((face, fIndex) => {
                face.bg = recipe.bg;
                face.rowData.forEach((row, rIndex) => {
                    row.bg = "transparent";
                    row.color = recipe.color;
                    row.textBg = "transparent";

                    if (fIndex === 0 && rIndex === 0) {
                        row.text = recipe.title;
                    } else {
                        row.text = "";
                    }
                });
            });
        }
    }

    let basePath = window.location.origin;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        basePath += "/online-ecards/online-e-card/";
    } else {
        basePath += "/";
    }

    let cleanMenuPath = template.menuHtml.startsWith('/') ? template.menuHtml.substring(1) : template.menuHtml;
    let cleanCardPath = template.cardHtml.startsWith('/') ? template.cardHtml.substring(1) : template.cardHtml;

    Promise.all([
        fetch(basePath + cleanMenuPath).then(res => res.text()),
        fetch(basePath + cleanCardPath).then(res => res.text())
    ]).then(([menuHtml, cardHtml]) => {
        menuArea.innerHTML = menuHtml;
        container.innerHTML = cardHtml;

        createCard = template.initCard(container);
        if (template.onLoad) template.onLoad(template, cardData, createCard);

        template.applyStyles(cardData, createCard);
        setupDynamicBindings(template.bindings(), template);
        setupTabs(template);

    }).catch(err => console.error(err));

    document.getElementById("exportBtn").onclick = () => {
        let globalDropdown = document.getElementById("globalThemeSelector");
        if (globalDropdown) cardData.siteTheme = globalDropdown.value;

        let compressedData = encodeCardJSON(cardData);
        let clipboardUrl = basePath + "view?c=" + compressedData;

        navigator.clipboard.writeText(clipboardUrl).catch(err => console.error(err));

        const modal = document.getElementById("successModalOverlay");
        const stateVictory = document.getElementById("sm-state-victory");
        const stateAd = document.getElementById("sm-state-ad");
        const stateReward = document.getElementById("sm-state-reward");
        const previewBtn = document.getElementById("sm-preview-btn");

        if (stateVictory) stateVictory.style.display = "block";
        if (stateAd) stateAd.style.display = "none";
        if (stateReward) stateReward.style.display = "none";
        if (previewBtn) previewBtn.href = clipboardUrl;

        if (modal) modal.style.display = "flex";
        if (typeof window.fireConfetti === "function") window.fireConfetti(100);
    };
}

function setupDynamicBindings(bindingsMap, template) {
    Object.keys(bindingsMap).forEach(inputId => {
        let key = bindingsMap[inputId];
        let input = document.getElementById(inputId);
        if (input) {
            let initialValue = cardData[key] || "";
            if (typeof initialValue === "string" && initialValue.endsWith("px")) initialValue = initialValue.replace("px", "");
            input.value = initialValue;

            input.addEventListener("input", (event) => {
                let val = event.target.value;
                if ((inputId.toLowerCase().includes("size") || inputId.toLowerCase().includes("padding")) && val !== "") val += "px";
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
            if(menus[index]) menus[index].classList.remove("hidden");

            tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
            if(tabs[index]) tabs[index].classList.add("menuPageTabSelected");

            if (createCard && template.onTabSwitch) template.onTabSwitch(index, createCard);
        });
    });

    if(tabs.length > 0) tabs[0].classList.add("menuPageTabSelected");
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    initCreateFlow();
} else {
    document.addEventListener("DOMContentLoaded", initCreateFlow);
}