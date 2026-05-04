// --- NEW: DYNAMIC BASE PATH & ROUTING ---
const getAppRoot = () => {
    let cleanUrl = window.location.href.split('?')[0];
    if (cleanUrl.includes("online-e-card/")) {
        // Local WebStorm environment
        return new URL(cleanUrl.split("online-e-card/")[0] + "online-e-card/").pathname;
    }
    // Production environment
    return "/";
};

const APP_ROOT = getAppRoot();

// Inject the magic <base> tag so all relative assets (images, css) know where the root is
(function injectBaseTag() {
    let baseTag = document.querySelector('base') || document.createElement('base');
    baseTag.href = APP_ROOT;
    document.head.appendChild(baseTag);
})();


const pages = ["home", "about", "view", "create", "contact", "not"];
let curPage = 0; // Default index

window.addEventListener("load", function () {

    // --- 1. THE STATE MANAGER ---
    function updateAppState(pageName) {
        console.log("--- STATE CHANGE ---");
        console.log("Current Page:", pageName);

        document.body.setAttribute('data-current-page', pageName);
        document.body.setAttribute('data-editor-active', 'false');

        if (pageName === 'create') {
            let editorDiv = document.getElementById("cardEditor");
            let params = new URLSearchParams(window.location.search);
            if ((editorDiv && editorDiv.style.display === "flex") || params.has("v")) {
                document.body.setAttribute('data-editor-active', 'true');
            }
        }

        let bannersEnabled = localStorage.getItem("bannersEnabled") !== "false";
        updateBannerVisibility(bannersEnabled);
    }

    // --- 2. BULLETPROOF NAV HIGHLIGHTER ---
    function updateNav(currentPathCheck) {
        // Strip the base path out so we are just left with the page name
        let currentPath = window.location.pathname.replace(APP_ROOT, "");
        if (currentPath === "" || currentPath.includes("index.html")) currentPath = "home";
        // Remove trailing slashes
        if (currentPath.endsWith("/")) currentPath = currentPath.slice(0, -1);

        $(".nav-link").removeClass("active");

        $(".nav-link").each(function() {
            let linkTarget = $(this).attr("href").replace("/", "");
            if (linkTarget === currentPath || linkTarget === currentPathCheck) {
                $(this).addClass("active");
            }
        });
    }

    // --- 3. INITIAL LOAD LOGIC ---
    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;

        let checkPage = "home";

        if (redirect) {
            let urlObj = new URL(redirect);
            checkPage = urlObj.pathname.split("/").pop().split("?")[0];
            if (urlObj.searchParams.has("c")) checkPage = "view";
            else if (checkPage === "" || checkPage === "index.html") checkPage = "home";
            if (!pages.includes(checkPage)) checkPage = "not";

            history.replaceState(null, "", redirect);
        } else {
            let urlObj = new URL(location.href);
            if (urlObj.searchParams.has("c")) {
                checkPage = "view";
            } else {
                checkPage = urlObj.pathname.split("/").pop().split("?")[0];
                if (checkPage === "" || checkPage === "index.html") checkPage = "home";
                if (!pages.includes(checkPage)) checkPage = "not";
            }
        }

        curPage = pages.indexOf(checkPage);
        updateAppState(checkPage);

        $(".fullPage").hide();
        $("#" + checkPage).css("display", "flex").show();
        updateNav(checkPage);
    })();

    // --- 4. NAVIGATION LISTENERS ---
    window.onpopstate = function () {
        let urlObj = new URL(location.href);
        let ext = urlObj.pathname.split("/").pop().split("?")[0];
        if (urlObj.searchParams.has("c")) ext = "view";
        else if (ext === "" || ext === "index.html") ext = "home";
        else if (!pages.includes(ext)) ext = "not";

        loadPage(pages.indexOf(ext));
        updateNav(ext);
    };

    $(".nav-link").on("click", function(e) {
        e.preventDefault();
        let target = $(this).attr("href").replace("/", "");

        if (pages.includes(target)) {
            // FIXED: We now push the state using the APP_ROOT so it doesn't escape the folder!
            history.pushState(null, "", APP_ROOT + target);
            loadPage(pages.indexOf(target));
            updateNav(target);
        } else {
            history.pushState(null, "", APP_ROOT + "404");
            loadPage(pages.indexOf("not"));
        }
    });

    // --- 5. PAGE TRANSITION LOGIC ---
    function loadPage(x) {
        if (x === curPage) return;

        let previousPage = curPage;
        curPage = x;

        // Trigger State Manager
        updateAppState(pages[curPage]);

        $("#" + pages[previousPage]).stop(true, true).fadeOut("fast", function () {
            pages.forEach(p => {
                if (pages.indexOf(p) !== curPage) $("#" + p).hide();
            });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            $("#" + pages[curPage]).stop(true, true).css("display", "flex").hide().fadeIn("slow");
        });
    }

    // --- 6. SAFE TOGGLE LOGIC ---
    const toggleSwitch = document.getElementById("supportToggleSwitch");
    // Ensure mobile toggle syncs as well if it exists
    const mobileToggleSwitch = document.getElementById("mobileSupportToggleSwitch");

    function updateBannerVisibility(isEnabled) {
        if (isEnabled) {
            document.body.classList.remove('support-hidden');
        } else {
            document.body.classList.add('support-hidden');
        }
    }

    if (toggleSwitch) {
        let bannersEnabled = localStorage.getItem("bannersEnabled") !== "false";
        toggleSwitch.checked = bannersEnabled;
        if(mobileToggleSwitch) mobileToggleSwitch.checked = bannersEnabled;

        updateBannerVisibility(bannersEnabled);

        const toggleHandler = function() {
            let isEnabled = this.checked;
            localStorage.setItem("bannersEnabled", isEnabled ? "true" : "false");
            updateBannerVisibility(isEnabled);

            // Keep both toggles in sync visually
            if(toggleSwitch) toggleSwitch.checked = isEnabled;
            if(mobileToggleSwitch) mobileToggleSwitch.checked = isEnabled;
        };

        toggleSwitch.addEventListener("change", toggleHandler);
        if(mobileToggleSwitch) mobileToggleSwitch.addEventListener("change", toggleHandler);
    }
});


