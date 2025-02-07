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

    const tabs = document.querySelectorAll(".menuPageTab");
    const menus = document.querySelectorAll(".leftMenu");

    // Function to switch active menu
    function switchMenu(index) {
        // Hide all menus
        menus.forEach(menu => menu.classList.add("hidden"));
        // Show the selected menu
        menus[index].classList.remove("hidden");

        // Remove selection from all tabs
        tabs.forEach(tab => tab.classList.remove("menuPageTabSelected"));
        // Highlight the active tab
        tabs[index].classList.add("menuPageTabSelected");
    }

    // Attach click event listeners to all tabs
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => switchMenu(index));
    });

    // Initially set the first tab as selected
    tabs[0].classList.add("menuPageTabSelected");

}

// Ensure this runs if the script is executed after DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
    console.log("ready state");
    runCreatePage();
} else {
    console.log("adding event listener");
    document.addEventListener("DOMContentLoaded", runCreatePage);
}
