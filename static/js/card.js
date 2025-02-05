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
function applyCustomizationToCardV1(json, card) {
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
}
