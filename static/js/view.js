let viewCard = null;

function runViewPage() {
    let container = document.getElementById("cardViewContainer");
    let emptyState = document.getElementById("noCardData");

    if (!container || !emptyState) return;

    let targetUrl = sessionStorage.redirect ? sessionStorage.redirect : window.location.href;
    let urlObj = new URL(targetUrl, window.location.origin);
    let params = new URLSearchParams(urlObj.search);
    let encodedString = params.get("c");

    if (encodedString) {
        let cardData = null;

        // 1. SAFELY try to decode the data. If it's garbage, catch the error.
        try {
            cardData = decodeCardJSON(encodedString);
        } catch (e) {
            console.error("Decryption failed:", e);
        }

        // 2. If decoding failed, bounce them back to the empty state safely!
        if (!cardData || !cardData.version) {
            alert("Oops! The link or code you provided is invalid or corrupted.");

            // Clean the garbage out of the browser's URL bar so they aren't stuck
            window.history.replaceState(null, "", "/view");

            emptyState.style.display = "block";
            container.style.display = "none";
            return; // Stop running
        }

        // 3. The data is safe and valid! Hide the dashboard and build the card.
        emptyState.style.display = "none";
        container.style.display = "flex";

        let template = CardRegistry[cardData.version];
        if (!template) {
            alert("This card uses an unknown or outdated template.");
            return;
        }

        replaceElementWithCard(container, template).then(card => {
            viewCard = card;
            template.applyStyles(cardData, viewCard);
        });

    } else {
        // No ?c= parameter at all, just show the dashboard
        emptyState.style.display = "block";
        container.style.display = "none";
    }
}

// --- BUTTON LOGIC FOR THE EMPTY STATE ---
window.loadPastedLink = function() {
    let urlStr = document.getElementById("pasteCardUrl").value.trim();
    if (!urlStr) return;

    try {
        let url = new URL(urlStr);
        if (url.searchParams.has("c")) {
            // It's a valid full URL, go to it
            window.location.href = urlStr;
        } else {
            alert("That link doesn't seem to contain any saved card data.");
        }
    } catch (e) {
        // If they pasted raw text/garbage, encode it safely so the URL doesn't break.
        // runViewPage() will catch it on reload and throw the "Invalid" alert.
        window.location.href = "/view?c=" + encodeURIComponent(urlStr);
    }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    runViewPage();
} else {
    document.addEventListener("DOMContentLoaded", runViewPage);
}