console.log("in view.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

let viewCard = null;

function runViewPage() {
    console.log("Running view page");

    // Ensure you have a <div id="viewCard"></div> in your HTML where the view page lives
    let container = document.getElementById("viewCard");

    if (!container) {
        console.error("Could not find element with id 'viewCard'");
        return;
    }

    replaceElementWithCard(container, "templates/cards/cardV1.html").then(
        card => {
            viewCard = card;

            // 1. Prioritize the saved redirect URL from the 404 hack, fallback to current window URL
            let targetUrl = sessionStorage.redirect ? sessionStorage.redirect : window.location.href;

            // 2. Parse the URL safely
            let urlObj = new URL(targetUrl, window.location.origin);
            let params = new URLSearchParams(urlObj.search);
            let encodedString = params.get("c");

            if (encodedString) {
                let cardData = decodeCardJSON(encodedString);
                console.log("Decoded JSON:", cardData);
                applyCustomizationToCardV1(cardData, viewCard);
            } else {
                console.log("No card data found in URL.");
            }
        }
    ).catch(err => console.error("Failed to load card template:", err));
}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runViewPage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runViewPage);
}
