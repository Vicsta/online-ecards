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

        // --- NEW: APPLY THE SENDER'S SAVED WEBSITE THEME ---
        if (cardData.siteTheme && typeof applySiteTheme === "function") {
            applySiteTheme(cardData.siteTheme);

            // Optional: Sync the dropdowns in the navbar so they match
            let globalDropdown = document.getElementById("globalThemeSelector");
            let mobileDropdown = document.getElementById("mobileThemeSelector");
            if (globalDropdown) globalDropdown.value = cardData.siteTheme;
            if (mobileDropdown) mobileDropdown.value = cardData.siteTheme;
        }

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
            // It's a valid full URL. Update the browser bar without refreshing!
            history.pushState(null, "", url.pathname + url.search);
            runViewPage(); // Re-run the view logic to build the card
        } else {
            alert("That link doesn't seem to contain any saved card data.");
        }
    } catch (e) {
        // If they pasted raw text/garbage, append it as a parameter
        // without refreshing, then let runViewPage() catch the corruption!
        history.pushState(null, "", "?c=" + encodeURIComponent(urlStr));
        runViewPage();
    }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
    runViewPage();
} else {
    document.addEventListener("DOMContentLoaded", runViewPage);
}