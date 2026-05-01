class CardV1 {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.cardFront = sceneElement.querySelector('.cardFront');
        this.cardBack = sceneElement.querySelector('.cardBack');
        this.state = 0;
        this.Xpercent = 50;

        this.scene.querySelectorAll(".buttonNext").forEach(button => {
            button.addEventListener('click', () => this.next());
        });
        this.scene.querySelectorAll(".buttonPrev").forEach(button => {
            button.addEventListener('click', () => this.prev());
        });
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

const cardV1_defaults = {
    version: "v1",
    front: "", page1: "", page2: "", back: "",
    s1: "", s2: "", s3: "", s4: "", s5: "", s6: "",
    s7: "", s8: "", s9: "", s10: "", s11: "", s12: "",
    font: "Arial", // Change this from "" to "Arial"
    fontSize: "16px",
    alignItems: "",
    justifyContent: "",
    padding: "0px",
    text1: "", text2: "", text3: "", text4: "", text5: "", text6: "",
    text7: "", text8: "", text9: "", text10: "", text11: "", text12: "",
};

const cardV1_bindings = {
    "fontSizeInput": "fontSize", "fontStyleInput": "font", "paddingInput": "padding",
    "bgFront": "front", "bgPage1": "page1", "bgPage2": "page2", "bgBack": "back",
    "text1Top": "text1", "text1Middle": "text2", "text1Bottom": "text3",
    "bg1Top": "s1", "bg1Middle": "s2", "bg1Bottom": "s3",
    "text2Top": "text4", "text2Middle": "text5", "text2Bottom": "text6",
    "bg2Top": "s4", "bg2Middle": "s5", "bg2Bottom": "s6",
    "text3Top": "text7", "text3Middle": "text8", "text3Bottom": "text9",
    "bg3Top": "s7", "bg3Middle": "s8", "bg3Bottom": "s9",
    "text4Top": "text10", "text4Middle": "text11", "text4Bottom": "text12",
    "bg4Top": "s10", "bg4Middle": "s11", "bg4Bottom": "s12",
};

function applyCustomizationToCardV1(json, cardObj) {
    // --- NEW SAFETY CHECK ---
    if (!cardObj || !cardObj.scene) {
        console.warn("Card not ready for styling yet.");
        return;
    }

    let card = cardObj.scene;

    card.style.fontFamily = json.font;
    card.style.fontSize = json.fontSize;
    card.style.alignItems = json.alignItems;
    card.style.justifyContent = json.justifyContent;

    let frontFace = card.querySelector(".card_face--front");
    let insideLeftFace = card.querySelector(".card_face--inside-left");
    let insideRightFace = card.querySelector(".card_face--inside-right");
    let backFace = card.querySelector(".card_face--back");

    function applyBackground(element, bgValue) {
        if (!element) return;
        if (!bgValue || bgValue.trim() === "") {
            element.style.backgroundColor = "";
            element.style.backgroundImage = "none";
        } else if (bgValue.includes("http") || bgValue.includes("data:image") || bgValue.includes("/")) {
            element.style.backgroundColor = "transparent";
            element.style.backgroundImage = `url('${bgValue}')`;
            element.style.backgroundSize = "cover";
            element.style.backgroundPosition = "center";
            element.style.backgroundRepeat = "no-repeat";
        } else {
            element.style.backgroundColor = bgValue;
            element.style.backgroundImage = "none";
        }
    }

    applyBackground(frontFace, json.front);
    applyBackground(insideLeftFace, json.page1);
    applyBackground(insideRightFace, json.page2);
    applyBackground(backFace, json.back);

    function applySectionStyles(sections, textValues, bgValues, fullPageBg) {
        let hasFullPageBg = fullPageBg && fullPageBg.trim() !== "";
        if (sections.length === 3) {
            for (let i = 0; i < 3; i++) {
                sections[i].textContent = textValues[i] || "";
                let bg = bgValues[i];

                if (hasFullPageBg || !bg || bg.trim() === "") {
                    sections[i].style.backgroundColor = "transparent";
                    sections[i].style.backgroundImage = "none";
                } else if (bg.includes("http") || bg.includes("data:image") || bg.includes("/")) {
                    sections[i].style.backgroundColor = "transparent";
                    sections[i].style.backgroundImage = `url('${bg}')`;
                    sections[i].style.backgroundSize = "cover";
                    sections[i].style.backgroundPosition = "center";
                    sections[i].style.backgroundRepeat = "no-repeat";
                } else {
                    sections[i].style.backgroundColor = bg;
                    sections[i].style.backgroundImage = "none";
                }
            }
        }
    }

    applySectionStyles(frontFace?.querySelectorAll(".card_section") || [], [json.text1, json.text2, json.text3], [json.s1, json.s2, json.s3], json.front);
    applySectionStyles(insideLeftFace?.querySelectorAll(".card_section") || [], [json.text4, json.text5, json.text6], [json.s4, json.s5, json.s6], json.page1);
    applySectionStyles(insideRightFace?.querySelectorAll(".card_section") || [], [json.text7, json.text8, json.text9], [json.s7, json.s8, json.s9], json.page2);
    applySectionStyles(backFace?.querySelectorAll(".card_section") || [], [json.text10, json.text11, json.text12], [json.s10, json.s11, json.s12], json.back);
}