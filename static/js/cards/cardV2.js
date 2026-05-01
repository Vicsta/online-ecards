class CardV2 {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.cardFront = sceneElement.querySelector('.cardFront');
        this.cardBack = sceneElement.querySelector('.cardBack');
        this.state = 0;
        this.Xpercent = 50;

        this.scene.querySelectorAll(".buttonNext").forEach(button => button.addEventListener('click', () => this.next()));
        this.scene.querySelectorAll(".buttonPrev").forEach(button => button.addEventListener('click', () => this.prev()));
    }
    next() { if (this.state < 2) { this.state++; this.updateCardState(); } }
    prev() { if (this.state > 0) { this.state--; this.updateCardState(); } }
    updateCardState() {
        switch (this.state) {
            case 0:
                this.cardFront.style.transform = "rotateY(0deg)";
                this.scene.style.transform = "translateX(0)";
                setTimeout(() => { this.cardBack.style.zIndex = 0; this.cardFront.style.zIndex = 2; }, 200);
                break;
            case 1:
                this.cardFront.style.transform = "rotateY(-180deg)";
                this.cardBack.style.transform = "rotateY(0deg)";
                this.scene.style.transform = `translateX(${this.Xpercent}%)`;
                break;
            case 2:
                this.cardBack.style.transform = "rotateY(-180deg)";
                this.scene.style.transform = `translateX(${this.Xpercent * 2}%)`;
                setTimeout(() => { this.cardFront.style.zIndex = 0; this.cardBack.style.zIndex = 2; }, 200);
                break;
        }
    }
}

// Default Data Structure
const cardV2_defaults = {
    version: "v2",
    font: "Arial",
    fontSize: "16px",
    padding: "0px",

    // Total Pages (1 to 10)
    totalPages: 4,

    // Page Data Array. Each object represents a page.
    pages: [
        { bg: "", rows: 3, rowData: [{text: "Top", bg: ""}, {text: "Middle", bg: ""}, {text: "Bottom", bg: ""}] }, // Page 1
        { bg: "", rows: 2, rowData: [{text: "Inside Top", bg: ""}, {text: "Inside Bottom", bg: ""}] }, // Page 2
        { bg: "", rows: 1, rowData: [{text: "Full Page", bg: ""}] }, // Page 3
        { bg: "", rows: 3, rowData: [{text: "", bg: ""}, {text: "", bg: ""}, {text: "Back", bg: ""}] }  // Page 4
    ]
};

// We don't use standard bindings for V2 because the inputs are dynamically generated!
const cardV2_bindings = {
    "fontSizeInput": "fontSize",
    "fontStyleInput": "font",
    "paddingInput": "padding",
    "totalPagesInput": "totalPages"
};

function applyCustomizationToCardV2(json, cardObj) {
    if (!cardObj || !cardObj.scene) return;
    let card = cardObj.scene;

    card.style.fontFamily = json.font;
    card.style.fontSize = json.fontSize;
    card.style.padding = json.padding;

    // Helper: Safely apply background colors or images
    function applyBg(element, bgValue) {
        if (!element) return;
        if (!bgValue || bgValue.trim() === "") {
            element.style.backgroundColor = "transparent";
            element.style.backgroundImage = "none";
        } else if (bgValue.includes("http") || bgValue.includes("data:image") || bgValue.includes("/")) {
            element.style.backgroundColor = "transparent";
            element.style.backgroundImage = `url('${bgValue}')`;
            element.style.backgroundSize = "cover";
            element.style.backgroundPosition = "center";
        } else {
            element.style.backgroundColor = bgValue;
            element.style.backgroundImage = "none";
        }
    }

    // Dynamic Page Builder
    const faceSelectors = [
        ".card_face--front",
        ".card_face--inside-left",
        ".card_face--inside-right",
        ".card_face--back"
    ];

    for (let p = 0; p < 4; p++) {
        let face = card.querySelector(faceSelectors[p]);
        if (!face) continue;

        // Save navigation buttons before wiping
        let buttons = face.querySelectorAll(".buttonNext, .buttonPrev");

        // Wipe face and apply background
        face.innerHTML = "";

        // If the user set fewer pages, hide the unused faces entirely
        if (p >= json.totalPages) {
            face.style.visibility = "hidden";
            continue;
        } else {
            face.style.visibility = "visible";
        }

        let pageData = json.pages[p] || { bg: "", rows: 1, rowData: [{text: "", bg: ""}] };
        let hasFullBg = pageData.bg && pageData.bg.trim() !== "";

        applyBg(face, pageData.bg);

        // Calculate height percentage per row
        let heightPercent = 100 / pageData.rows;

        // Build the Rows
        for (let r = 0; r < pageData.rows; r++) {
            let rowDiv = document.createElement("div");
            rowDiv.className = "v2-row";
            rowDiv.style.height = `${heightPercent}%`;

            let rowInfo = pageData.rowData[r] || {text: "", bg: ""};
            rowDiv.textContent = rowInfo.text;

            if (hasFullBg) {
                rowDiv.style.backgroundColor = "transparent";
            } else {
                applyBg(rowDiv, rowInfo.bg);
            }

            face.appendChild(rowDiv);
        }

        // Re-attach buttons
        buttons.forEach(btn => face.appendChild(btn));
    }
}