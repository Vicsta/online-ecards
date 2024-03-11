let state = 0; // 0: front view, 1: inside view, 2: back view

function updateCardState() {
    const cardBack = document.querySelector('.cardBack');
    const cardFront = document.querySelector('.cardFront');
    const scene = document.querySelector('.scene');

    const Xpercent = 50;

    switch (state) {
        case 0:
            cardFront.style.transform = "rotateY(0deg)";
            scene.style.transform = "translateX(0)"
            // Set z-index after the card has started turning
            setTimeout(() => {
                cardBack.style.zIndex = 0;
                cardFront.style.zIndex = 2;
            }, 200); // Halfway through the transition
            break;
        case 1:
            // Rotate to show the inside - adjust degree as needed
            cardFront.style.transform = "rotateY(-180deg)";
            cardBack.style.transform = "rotateY(0deg)";
            scene.style.transform = "translateX(" + Xpercent + "%)";
            break;
        case 2:
            // Further rotate to show the back
            cardBack.style.transform = "rotateY(-180deg)";
            scene.style.transform = "translateX(" + (Xpercent * 2) + "%)";
            // Delay z-index change until the flip to the back completes halfway
            setTimeout(() => {
                cardFront.style.zIndex = 0;
                cardBack.style.zIndex = 2;
            }, 200); // Halfway through the transition
            break;
    }
}

document.querySelectorAll(".buttonNext").forEach(button => {
    button.addEventListener('click', () => {
        if (state < 2) state++;
        updateCardState();
    });
});

document.querySelectorAll(".buttonPrev").forEach(button => {
    button.addEventListener('click', () => {
        if (state > 0) state--;
        updateCardState();
    });
});
