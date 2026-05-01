const CardRegistry = {
    "v1": {
        id: "v1",
        name: "Classic Greeting Card",
        description: "A traditional card that opens to reveal left and right inner pages.",
        stats: "4 Pages • 3 Sections per page",
        previewImg: "",
        tags: ["3D Fold", "Classic"],
        cardHtml: "templates/cards/v1_card.html",
        menuHtml: "templates/cards/v1_menu.html",
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
    },

    "v2": {
        id: "v2",
        name: "Dynamic Multi-Row Card",
        description: "Build cards with customizable pages and stacked rows.",
        stats: "1-4 Pages • 1-10 Rows/Page",
        previewImg: "",
        tags: ["3D Fold", "Advanced"],

        cardHtml: "templates/cards/v2_card.html",
        menuHtml: "templates/cards/v2_menu.html",

        initCard: (container) => {
            const scene = container.querySelector(".scene");
            return scene ? new CardV2(scene) : null;
        },

        defaultData: () => JSON.parse(JSON.stringify(cardV2_defaults)),
        applyStyles: (json, cardObj) => applyCustomizationToCardV2(json, cardObj),
        bindings: () => cardV2_bindings,

        // --- NEW: Custom UI Builder for V2 ---
        // Because the UI is entirely dynamic, V2 builds its own menu inside create.js
        onLoad: (template, cardData, createCard) => {

            function rebuildUI() {
                let tabContainer = document.getElementById("dynamicPageTabsContainer");
                let menuContainer = document.getElementById("dynamicMenusContainer");
                if (!tabContainer || !menuContainer) return;

                tabContainer.innerHTML = "";
                menuContainer.innerHTML = "";

                let totalPages = Math.min(Math.max(parseInt(cardData.totalPages) || 1, 1), 4);

                // Keep the JSON array length synced with the page count
                while (cardData.pages.length < totalPages) {
                    cardData.pages.push({ bg: "", rows: 1, rowData: [{text: "", bg: ""}] });
                }

                const faceNames = ["Front", "Inside L", "Inside R", "Back"];

                for (let p = 0; p < totalPages; p++) {
                    let pageData = cardData.pages[p];

                    // 1. Build the Tab
                    let tab = document.createElement("div");
                    tab.className = "menuPageTab";
                    tab.textContent = faceNames[p];
                    tab.onclick = () => switchV2Tab(p + 1); // +1 because Settings is index 0
                    tabContainer.appendChild(tab);

                    // 2. Build the Menu Panel
                    let menu = document.createElement("div");
                    menu.className = "leftMenu hidden";
                    menu.id = `v2MenuPage${p}`;

                    // Build HTML for the menu
                    let menuHTML = `
                        <label><b>Full Page Background</b></label>
                        <input type="text" placeholder="URL or Hex (#ffcc00)" value="${pageData.bg || ''}"
                               oninput="cardData.pages[${p}].bg = this.value; template.applyStyles(cardData, createCard);">
                        <hr style="width: 100%; margin: 10px 0;">

                        <label style="color: blue;"><b>Number of Rows (1-10)</b></label>
                        <input type="number" min="1" max="10" value="${pageData.rows}" id="rowCounter${p}">
                        <hr style="width: 100%; margin: 10px 0;">

                        <div id="v2RowInputs${p}"></div>
                    `;
                    menu.innerHTML = menuHTML;
                    menuContainer.appendChild(menu);

                    // Add listener to the row counter so changing rows dynamically rebuilds the inputs below it!
                    document.getElementById(`rowCounter${p}`).addEventListener("input", (e) => {
                        let newRowCount = parseInt(e.target.value) || 1;
                        if(newRowCount > 10) newRowCount = 10;
                        if(newRowCount < 1) newRowCount = 1;

                        cardData.pages[p].rows = newRowCount;

                        // Sync the JSON rowData array
                        while (cardData.pages[p].rowData.length < newRowCount) {
                            cardData.pages[p].rowData.push({text: "", bg: ""});
                        }

                        rebuildRowInputs(p);
                        template.applyStyles(cardData, createCard);
                    });

                    // Build the actual text/bg inputs for the current number of rows
                    rebuildRowInputs(p);
                }

                // Make sure CSS Variables match dynamic tab count (Settings + Pages)
                document.documentElement.style.setProperty('--numTabs', totalPages + 1);
            }

            function rebuildRowInputs(pageIndex) {
                let container = document.getElementById(`v2RowInputs${pageIndex}`);
                if(!container) return;
                container.innerHTML = "";

                let pageData = cardData.pages[pageIndex];

                for(let r = 0; r < pageData.rows; r++) {
                    let rowData = pageData.rowData[r] || {text:"", bg:""};

                    let html = `
                        <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 5px;">
                            <label><b>Row ${r + 1} Text</b></label>
                            <input type="text" value="${rowData.text}" oninput="cardData.pages[${pageIndex}].rowData[${r}].text = this.value; template.applyStyles(cardData, createCard);">

                            <label><b>Row ${r + 1} Background</b></label>
                            <input type="text" value="${rowData.bg}" oninput="cardData.pages[${pageIndex}].rowData[${r}].bg = this.value; template.applyStyles(cardData, createCard);">
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', html);
                }
            }

            // Tab Switching Logic specifically for V2
            function switchV2Tab(index) {
                let tabs = [document.getElementById("v2TabSettings"), ...document.querySelectorAll("#dynamicPageTabsContainer .menuPageTab")];
                let menus = [document.getElementById("settingMenu"), ...document.querySelectorAll("#dynamicMenusContainer .leftMenu")];

                menus.forEach(menu => menu.classList.add("hidden"));
                if(menus[index]) menus[index].classList.remove("hidden");

                tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
                if(tabs[index]) tabs[index].classList.add("menuPageTabSelected");

                // Flip the 3D card
                if (createCard) {
                    if (index === 1) createCard.state = 0;
                    else if (index === 2 || index === 3) createCard.state = 1;
                    else if (index === 4) createCard.state = 2;
                    createCard.updateCardState();
                }
            }

            // Initial Build
            rebuildUI();

            // Wire up the Settings Tab
            document.getElementById("v2TabSettings").onclick = () => switchV2Tab(0);

            // Listen for changes to Total Pages to trigger a full UI rebuild
            document.getElementById("totalPagesInput").addEventListener("input", () => {
                rebuildUI();
                switchV2Tab(0);
                template.applyStyles(cardData, createCard);
            });
        }
    }
};