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
            name: "Infinite Book Card",
            description: "A dynamic card allowing unlimited pages and rows.",
            stats: "Infinite Sheets • 1-10 Rows/Page",
            previewImg: "",
            tags: ["3D Book", "Advanced"],

            cardHtml: "templates/cards/v2_card.html",
            menuHtml: "templates/cards/v2_menu.html",

            initCard: (container) => {
                const scene = container.querySelector(".scene");
                return scene ? new CardV2(scene) : null;
            },

            defaultData: () => JSON.parse(JSON.stringify(cardV2_defaults)),
            applyStyles: (json, cardObj) => applyCustomizationToCardV2(json, cardObj),
            bindings: () => cardV2_bindings,

            onLoad: (template, cardData, createCard) => {

                // Helper to name faces logically
                function getFaceName(index, totalFaces) {
                    if (index === 0) return "Front Cover";
                    if (index === totalFaces - 1) return "Back Cover";
                    if (index % 2 !== 0) return `Inside L ${Math.ceil(index/2)}`;
                    return `Inside R ${Math.ceil(index/2)}`;
                }

                function rebuildUI() {
                    let tabContainer = document.getElementById("dynamicPageTabsContainer");
                    let menuContainer = document.getElementById("dynamicMenusContainer");
                    if (!tabContainer || !menuContainer) return;

                    tabContainer.innerHTML = "";
                    menuContainer.innerHTML = "";

                    // Cap physical sheets between 1 and 20 just to prevent browser crashing
                    let sheets = Math.min(Math.max(parseInt(cardData.sheets) || 1, 1), 20);
                    let totalFaces = sheets * 2;

                    // Sync the JSON array length with the face count
                    while (cardData.faces.length < totalFaces) {
                        cardData.faces.push({ bg: "", rows: 1, rowData: [{text: "", bg: ""}] });
                    }
                    cardData.faces.splice(totalFaces); // Trim excess if sheets were reduced

                    for (let f = 0; f < totalFaces; f++) {
                        let faceData = cardData.faces[f];
                        let faceName = getFaceName(f, totalFaces);

                        // 1. Build Tab
                        let tab = document.createElement("div");
                        tab.className = "menuPageTab";
                        tab.textContent = faceName;
                        tab.onclick = () => switchV2Tab(f + 1); // +1 because Settings is index 0
                        tabContainer.appendChild(tab);

                        // 2. Build Menu Panel
                        let menu = document.createElement("div");
                        menu.className = "leftMenu hidden";
                        menu.id = `v2MenuFace${f}`;

                        let menuHTML = `
                            <label><b>${faceName} Background</b></label>
                            <input type="text" placeholder="URL or Hex (#ffcc00)" value="${faceData.bg || ''}"
                                   oninput="cardData.faces[${f}].bg = this.value; template.applyStyles(cardData, createCard);">
                            <hr style="width: 100%; margin: 10px 0;">

                            <label style="color: blue;"><b>Number of Rows (1-10)</b></label>
                            <input type="number" min="1" max="10" value="${faceData.rows}" id="rowCounterFace${f}">
                            <hr style="width: 100%; margin: 10px 0;">

                            <div id="v2RowInputsFace${f}"></div>
                        `;
                        menu.innerHTML = menuHTML;
                        menuContainer.appendChild(menu);

                        // Listener to regenerate row inputs when number changes
                        document.getElementById(`rowCounterFace${f}`).addEventListener("input", (e) => {
                            let newRowCount = parseInt(e.target.value) || 1;
                            if(newRowCount > 10) newRowCount = 10;
                            if(newRowCount < 1) newRowCount = 1;

                            cardData.faces[f].rows = newRowCount;
                            while (cardData.faces[f].rowData.length < newRowCount) {
                                cardData.faces[f].rowData.push({text: "", bg: ""});
                            }
                            rebuildRowInputs(f);
                            template.applyStyles(cardData, createCard);
                        });

                        rebuildRowInputs(f);
                    }

                    document.documentElement.style.setProperty('--numTabs', Math.min(totalFaces + 1, 6)); // Cap tab width in CSS
                }

                function rebuildRowInputs(faceIndex) {
                    let container = document.getElementById(`v2RowInputsFace${faceIndex}`);
                    if(!container) return;
                    container.innerHTML = "";

                    let faceData = cardData.faces[faceIndex];

                    for(let r = 0; r < faceData.rows; r++) {
                        let rowData = faceData.rowData[r] || {text:"", bg:""};
                        let html = `
                            <div style="margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 5px;">
                                <label><b>Row ${r + 1} Text</b></label>
                                <input type="text" value="${rowData.text}" oninput="cardData.faces[${faceIndex}].rowData[${r}].text = this.value; template.applyStyles(cardData, createCard);">
                                <label><b>Row ${r + 1} Background</b></label>
                                <input type="text" value="${rowData.bg}" oninput="cardData.faces[${faceIndex}].rowData[${r}].bg = this.value; template.applyStyles(cardData, createCard);">
                            </div>
                        `;
                        container.insertAdjacentHTML('beforeend', html);
                    }
                }

                function switchV2Tab(index) {
                    let tabs = [document.getElementById("v2TabSettings"), ...document.querySelectorAll("#dynamicPageTabsContainer .menuPageTab")];
                    let menus = [document.getElementById("settingMenu"), ...document.querySelectorAll("#dynamicMenusContainer .leftMenu")];

                    menus.forEach(menu => menu.classList.add("hidden"));
                    if(menus[index]) menus[index].classList.remove("hidden");

                    tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
                    if(tabs[index]) tabs[index].classList.add("menuPageTabSelected");

                    // Auto-flip book to show the face the user is editing!
                    if (createCard && index > 0) {
                        let faceBeingEdited = index - 1;
                        let sheetIndex = Math.floor(faceBeingEdited / 2); // 0,0 -> 0. 1,1 -> 1.

                        // Close all pages
                        createCard.leaves.forEach(l => l.classList.remove("flipped"));

                        // Open up to the sheet we need
                        for(let i = 0; i < sheetIndex; i++) {
                            createCard.leaves[i].classList.add("flipped");
                        }
                        createCard.currentState = sheetIndex;
                        createCard.updateBook();
                    }
                }

                // Bind Global Inputs
                document.getElementById("sheetsInput").addEventListener("input", (e) => {
                    cardData.sheets = e.target.value;
                    rebuildUI();
                    switchV2Tab(0);
                    template.applyStyles(cardData, createCard);
                });

                ['fontSizeInput', 'fontStyleInput', 'paddingInput'].forEach(id => {
                    document.getElementById(id).addEventListener("input", (e) => {
                        let key = id.replace("Input", "");
                        cardData[key] = e.target.value + (id.includes("Size") || id.includes("padding") ? "px" : "");
                        template.applyStyles(cardData, createCard);
                    });
                });

                // Init UI
                rebuildUI();
                document.getElementById("v2TabSettings").onclick = () => switchV2Tab(0);
            }
        }
    };