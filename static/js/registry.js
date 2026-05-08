// =========================================
// 1. THE MANUAL ASSET MAP
// =========================================
const AssetLibrary = {
    "Backgrounds": [
        "static/assets/backgrounds/test1.jpeg",
        "static/assets/backgrounds/test2.jpeg",
        "static/assets/backgrounds/test3.jpeg"
    ],
    "Patterns": [
        "static/assets/patterns/test4.jpeg",
        "static/assets/patterns/test5.jpeg",
        "static/assets/patterns/test6.jpeg"
    ]
};

// =========================================
// 2. THE MODAL LOGIC ENGINE
// =========================================
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("assetModalOverlay");
    const grid = document.getElementById("assetGrid");
    const backBtn = document.getElementById("assetBackBtn");
    const title = document.getElementById("assetModalTitle");
    const closeBtn = document.getElementById("closeAssetModal");

    if (!modal) return;

    let currentTargetInputId = null;

    function renderFolders() {
        grid.innerHTML = "";
        title.textContent = "Choose a Folder";
        backBtn.style.display = "none";

        Object.keys(AssetLibrary).forEach(folderName => {
            let folderHtml = `
                <div class="asset-folder" data-folder="${folderName}">
                    <div class="asset-folder-icon">📁</div>
                    <div class="asset-folder-name">${folderName}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${AssetLibrary[folderName].length} items</div>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', folderHtml);
        });

        document.querySelectorAll(".asset-folder").forEach(folder => {
            folder.addEventListener("click", (e) => {
                let fName = e.currentTarget.getAttribute("data-folder");
                renderImages(fName);
            });
        });
    }

    function renderImages(folderName) {
        grid.innerHTML = "";
        title.textContent = folderName;
        backBtn.style.display = "block";

        let images = AssetLibrary[folderName] || [];

        images.forEach(imgPath => {
            let imgHtml = `
                <img src="${imgPath}" class="asset-thumbnail" data-path="${imgPath}" loading="lazy" alt="Asset">
            `;
            grid.insertAdjacentHTML('beforeend', imgHtml);
        });

        document.querySelectorAll(".asset-thumbnail").forEach(img => {
            img.addEventListener("click", (e) => {
                let selectedPath = e.currentTarget.getAttribute("data-path");

                if (currentTargetInputId) {
                    let targetInput = document.getElementById(currentTargetInputId);
                    if (targetInput) {
                        targetInput.value = selectedPath;
                        targetInput.dispatchEvent(new Event('input'));
                    }
                }
                modal.style.display = "none";
            });
        });
    }

    backBtn.addEventListener("click", renderFolders);
    closeBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".asset-btn");
        if (btn) {
            currentTargetInputId = btn.getAttribute("data-target");
            renderFolders();
            modal.style.display = "flex";
        }
    });
});

// =========================================
// 3. THE CARD REGISTRY (V1 Removed)
// =========================================
const CardRegistry = {
    "v2": {
        id: "v2",
        name: "Infinite Book Card",
        description: "A dynamic card allowing unlimited pages and rows.",
        stats: "Unlimited Pages • 1-10 Rows per page",
        previewImg: "static/images/previews/v2.jpeg",
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

                let sheets = Math.min(Math.max(parseInt(cardData.sheets) || 1, 1), 20);
                let totalFaces = sheets * 2;

                while (cardData.faces.length < totalFaces) {
                    cardData.faces.push({ bg: "", rows: 1, rowData: [{text: "", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}] });
                }
                cardData.faces.splice(totalFaces);

                for (let f = 0; f < totalFaces; f++) {
                    let faceData = cardData.faces[f];
                    let faceName = getFaceName(f, totalFaces);

                    let tab = document.createElement("div");
                    tab.className = "menuPageTab";
                    tab.textContent = faceName;
                    tab.onclick = () => switchV2Tab(f + 1);
                    tabContainer.appendChild(tab);

                    let menu = document.createElement("div");
                    menu.className = "leftMenu hidden";
                    menu.id = `v2MenuFace${f}`;

                    let menuHTML = `
                        <label><b>${faceName} Background</b></label>
                        <div class="hybrid-input-group">
                            <input type="text" placeholder="URL or Hex (#ffcc00)" value="${faceData.bg || ''}" id="bgInputFace${f}">
                            <input type="color" id="bgColorFace${f}" value="#ffffff" title="Pick a Color">
                            <button type="button" class="icon-btn asset-btn" title="Choose Pattern" data-target="bgInputFace${f}">🖼️</button>
                        </div>
                        <hr style="width: 100%; margin: 10px 0;">

                        <label><b>Number of Rows (1-10)</b></label>
                        <input type="number" min="1" max="10" value="${faceData.rows}" id="rowCounterFace${f}">
                        <hr style="width: 100%; margin: 10px 0;">

                        <div id="v2RowInputsFace${f}"></div>
                    `;
                    menu.innerHTML = menuHTML;
                    menuContainer.appendChild(menu);

                    let textInput = document.getElementById(`bgInputFace${f}`);
                    let colorPicker = document.getElementById(`bgColorFace${f}`);

                    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
                        colorPicker.value = textInput.value;
                    }

                    textInput.addEventListener("input", (e) => {
                        let val = e.target.value.trim();
                        cardData.faces[f].bg = val;
                        if (/^#[0-9A-F]{6}$/i.test(val)) colorPicker.value = val;
                        template.applyStyles(cardData, createCard);
                    });

                    colorPicker.addEventListener("input", (e) => {
                        let val = e.target.value;
                        textInput.value = val;
                        cardData.faces[f].bg = val;
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`rowCounterFace${f}`).addEventListener("input", (e) => {
                        let newRowCount = parseInt(e.target.value) || 1;
                        if(newRowCount > 10) newRowCount = 10;
                        if(newRowCount < 1) newRowCount = 1;

                        cardData.faces[f].rows = newRowCount;
                        while (cardData.faces[f].rowData.length < newRowCount) {
                            cardData.faces[f].rowData.push({text: "", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"});
                        }
                        rebuildRowInputs(f);
                        template.applyStyles(cardData, createCard);
                    });

                    rebuildRowInputs(f);
                }

                document.documentElement.style.setProperty('--numTabs', Math.min(totalFaces + 1, 6));
            }

            function rebuildRowInputs(faceIndex) {
                let container = document.getElementById(`v2RowInputsFace${faceIndex}`);
                if(!container) return;
                container.innerHTML = "";

                let faceData = cardData.faces[faceIndex];

                for(let r = 0; r < faceData.rows; r++) {
                    let rowData = faceData.rowData[r] || {text:"", bg:"", color: "#333333", bold: false, italic: false, textBg: "transparent"};
                    if (rowData.bold === undefined) rowData.bold = false;
                    if (rowData.italic === undefined) rowData.italic = false;
                    if (!rowData.color) rowData.color = "#333333";
                    if (!rowData.textBg) rowData.textBg = "transparent";

                    let html = `
                        <div style="margin-bottom: 15px; padding: 15px; background: rgba(0,0,0,0.05); border-radius: 8px; width: 100%; box-sizing: border-box;">
                            <label><b>Row ${r + 1} Text</b></label>

                            <div class="text-toolbar">
                                <button type="button" class="style-btn ${rowData.bold ? 'active' : ''}" id="boldBtnF${faceIndex}R${r}" title="Bold"><b>B</b></button>
                                <button type="button" class="style-btn ${rowData.italic ? 'active' : ''}" id="italicBtnF${faceIndex}R${r}" title="Italic"><i style="font-family: serif;">I</i></button>

                                <div class="toolbar-divider"></div>

                                <div class="color-picker-group" title="Text Color">
                                    <span style="font-weight: bold; font-size: 0.9rem;">A</span>
                                    <input type="color" value="${rowData.color}" id="textColorF${faceIndex}R${r}">
                                </div>

                                <div class="color-picker-group" title="Highlight Box Color" style="margin-left: 5px;">
                                    <span style="font-size: 0.9rem;">🖍️</span>
                                    <input type="color" value="${rowData.textBg === 'transparent' ? '#ffff00' : rowData.textBg}" id="textBgColorF${faceIndex}R${r}">
                                </div>
                                <button type="button" class="style-btn small-btn" id="clearTextBgBtnF${faceIndex}R${r}" title="Remove Highlight">✖</button>
                            </div>

                            <input type="text" value="${rowData.text}" id="textInputF${faceIndex}R${r}" class="toolbar-attached-input">

                            <label style="margin-top: 10px; display: block;"><b>Row ${r + 1} Background</b></label>
                            <div class="hybrid-input-group">
                                <input type="text" placeholder="URL or Hex (#ffcc00)" value="${rowData.bg}" id="bgInputF${faceIndex}R${r}">
                                <input type="color" id="bgColorF${faceIndex}R${r}" value="#ffffff" title="Pick a Color">
                                <button type="button" class="icon-btn asset-btn" title="Choose Pattern" data-target="bgInputF${faceIndex}R${r}">🖼️</button>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', html);

                    document.getElementById(`boldBtnF${faceIndex}R${r}`).addEventListener("click", function() {
                        cardData.faces[faceIndex].rowData[r].bold = !cardData.faces[faceIndex].rowData[r].bold;
                        this.classList.toggle("active");
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`italicBtnF${faceIndex}R${r}`).addEventListener("click", function() {
                        cardData.faces[faceIndex].rowData[r].italic = !cardData.faces[faceIndex].rowData[r].italic;
                        this.classList.toggle("active");
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`textColorF${faceIndex}R${r}`).addEventListener("input", function(e) {
                        cardData.faces[faceIndex].rowData[r].color = e.target.value;
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`textBgColorF${faceIndex}R${r}`).addEventListener("input", function(e) {
                        cardData.faces[faceIndex].rowData[r].textBg = e.target.value;
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`clearTextBgBtnF${faceIndex}R${r}`).addEventListener("click", function() {
                        cardData.faces[faceIndex].rowData[r].textBg = "transparent";
                        document.getElementById(`textBgColorF${faceIndex}R${r}`).value = "#ffff00";
                        template.applyStyles(cardData, createCard);
                    });

                    document.getElementById(`textInputF${faceIndex}R${r}`).addEventListener("input", (e) => {
                        cardData.faces[faceIndex].rowData[r].text = e.target.value;
                        template.applyStyles(cardData, createCard);
                    });

                    let rowTextBgInput = document.getElementById(`bgInputF${faceIndex}R${r}`);
                    let rowColorPicker = document.getElementById(`bgColorF${faceIndex}R${r}`);

                    if (/^#[0-9A-F]{6}$/i.test(rowTextBgInput.value)) { rowColorPicker.value = rowTextBgInput.value; }

                    rowTextBgInput.addEventListener("input", (e) => {
                        let val = e.target.value.trim();
                        cardData.faces[faceIndex].rowData[r].bg = val;
                        if (/^#[0-9A-F]{6}$/i.test(val)) rowColorPicker.value = val;
                        template.applyStyles(cardData, createCard);
                    });

                    rowColorPicker.addEventListener("input", (e) => {
                        let val = e.target.value;
                        rowTextBgInput.value = val;
                        cardData.faces[faceIndex].rowData[r].bg = val;
                        template.applyStyles(cardData, createCard);
                    });
                }
            }

            function switchV2Tab(index) {
                let tabs = [document.getElementById("v2TabSettings"), ...document.querySelectorAll("#dynamicPageTabsContainer .menuPageTab")];
                let menus = [document.getElementById("settingMenu"), ...document.querySelectorAll("#dynamicMenusContainer .leftMenu")];

                menus.forEach(menu => menu.classList.add("hidden"));
                if(menus[index]) menus[index].classList.remove("hidden");

                tabs.forEach(t => t.classList.remove("menuPageTabSelected"));
                if(tabs[index]) tabs[index].classList.add("menuPageTabSelected");

                if (createCard && index > 0) {
                    let faceBeingEdited = index - 1;
                    let requiredState = Math.ceil(faceBeingEdited / 2);

                    createCard.leaves.forEach(l => l.classList.remove("flipped"));
                    for(let i = 0; i < requiredState; i++) {
                        if (createCard.leaves[i]) createCard.leaves[i].classList.add("flipped");
                    }
                    createCard.currentState = requiredState;
                    createCard.updateBook();
                }
            }

            document.getElementById("sheetsInput").addEventListener("input", (e) => {
                cardData.sheets = e.target.value;
                rebuildUI();
                switchV2Tab(0);
                template.applyStyles(cardData, createCard);
            });

            ['fontSizeInput', 'fontStyleInput', 'paddingInput'].forEach(id => {
                let elem = document.getElementById(id);
                if (elem) {
                    elem.addEventListener("input", (e) => {
                        let key = id.replace("Input", "");
                        let val = e.target.value;

                        if (id === 'paddingInput') {
                            val = Math.min(Math.max(parseInt(val) || 0, 0), 100);
                            e.target.value = val;
                        }

                        cardData[key] = val + (id.includes("Size") || id.includes("padding") ? "px" : "");
                        template.applyStyles(cardData, createCard);
                    });
                }
            });

            rebuildUI();

            let v2TabSettings = document.getElementById("v2TabSettings");
            if (v2TabSettings) {
                v2TabSettings.onclick = () => switchV2Tab(0);
            }
        }
    }
};