// =========================================
// GLOBAL DOCUMENT LISTENERS (No dependencies on window.load)
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    // --- FIX FOR MOBILE DRAWER 404s ---
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            // 1. Stop the browser from physically trying to load /create and causing a 404
            e.preventDefault();

            // 2. Find the matching desktop link and trigger its exact routing logic
            const targetHref = link.getAttribute('href');
            const desktopLink = document.querySelector(`.nav-link[href="${targetHref}"]`);
            if (desktopLink) {
                desktopLink.click();
            }

            // 3. Close the mobile drawer so they can actually see the new page!
            const drawer = document.querySelector('.mobile-drawer');
            const overlay = document.querySelector('.drawer-overlay');
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    });

    // --- GLOBAL CONFETTI CANNON ---
        // Moved here so it works on every page, not just the Create page!
        window.fireConfetti = function(particleCount, spreadMultiplier = 1) {
            if (typeof confetti !== "function") return;
            confetti({
                particleCount: particleCount,
                spread: 70 * spreadMultiplier,
                origin: { y: 0.8 },
                colors: ['#ffcc00', '#ff0055', '#00ccff', '#22cc44'],
                zIndex: 9999
            });
        };

        // --- BULLETPROOF AD & MODAL BUTTON LISTENER ---
        document.addEventListener('click', (e) => {

            // 1. Check if they clicked a "Close" button
            if (e.target.closest('.close-modal-btn')) {
                const modal = document.getElementById("successModalOverlay");
                if (modal) modal.style.display = "none";
                return; // Stop running here
            }

            // 2. Check if they clicked a "Watch Ad" button
            const adBtn = e.target.closest('.trigger-ad-modal-btn');
            if (!adBtn) return; // Ignore clicks on anything else

            e.preventDefault();

            // FORCE-CLOSE THE MOBILE DRAWER (If open)
            const drawer = document.querySelector('.mobile-drawer');
            const overlay = document.querySelector('.drawer-overlay');
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');

            // TRIGGER THE MODAL LOGIC
            const modal = document.getElementById("successModalOverlay");
            const stateVictory = document.getElementById("sm-state-victory");
            const stateAd = document.getElementById("sm-state-ad");
            const stateReward = document.getElementById("sm-state-reward");

            if(!modal || !stateAd) return;

            // Hide Victory and Reward screens, show Ad loader
            if(stateVictory) stateVictory.style.display = "none";
            if(stateReward) stateReward.style.display = "none";
            stateAd.style.display = "block";
            modal.style.display = "flex";

            // Simulate the 3-second ad
            setTimeout(() => {
                stateAd.style.display = "none";
                if(stateReward) stateReward.style.display = "block";

                // Boom! Calls the global function we just created above.
                window.fireConfetti(250, 1.2);
            }, 3000);
        });

});