let viewCard = null;

function runViewPage() {
    // 1. Target the correct IDs from your new view.html
    let container = document.getElementById("cardViewContainer");
    let emptyState = document.getElementById("noCardData");

    // If the HTML hasn't injected yet, stop.
    if (!container || !emptyState) return;

    let targetUrl = sessionStorage.redirect ? sessionStorage.redirect : window.location.href;
    let urlObj = new URL(targetUrl, window.location.origin);
    let params = new URLSearchParams(urlObj.search);
    let encodedString = params.get("c");

    if (encodedString) {
        // WE FOUND A CARD: Hide empty state, show the card container
        emptyState.style.display = "none";
        container.style.display = "flex";

        let cardData = decodeCardJSON(encodedString);
        let template = CardRegistry[cardData.version];
        if (!template) return console.error("Unknown card version!");

        // Pass the container so the card builds inside it
        replaceElementWithCard(container, template).then(card => {
            viewCard = card;
            template.applyStyles(cardData, viewCard);
        });
    } else {
        // WE FOUND NOTHING: Ensure the empty state is visible
        emptyState.style.display = "block";
        container.style.display = "none";
    }
}

// Make sure it runs when the view page is clicked
if (document.readyState === "complete" || document.readyState === "interactive") {
    runViewPage();
} else {
    document.addEventListener("DOMContentLoaded", runViewPage);
}

// --- BUTTON LOGIC FOR THE EMPTY STATE ---
window.loadPastedLink = function() {
    let urlStr = document.getElementById("pasteCardUrl").value.trim();
    if (!urlStr) return;

    try {
        // Check if it's a full URL
        let url = new URL(urlStr);
        if (url.searchParams.has("c")) {
            // If valid, navigate the browser to the pasted link
            window.location.href = urlStr;
        } else {
            alert("That link doesn't seem to contain any saved card data.");
        }
    } catch (e) {
        // If they just pasted the raw encrypted string instead of a URL
        if (urlStr.length > 50) {
             window.location.href = "/view?c=" + urlStr;
        } else {
             alert("Please paste a valid card link.");
        }
    }
};