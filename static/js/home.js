console.log("in home.js");
// loadPage("templates/card.html", "cardContainer", "static/js/card.js");

console.log("started onloading");
console.log(replaceCardsWithTemplate);
window.onload = () => {
    console.log("finished onloading");
    console.log(replaceCardsWithTemplate);
    replaceCardsWithTemplate("templates/card.html");
};