console.log("in view.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

let viewCard = null;

function runViewPage() {
    console.log("Running home page");
    replaceElementWithCard(document.getElementById("viewCard"), "templates/cards/cardV1.html").then(
        card => {
            viewCard = card;

            let params = new URLSearchParams(window.location.search);
            let encodedString = params.get("c");

            if (encodedString) {
                let cardData = decodeCardJSON(encodedString);
                console.log("Decoded JSON:", cardData);

                applyCustomizationToCardV1(cardData, viewCard);
            }
        }
    );
}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runViewPage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runViewPage);
}
