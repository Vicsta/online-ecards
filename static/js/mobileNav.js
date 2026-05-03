// =========================================
// MOBILE DRAWER LOGIC (BULLETPROOF VERSION)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // Using querySelector grabs the element by its class, which is safer if IDs change!
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const closeDrawer = document.querySelector('.close-drawer-btn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleDrawer() {
        console.log("Button clicked! Toggling drawer..."); // Debugging check
        if (mobileDrawer) mobileDrawer.classList.toggle('active');
        if (drawerOverlay) drawerOverlay.classList.toggle('active');
    }

    // Attach the click events if the elements exist on the page
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDrawer);
    if (closeDrawer) closeDrawer.addEventListener('click', toggleDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', toggleDrawer);

    // Close drawer if they click a link inside it
    if (mobileNavLinks) {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', toggleDrawer);
        });
    }
});