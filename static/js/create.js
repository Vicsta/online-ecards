let createCard = null;
let cardData = null;

// 1. The Entry Point
function initCreateFlow() {
    let params = new URLSearchParams(window.location.search);
    let selectedVersion = params.get("v");

    let backBtn = document.getElementById("backToGridBtn");
    if (backBtn) {
        backBtn.onclick = () => {
            history.replaceState(null, "", window.location.pathname);
            document.body.setAttribute("data-editor-active", "false");
            renderTemplateGrid();
        };
    }

    if (selectedVersion && CardRegistry[selectedVersion]) {
        showEditor(selectedVersion);
    } else {
        document.body.setAttribute("data-editor-active", "false");
        renderTemplateGrid();
    }
}

// 2. Switch to Editor State
function showEditor(versionId) {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");

    if(chooserDiv) chooserDiv.style.display = "none";
    if(editorDiv) editorDiv.style.display = "flex";

    let viewContainer = document.getElementById("cardViewContainer");
    if (viewContainer) {
        viewContainer.innerHTML = "";
    }

    document.body.setAttribute("data-editor-active", "true");
    history.replaceState(null, "", "?v=" + versionId);
    runCreatePage(versionId);
}

// 3. Build the Grid
function renderTemplateGrid() {
    let chooserDiv = document.getElementById("templateChooser");
    let editorDiv = document.getElementById("cardEditor");
    let grid = document.getElementById("templateGrid");

    if (!chooserDiv || !grid) return;

    chooserDiv.style.display = "block";
    editorDiv.style.display = "none";
    grid.innerHTML = "";

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

// 4. Editor Logic & Fetching
function runCreatePage(selectedVersion) {
    let container = document.getElementById("createCard");
    let menuArea = document.getElementById("dynamicMenuArea");

    if (!container || !menuArea) return console.error("Create DOM missing!");

    let template = CardRegistry[selectedVersion];
    if (!template) return console.error("Template not found!");

    cardData = template.defaultData();

    // --- YOUR LOCALHOST HARDCODE ---
    let basePath = window.location.origin;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        basePath += "/online-ecards/online-e-card/";
    } else {
        basePath += "/";
    }

    let cleanMenuPath = template.menuHtml.startsWith('/') ? template.menuHtml.substring(1) : template.menuHtml;
    let cleanCardPath = template.cardHtml.startsWith('/') ? template.cardHtml.substring(1) : template.cardHtml;

    let absoluteMenuUrl = basePath + cleanMenuPath;
    let absoluteCardUrl = basePath + cleanCardPath;

    Promise.all([
        fetch(absoluteMenuUrl).then(res => {
            if (!res.ok) throw new Error(`Server returned ${res.status} for Menu file`);
            return res.text();
        }),
        fetch(absoluteCardUrl).then(res => {
            if (!res.ok) throw new Error(`Server returned ${res.status} for Card file`);
            return res.text();
        })
    ]).then(([menuHtml, cardHtml]) => {
        if (cardHtml.toLowerCase().includes('<!doctype html>') || cardHtml.toLowerCase().includes('<head>')) {
            return alert("Fetch Failed! Server routed to index.html instead of the template.");
        }

        menuArea.innerHTML = menuHtml;
        container.innerHTML = cardHtml;

        createCard = template.initCard(container);
        if (template.onLoad) template.onLoad(template, cardData, createCard);

        template.applyStyles(cardData, createCard);
        setupDynamicBindings(template.bindings(), template);
        setupTabs(template);

    }).catch(err => {
        console.error("FETCH ERROR:", err);
        alert("Could not load the template files.");
    });

    // 5. Export Button Logic
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

// 6. Input Bindings
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

// 7. Menu Tabs
function setupTabs(template) {
    const tabs = document.querySelectorAll(".menuPageTab");
    const menus = document.querySelectorAll(".leftMenu");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            menus.forEach(menu => menu.classList.add("hidden"));
            menus[index].classList.remove("hidden");
            tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
            tabs[index].classList.add("menuPageTabSelected");

            if (createCard && template.onTabSwitch) {
                template.onTabSwitch(index, createCard);
            }
        });
    });

    if(tabs.length > 0) tabs[0].classList.add("menuPageTabSelected");
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    initCreateFlow();
} else {
    document.addEventListener("DOMContentLoaded", initCreateFlow);
}