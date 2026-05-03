let createCard = null;
let cardData = null;

// 1. The New Entry Point
function initCreateFlow() {
    let params = new URLSearchParams(window.location.search);
    let selectedVersion = params.get("v");

    let backBtn = document.getElementById("backToGridBtn");
    if (backBtn) {
        backBtn.onclick = () => {
            console.log("Action: Back to Grid (Activating Left Banner)");
            history.replaceState(null, "", window.location.pathname);
            document.body.setAttribute("data-editor-active", "false");
            renderTemplateGrid();
        };
    }

    if (selectedVersion && CardRegistry[selectedVersion]) {
        showEditor(selectedVersion);
    } else {
        // Ensure Left Ad is ON if we start at the grid
        document.body.setAttribute("data-editor-active", "false");
        renderTemplateGrid();
    }
}

// 3. Switch to Editor State
function showEditor(versionId) {
    console.log("Action: Opening Editor for:", versionId, "(Hiding Left Banner)");
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");

    if(chooserDiv) chooserDiv.style.display = "none";
    if(editorDiv) editorDiv.style.display = "flex";

    // Turn Left Ad OFF
    document.body.setAttribute("data-editor-active", "true");

    history.replaceState(null, "", "?v=" + versionId);
    runCreatePage(versionId);
}

// 2. Build the Grid
function renderTemplateGrid() {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");
    let grid = document.getElementById("templateGrid");

    if (!chooserDiv || !grid) return console.error("Grid DOM missing!");

    // Explicitly hide the editor and show the grid
    chooserDiv.style.display = "block";
    editorDiv.style.display = "none";

    // Clear grid to prevent duplicates
    grid.innerHTML = "";

    // Loop through registry and build cards
    Object.keys(CardRegistry).forEach(key => {
        let template = CardRegistry[key];
        let cardHTML = `
            <div class="template-card" data-id="${key}">
                <div class="template-preview">
                    ${template.previewImg ? `<img src="${template.previewImg}" style="width:100%; height:100%; object-fit:cover;">` : '📄'}
                </div>
                <div class="template-info">
                    <div class="template-title">${template.name}</div>
                    <div class="template-stats">${template.stats}</div>
                    <div class="template-desc">${template.description}</div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    document.querySelectorAll(".template-card").forEach(card => {
        card.addEventListener("click", (e) => {
            let versionId = e.currentTarget.getAttribute("data-id");
            showEditor(versionId);
        });
    });
}

// 4. Your Existing Editor Logic (Now with Bulletproof Fetching!)
function runCreatePage(selectedVersion) {
    let container = document.getElementById("createCard");
    let menuArea = document.getElementById("dynamicMenuArea");

    if (!container || !menuArea) return console.error("Create DOM elements missing!");

    let template = CardRegistry[selectedVersion];
    if (!template) return console.error("Template not found in Registry!");

    cardData = template.defaultData();

    // --- THE BULLETPROOF PATH BUILDER ---
    // This finds the true root of your website, even if you are deep in a virtual SPA route
    let rootPath = window.location.pathname;
    ["/create", "/view", "/home", "/about"].forEach(page => {
        if (rootPath.includes(page)) {
            rootPath = rootPath.split(page)[0]; // Cut off the virtual route
        }
    });
    if (!rootPath.endsWith("/")) rootPath += "/";
    let basePath = window.location.origin + rootPath;

    let absoluteMenuUrl = basePath + template.menuHtml;
    let absoluteCardUrl = basePath + template.cardHtml;

    Promise.all([
        fetch(absoluteMenuUrl).then(res => res.text()),
        fetch(absoluteCardUrl).then(res => res.text())
    ]).then(([menuHtml, cardHtml]) => {

        // --- THE FAKE RESPONSE CHECK ---
        // If the server gave us a 404 page disguised as a success, catch it here!
        if (!cardHtml.includes('scene')) {
            console.error("Fetched file did not contain the 3D scene! Server returned:", cardHtml.substring(0, 100));
            return alert("Failed to fetch the true card HTML. The server intercepted the request.");
        }

        menuArea.innerHTML = menuHtml;
        container.innerHTML = cardHtml;

        createCard = template.initCard(container);

        // If the template has its own dynamic UI builder, let it run!
        if (template.onLoad) template.onLoad(template, cardData, createCard);

        template.applyStyles(cardData, createCard);
        setupDynamicBindings(template.bindings(), template);
        setupTabs(template);
    }).catch(err => {
        console.error("Fetch Error details:", err);
    });

    // --- Export Link Logic (With Success Modal & Ad Loop) ---
    document.getElementById("exportBtn").onclick = () => {

        // 1. Inject Theme & Generate Link
        let globalDropdown = document.getElementById("globalThemeSelector");
        if (globalDropdown) cardData.siteTheme = globalDropdown.value;

        let compressedData = encodeCardJSON(cardData);
        let baseUrl = window.location.origin;
        let clipboardUrl = baseUrl + "/view?c=" + compressedData;
        let testUrl = clipboardUrl;

        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            let localRoot = window.location.pathname.replace("/create", "").replace("index.html", "");
            if (localRoot === "") localRoot = "/";
            testUrl = baseUrl + localRoot + "?c=" + compressedData;
        }

        // 2. Copy to clipboard
        navigator.clipboard.writeText(clipboardUrl).catch(err => console.error(err));

        // 3. Setup Modal Elements
        const modal = document.getElementById("successModalOverlay");
        const stateVictory = document.getElementById("sm-state-victory");
        const stateAd = document.getElementById("sm-state-ad");
        const stateReward = document.getElementById("sm-state-reward");
        const previewBtn = document.getElementById("sm-preview-btn");

        // Reset states
        stateVictory.style.display = "block";
        stateAd.style.display = "none";
        stateReward.style.display = "none";

        // Set the preview button link
        previewBtn.href = testUrl;

        // 4. Show Modal & Fire Initial Confetti
        modal.style.display = "flex";
        fireConfetti(100);

        // --- MODAL BUTTON LISTENERS ---

        // Close buttons
        const closeModal = () => { modal.style.display = "none"; };
        document.getElementById("sm-close-btn").onclick = closeModal;
        document.getElementById("sm-close-reward-btn").onclick = closeModal;

        // Watch Ad Logic
        const triggerAd = () => {
            // Switch to Fake Ad Screen
            stateVictory.style.display = "none";
            stateReward.style.display = "none";
            stateAd.style.display = "block";

            // Simulating an ad playing for 3 seconds
            setTimeout(() => {
                // Switch to Reward Screen
                stateAd.style.display = "none";
                stateReward.style.display = "block";

                // MASSIVE CONFETTI!
                fireConfetti(250, 1.2);
            }, 3000);
        };

        document.getElementById("sm-watch-ad-btn").onclick = triggerAd;
        document.getElementById("sm-watch-another-btn").onclick = triggerAd;
    };

    // --- HELPER: Confetti Cannon ---
    function fireConfetti(particleCount, spreadMultiplier = 1) {
        if (typeof confetti !== "function") return; // Failsafe if CDN doesn't load

        // Fires from slightly above the bottom of the screen
        confetti({
            particleCount: particleCount,
            spread: 70 * spreadMultiplier,
            origin: { y: 0.8 },
            colors: ['#ffcc00', '#ff0055', '#00ccff', '#22cc44']
        });
    }
}

// 5. Input Bindings
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

// 6. Menu Tabs
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

// 7. Initialize
if (document.readyState === "complete" || document.readyState === "interactive") {
    initCreateFlow(); // Changed to the new start function
} else {
    document.addEventListener("DOMContentLoaded", initCreateFlow); // Changed to the new start function
}