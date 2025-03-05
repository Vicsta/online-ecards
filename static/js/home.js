console.log("in home.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

let mainCard = null;

function runHomePage() {
    console.log("Running home page");
    replaceElementWithCard(document.getElementById("mainCard"), "templates/cards/cardV1.html").then(
        card => {
            mainCard = card;
            applyCustomizationToCardV1(cardExample1, mainCard);

            let t = encodeCardJSON(cardExample2);
            console.log(t);
            console.log(decodeCardJSON(t));

            let shareableURL = `https://online-ecards.com/view?c=${t}`;
            console.log("Compressed URL String:", shareableURL);
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
