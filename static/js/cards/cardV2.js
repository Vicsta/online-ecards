class CardV2 {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.leaves = Array.from(sceneElement.querySelectorAll('.book-leaf'));
        this.currentState = 0;
        this.maxState = this.leaves.length;

        this.scene.querySelectorAll('.nav-btn.next').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); this.next(); });
        this.scene.querySelectorAll('.nav-btn.prev').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); this.prev(); });

        this.updateBook();
    }

    next() {
        if (this.currentState < this.maxState) {
            this.leaves[this.currentState].classList.add('flipped');
            this.currentState++;
            this.updateBook();
        }
    }

    prev() {
        if (this.currentState > 0) {
            this.currentState--;
            this.leaves[this.currentState].classList.remove('flipped');
            this.updateBook();
        }
    }

    updateBook() {
        this.leaves.forEach((leaf, i) => {
            if (i < this.currentState) {
                leaf.style.zIndex = i + 1;
            } else {
                leaf.style.zIndex = this.leaves.length - i;
            }
        });

        if (this.leaves.length === 1) {
            this.scene.style.transform = this.currentState === 1 ? "translateX(50%)" : "translateX(0%)";
        } else {
            if (this.currentState === 0) {
                this.scene.style.transform = "translateX(0%)";
            } else if (this.currentState === this.maxState) {
                this.scene.style.transform = "translateX(100%)";
            } else {
                this.scene.style.transform = "translateX(50%)";
            }
        }
    }
}

const cardV2_defaults = {
    version: "v2",
    font: "Arial", fontSize: "16px", padding: "10px",
    sheets: 2,
    faces: [
        { bg: "", rows: 1, rowData: [{text: "Front Cover", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}] },
        { bg: "", rows: 2, rowData: [{text: "Inside Left Top", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}, {text: "Inside Left Bottom", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}] },
        { bg: "", rows: 2, rowData: [{text: "Inside Right Top", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}, {text: "Inside Right Bottom", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}] },
        { bg: "", rows: 1, rowData: [{text: "Back Cover", bg: "", color: "#333333", bold: false, italic: false, textBg: "transparent"}] }
    ]
};

const cardV2_bindings = {};

function applyCustomizationToCardV2(json, cardObj) {
    let scene = document.getElementById("v2BookEngine");
    if (!scene) return;

    scene.innerHTML = "";
    scene.style.fontFamily = json.font;
    scene.style.fontSize = json.fontSize;

    function applyBg(element, bgValue, defaultColor) {
        if (!element) return;
        if (!bgValue || bgValue.trim() === "") {
            element.style.backgroundColor = defaultColor;
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

    let totalFaces = json.sheets * 2;
    let arrowSrc = "static/images/Arrow%20Right.png";

    for (let s = 0; s < json.sheets; s++) {
        let leafDiv = document.createElement("div");
        leafDiv.className = "book-leaf";

        // --- FRONT FACE ---
        let frontFaceIndex = s * 2;
        let frontFace = document.createElement("div");
        frontFace.className = "book-face front";
        frontFace.style.padding = json.padding;

        let fData = json.faces[frontFaceIndex] || { bg: "", rows: 1, rowData: [{text:"", bg:"", color: "#333333", bold: false, italic: false, textBg: "transparent"}] };

        applyBg(frontFace, fData.bg, "white");

        for (let r = 0; r < fData.rows; r++) {
            let row = document.createElement("div");
            row.className = "v2-row";
            row.style.height = `${100 / fData.rows}%`;

            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.justifyContent = "center";

            let rData = fData.rowData[r] || {text:"", bg:"", color: "#333333", bold: false, italic: false, textBg: "transparent"};

            let textSpan = document.createElement("span");
            textSpan.textContent = rData.text;
            textSpan.style.color = rData.color || "inherit";
            textSpan.style.fontWeight = rData.bold ? "bold" : "normal";
            textSpan.style.fontStyle = rData.italic ? "italic" : "normal";

            if (rData.textBg && rData.textBg !== "transparent") {
                textSpan.style.backgroundColor = rData.textBg;
                textSpan.style.padding = "4px 10px";
                textSpan.style.borderRadius = "6px";
            }

            row.appendChild(textSpan);
            applyBg(row, rData.bg, "transparent");
            frontFace.appendChild(row);
        }

        if (frontFaceIndex < totalFaces - 1) {
            let nextBtn = document.createElement("img");
            nextBtn.className = "nav-btn next";
            nextBtn.src = arrowSrc;
            frontFace.appendChild(nextBtn);
        }

        // --- BACK FACE ---
        let backFaceIndex = (s * 2) + 1;
        let backFace = document.createElement("div");
        backFace.className = "book-face back";
        backFace.style.padding = json.padding;

        let bData = json.faces[backFaceIndex] || { bg: "", rows: 1, rowData: [{text:"", bg:"", color: "#333333", bold: false, italic: false, textBg: "transparent"}] };

        applyBg(backFace, bData.bg, "white");

        for (let r = 0; r < bData.rows; r++) {
            let row = document.createElement("div");
            row.className = "v2-row";
            row.style.height = `${100 / bData.rows}%`;

            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.justifyContent = "center";

            let rData = bData.rowData[r] || {text:"", bg:"", color: "#333333", bold: false, italic: false, textBg: "transparent"};

            let textSpan = document.createElement("span");
            textSpan.textContent = rData.text;
            textSpan.style.color = rData.color || "inherit";
            textSpan.style.fontWeight = rData.bold ? "bold" : "normal";
            textSpan.style.fontStyle = rData.italic ? "italic" : "normal";

            if (rData.textBg && rData.textBg !== "transparent") {
                textSpan.style.backgroundColor = rData.textBg;
                textSpan.style.padding = "4px 10px";
                textSpan.style.borderRadius = "6px";
            }

            row.appendChild(textSpan);
            applyBg(row, rData.bg, "transparent");
            backFace.appendChild(row);
        }

        let prevBtn = document.createElement("img");
        prevBtn.className = "nav-btn prev";
        prevBtn.src = arrowSrc;
        backFace.appendChild(prevBtn);

        leafDiv.appendChild(frontFace);
        leafDiv.appendChild(backFace);
        scene.appendChild(leafDiv);
    }

    if (cardObj) {
        let oldState = cardObj.currentState || 0;

        cardObj.scene = scene;
        cardObj.leaves = Array.from(scene.querySelectorAll('.book-leaf'));
        cardObj.maxState = cardObj.leaves.length;
        cardObj.currentState = Math.min(oldState, cardObj.maxState);

        scene.querySelectorAll('.nav-btn.next').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); cardObj.next(); });
        scene.querySelectorAll('.nav-btn.prev').forEach(btn => btn.onclick = (e) => { e.stopPropagation(); cardObj.prev(); });

        for(let i = 0; i < cardObj.currentState; i++) {
            cardObj.leaves[i].classList.add("flipped");
        }
        cardObj.updateBook();
    }
}