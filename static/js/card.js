// A smart utility that fetches HTML and asks the registry to initialize the 3D logic
function replaceElementWithCard(cardElement, template) {
    return fetch(template.cardHtml)
        .then(response => response.text())
        .then(html => {
            cardElement.innerHTML = html;
            return template.initCard(cardElement); // Dynamic initialization!
        })
        .catch(error => console.error("Error loading card template:", error));
}

function encodeCardJSON(cardData) {
    try {
        return LZString.compressToEncodedURIComponent(JSON.stringify(cardData));
    } catch (error) {
        console.error("Error encoding card JSON:", error);
        return null;
    }
}

function decodeCardJSON(encodedString) {
    try {
        return JSON.parse(LZString.decompressFromEncodedURIComponent(encodedString));
    } catch (error) {
        console.error("Error decoding card JSON:", error);
        return null;
    }
}