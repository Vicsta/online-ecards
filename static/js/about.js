// static/js/about.js
function runAboutPage() {
    console.log("About page script loaded.");
    // You can add logic here later if you want animations or interactive elements
}

// Standard initialization
if (document.readyState === "complete" || document.readyState === "interactive") {
    runAboutPage();
} else {
    document.addEventListener("DOMContentLoaded", runAboutPage);
}