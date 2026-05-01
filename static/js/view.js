let viewCard = null;

function runViewPage() {
    let container = document.getElementById("viewCard");
    if (!container) return;

    let targetUrl = sessionStorage.redirect ? sessionStorage.redirect : window.location.href;
    let urlObj = new URL(targetUrl, window.location.origin);
    let params = new URLSearchParams(urlObj.search);
    let encodedString = params.get("c");

    if (encodedString) {
        // Hide the empty state and show the card container
        document.getElementById("noCardData").style.display = "none";
        document.getElementById("cardViewContainer").style.display = "flex";

        // (Then append your card to #cardViewContainer instead of the raw body or #view)
        let cardData = decodeCardJSON(encodedString);
        let template = CardRegistry[cardData.version];
        if (!template) return console.error("Unknown card version!");

        // CHANGED THIS LINE (Pass the template instead of template.cardHtml):
        replaceElementWithCard(container, template).then(card => {
            viewCard = card;
            template.applyStyles(cardData, viewCard);
        });
    } else {
        container.innerHTML = "<h2>No Card Data Found</h2>";
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    runViewPage();
} else {
    document.addEventListener("DOMContentLoaded", runViewPage);
}