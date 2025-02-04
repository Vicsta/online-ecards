console.log("in home.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

console.log("started onloading");
console.log(replaceCardsWithTemplate);

function runHomePage() {
    console.log("Running home page");
}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runHomePage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runHomePage);
}
