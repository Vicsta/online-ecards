console.log("in home.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

let mainCard = null;

function runHomePage() {
    console.log("Running home page");
    replaceElementWithCard(document.getElementById("mainCard"), "templates/cards/cardV1.html").then(
        card => {
            mainCard = card;
            applyCustomizationToCardV1(cardExample1, mainCard);

            let t = encodeCardJSON(cardExample1);
            console.log(t);
            console.log(decodeURI(t));
        }
    );
}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runHomePage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runHomePage);
}
