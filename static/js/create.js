console.log("in create.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

let createCard = null;

function runCreatePage() {
    console.log("Running home page");
    replaceElementWithCard(document.getElementById("createCard"), "templates/cards/cardV1.html").then(
        card => {
            createCard = card;
        }
    );
}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runCreatePage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runCreatePage);
}
