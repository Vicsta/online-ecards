class CardV2 {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.leaves = Array.from(sceneElement.querySelectorAll('.book-leaf'));
        this.currentState = 0; // 0 = Closed cover, 1 = First open spread, etc.
        this.maxState = this.leaves.length;

        // Attach listeners to whatever buttons exist in the DOM right now
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
        // Fix z-indexing so pages stack correctly based on which side they are on
        this.leaves.forEach((leaf, i) => {
            if (i < this.currentState) {
                leaf.style.zIndex = i + 1; // Flipped to the left
            } else {
                leaf.style.zIndex = this.leaves.length - i; // Stacked on the right
            }
        });

        // Shift the entire book to stay centered on the screen
        if (this.leaves.length === 1) {
            // Postcard logic
            this.scene.style.transform = this.currentState === 1 ? "translateX(50%)" : "translateX(0%)";
        } else {
            // Book logic
            if (this.currentState === 0) {
                this.scene.style.transform = "translateX(0%)"; // Closed, resting right
            } else if (this.currentState === this.maxState) {
                this.scene.style.transform = "translateX(100%)"; // Fully open, resting left
            } else {
                this.scene.style.transform = "translateX(50%)"; // Center hinge
            }
        }
    }
}

const cardV2_defaults = {
    version: "v2",
    font: "Arial", fontSize: "16px", padding: "10px",
    sheets: 2, // 2 sheets = 4 faces (Standard Folded Card)
    faces: [
        { bg: "", rows: 1, rowData: [{text: "Front Cover", bg: ""}] },
        { bg: "", rows: 2, rowData: [{text: "Inside Left Top", bg: ""}, {text: "Inside Left Bottom", bg: ""}] },
        { bg: "", rows: 2, rowData: [{text: "Inside Right Top", bg: ""}, {text: "Inside Right Bottom", bg: ""}] },
        { bg: "", rows: 1, rowData: [{text: "Back Cover", bg: ""}] }
    ]
};

// Empty bindings because V2 builds its UI dynamically via the Registry
const cardV2_bindings = {};

function applyCustomizationToCardV2(json, cardObj) {
    let scene = document.getElementById("v2BookEngine");
    if (!scene) return;

    // Wipe the scene clean to rebuild it
    scene.innerHTML = "";

    // Global Styles
    scene.style.fontFamily = json.font;
    scene.style.fontSize = json.fontSize;

    // Helper
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
    let arrowSrc = "static/images/Arrow%20Right.png"; // Ensure this path is correct!

    // Build the physical leaves
    for (let s = 0; s < json.sheets; s++) {
        let leafDiv = document.createElement("div");
        leafDiv.className = "book-leaf";

        // --- FRONT FACE ---
        let frontFaceIndex = s * 2;
        let frontFace = document.createElement("div");
        frontFace.className = "book-face front";
        frontFace.style.padding = json.padding;

        let fData = json.faces[frontFaceIndex] || { bg: "", rows: 1, rowData: [{text:"", bg:""}] };

        // FORCE FACE TO BE WHITE
        applyBg(frontFace, fData.bg, "white");

        for (let r = 0; r < fData.rows; r++) {
            let row = document.createElement("div");
            row.className = "v2-row";
            row.style.height = `${100 / fData.rows}%`;
            let rData = fData.rowData[r] || {text:"", bg:""};
            row.textContent = rData.text;

            // ROWS REMAIN TRANSPARENT BY DEFAULT
            applyBg(row, rData.bg, "transparent");
            frontFace.appendChild(row);
        }

        // Add Next Button
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

        let bData = json.faces[backFaceIndex] || { bg: "", rows: 1, rowData: [{text:"", bg:""}] };

        // FORCE FACE TO BE WHITE
        applyBg(backFace, bData.bg, "white");

        for (let r = 0; r < bData.rows; r++) {
            let row = document.createElement("div");
            row.className = "v2-row";
            row.style.height = `${100 / bData.rows}%`;
            let rData = bData.rowData[r] || {text:"", bg:""};
            row.textContent = rData.text;

            // ROWS REMAIN TRANSPARENT BY DEFAULT
            applyBg(row, rData.bg, "transparent");
            backFace.appendChild(row);
        }

        // Add Prev Button
        let prevBtn = document.createElement("img");
        prevBtn.className = "nav-btn prev";
        prevBtn.src = arrowSrc;
        backFace.appendChild(prevBtn);

        leafDiv.appendChild(frontFace);
        leafDiv.appendChild(backFace);
        scene.appendChild(leafDiv);
    }

    // Re-initialize the engine now that the DOM exists
    if (cardObj) {
        // We preserve the current open state so it doesn't snap shut when they type
        let oldState = cardObj.currentState || 0;
        Object.assign(cardObj, new CardV2(scene));

        // Restore flip state
        cardObj.currentState = Math.min(oldState, json.sheets);
        for(let i=0; i<cardObj.currentState; i++) {
            cardObj.leaves[i].classList.add("flipped");
        }
        cardObj.updateBook();
    }
}