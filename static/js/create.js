let createCard = null;
let cardData = null;

// 1. The New Entry Point
function initCreateFlow() {
    let params = new URLSearchParams(window.location.search);
    let selectedVersion = params.get("v");

    // Wire up the Back button right away
    let backBtn = document.getElementById("backToGridBtn");
    if (backBtn) {
        backBtn.onclick = () => {
            // Remove the ?v= from URL so it defaults to the grid
            history.replaceState(null, "", window.location.pathname);
            renderTemplateGrid();
        };
    }

    if (selectedVersion && CardRegistry[selectedVersion]) {
        // If the URL already specifies a version, skip the grid and load it
        showEditor(selectedVersion);
    } else {
        // Otherwise, build and show the Template Grid
        renderTemplateGrid();
    }
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

// 3. Switch to Editor State
function showEditor(versionId) {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");

    // Explicitly hide the grid and show the editor flexbox
    if(chooserDiv) chooserDiv.style.display = "none";
    if(editorDiv) editorDiv.style.display = "flex";

    history.replaceState(null, "", "?v=" + versionId);
    runCreatePage(versionId);
}

// 4. Your Existing Editor Logic (Now with Bulletproof Fetching!)
function runCreatePage(selectedVersion) {
    let container = document.getElementById("createCard");
    let menuArea = document.getElementById("dynamicMenuArea");

    if (!container || !menuArea) return console.error("Create DOM elements missing!");

    let template = CardRegistry[selectedVersion];
    if (!template) return console.error("Template not found in Registry!");

    cardData = template.defaultData();

    // --- UNIVERSAL RELATIVE PATH FIX ---
    // We use no leading slash. This makes the fetch relative to the
    // current root directory of the project, not the server root.
    let menuUrl = template.menuHtml;
    let cardUrl = template.cardHtml;

    Promise.all([
        fetch(menuUrl).then(res => {
            if (!res.ok) throw new Error(`Menu not found at ${menuUrl}`);
            return res.text();
        }),
        fetch(cardUrl).then(res => {
            if (!res.ok) throw new Error(`Card not found at ${cardUrl}`);
            return res.text();
        })
    ]).then(([menuHtml, cardHtml]) => {
        menuArea.innerHTML = menuHtml;
        container.innerHTML = cardHtml;

        createCard = template.initCard(container);

        template.applyStyles(cardData, createCard);
        setupDynamicBindings(template.bindings(), template);
        setupTabs(template);
    }).catch(err => {
        console.error("Fetch Error details:", err);
        alert("Failed to load: " + err.message);
    });

    // --- Export Link Logic ---
    document.getElementById("exportBtn").onclick = () => {
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
    };
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