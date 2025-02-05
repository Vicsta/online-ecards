class Card {
    constructor(sceneElement) {
        this.scene = sceneElement;
        this.cardFront = sceneElement.querySelector('.cardFront');
        this.cardBack = sceneElement.querySelector('.cardBack');
        this.state = 0; // 0: front view, 1: inside view, 2: back view
        this.Xpercent = 50;

        // Attach event listeners for navigation buttons inside this specific card
        this.scene.querySelectorAll(".buttonNext").forEach(button => {
            button.addEventListener('click', () => this.next());
        });

        this.scene.querySelectorAll(".buttonPrev").forEach(button => {
            button.addEventListener('click', () => this.prev());
        });
    }

    next() {
        if (this.state < 2) {
            this.state++;
            this.updateCardState();
        }
    }

    prev() {
        if (this.state > 0) {
            this.state--;
            this.updateCardState();
        }
    }

    updateCardState() {
        switch (this.state) {
            case 0:
                this.cardFront.style.transform = "rotateY(0deg)";
                this.scene.style.transform = "translateX(0)";
                setTimeout(() => {
                    this.cardBack.style.zIndex = 0;
                    this.cardFront.style.zIndex = 2;
                }, 200);
                break;
            case 1:
                this.cardFront.style.transform = "rotateY(-180deg)";
                this.cardBack.style.transform = "rotateY(0deg)";
                this.scene.style.transform = `translateX(${this.Xpercent}%)`;
                break;
            case 2:
                this.cardBack.style.transform = "rotateY(-180deg)";
                this.scene.style.transform = `translateX(${this.Xpercent * 2}%)`;
                setTimeout(() => {
                    this.cardFront.style.zIndex = 0;
                    this.cardBack.style.zIndex = 2;
                }, 200);
                break;
        }
    }
}

function replaceElementWithCard(cardElement, templateUrl) {
    console.log("trying to fetch");
    return fetch(templateUrl) // Fetch the card template (card.html)
        .then(response => response.text())
        .then(html => {
            console.log("fetched");
            console.log(cardElement);
            console.log(html);
            cardElement.innerHTML = html; // Replace the .card element with the template content
            return initializeCard(cardElement); // Initialize the card inside it
        })
        .catch(error => console.error("Error loading card template:", error));
}

function initializeCard(container) {
    const scene = container.querySelector(".scene"); // Get only the first .scene inside the container
    if (scene) {
        return new Card(scene); // Attach a new Card instance
    } else {
        console.error("No .scene element found inside the container!");
        return null;
    }
}

function replaceCardsWithTemplate(templateUrl) {
    console.log("trying to fetch");
    fetch(templateUrl) // Fetch the card template (card.html)
        .then(response => response.text())
        .then(html => {
            console.log("fetched");
            document.querySelectorAll(".cardContainer").forEach(cardElement => {
                console.log(cardElement);
                console.log(html);
                cardElement.innerHTML = html; // Replace the .card element with the template content
                initializeCards(cardElement); // Initialize the card inside it
            });
        })
        .catch(error => console.error("Error loading card template:", error));
}

function initializeCards(container) {
    container.querySelectorAll(".scene").forEach(scene => {
        new Card(scene); // Attach a new Card instance
    });
}

// Version 1
function applyCustomizationToCardV1(json, cardObj) {

    let card = cardObj.scene;

    card.style.fontFamily = json.font; // Set font
    card.style.fontSize = json.fontSize; // Set font size
    card.style.alignItems = json.alignItems; // Vertical alignment
    card.style.justifyContent = json.justifyContent; // Horizontal alignment
    // card.style.padding = json.padding; // Padding for the entire card

    let frontFace = card.querySelector(".card_face--front");
    let insideLeftFace = card.querySelector(".card_face--inside-left");
    let insideRightFace = card.querySelector(".card_face--inside-right");
    let backFace = card.querySelector(".card_face--back");

    if (frontFace) frontFace.style.backgroundImage = json.front1 ? `url(${json.front1})` : "none";
    if (insideLeftFace) insideLeftFace.style.backgroundImage = json.page1 ? `url(${json.page1})` : "none";
    if (insideRightFace) insideRightFace.style.backgroundImage = json.page2 ? `url(${json.page2})` : "none";
    if (backFace) backFace.style.backgroundImage = json.back1 ? `url(${json.back1})` : "none";

    [frontFace, insideLeftFace, insideRightFace, backFace].forEach(face => {
        if (face) {
            face.style.backgroundSize = "cover"; // Ensures the image covers the full page
            face.style.backgroundPosition = "center"; // Centers the background image
            face.style.backgroundRepeat = "no-repeat"; // Prevents image repetition
        }
    });

    // Assign text to the front page
    let frontSections = card.querySelector(".card_face--front").querySelectorAll(".card_section");
    if (frontSections.length === 3) {
        frontSections[0].textContent = json.text1; // Top Section
        frontSections[1].textContent = json.text2; // Middle Section
        frontSections[2].textContent = json.text3; // Bottom Section
    }

    // Assign text to the inside-left page
    let insideLeftSections = card.querySelector(".card_face--inside-left").querySelectorAll(".card_section");
    if (insideLeftSections.length === 3) {
        insideLeftSections[0].textContent = json.text4; // Top Section
        insideLeftSections[1].textContent = json.text5; // Middle Section
        insideLeftSections[2].textContent = json.text6; // Bottom Section
    }

    // Assign text to the inside-right page
    let insideRightSections = card.querySelector(".card_face--inside-right").querySelectorAll(".card_section");
    if (insideRightSections.length === 3) {
        insideRightSections[0].textContent = json.text7; // Top Section
        insideRightSections[1].textContent = json.text8; // Middle Section
        insideRightSections[2].textContent = json.text9; // Bottom Section
    }

    // Assign text to the back page
    let backSections = card.querySelector(".card_face--back").querySelectorAll(".card_section");
    if (backSections.length === 3) {
        backSections[0].textContent = json.text10; // Top Section
        backSections[1].textContent = json.text11; // Middle Section
        backSections[2].textContent = json.text12; // Bottom Section
    }

    console.log("Page backgrounds applied successfully!");

    function applySectionStyles(sections, textValues, bgValues) {
        if (sections.length === 3) {
            for (let i = 0; i < 3; i++) {
                sections[i].textContent = textValues[i] || ""; // Apply text

                let bg = bgValues[i];

                if (bg.startsWith("#") || bg.startsWith("rgb")) {
                    sections[i].style.backgroundColor = bg;
                    sections[i].style.backgroundImage = "none"; // Remove any previous image
                } else if (bg) {
                    sections[i].style.backgroundImage = `url(${bg})`;
                    sections[i].style.backgroundSize = "cover";
                    sections[i].style.backgroundPosition = "center";
                    sections[i].style.backgroundRepeat = "no-repeat";
                }
            }
        }
    }


    applySectionStyles(
        frontFace?.querySelectorAll(".card_section") || [],
        [json.text1, json.text2, json.text3],
        [json.s1, json.s2, json.s3]
    );

    applySectionStyles(
        insideLeftFace?.querySelectorAll(".card_section") || [],
        [json.text4, json.text5, json.text6],
        [json.s4, json.s5, json.s6]
    );

    applySectionStyles(
        insideRightFace?.querySelectorAll(".card_section") || [],
        [json.text7, json.text8, json.text9],
        [json.s7, json.s8, json.s9]
    );

    applySectionStyles(
        backFace?.querySelectorAll(".card_section") || [],
        [json.text10, json.text11, json.text12],
        [json.s10, json.s11, json.s12]
    );
}
