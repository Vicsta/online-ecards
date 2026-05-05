const themeData = {
    "birthday": {
        title: "Free 3D Birthday E-Cards",
        text: "Customize colors, text, and add confetti to the perfect digital birthday card.",
        image: "/static/assets/seo/birthday-hero.jpg" // IMPORTANT: Generate an image in ComfyUI and put it here!
    },
    "valentine": {
        title: "Custom Valentine's Day E-Cards",
        text: "Send a romantic, interactive 3D folding card to your partner.",
        image: "/static/assets/seo/valentine-hero.jpg"
    }
};

const getAppRoot = () => {
    let cleanUrl = window.location.href.split('?')[0];
    if (cleanUrl.includes("online-e-card/")) {
        return new URL(cleanUrl.split("online-e-card/")[0] + "online-e-card/").pathname;
    }
    return "/";
};

const APP_ROOT = getAppRoot();

(function injectBaseTag() {
    let baseTag = document.querySelector('base') || document.createElement('base');
    baseTag.href = APP_ROOT;
    document.head.appendChild(baseTag);
})();

// NEW: Added "landing" to the official pages array
const pages = ["home", "about", "view", "create", "contact", "landing", "not"];
let curPage = 0;

const seoTitles = {
    "home": "Free 3D Online E-Card Maker | Custom Greeting Cards",
    "create": "Create 3D E-Cards Free | Custom Greeting Maker",
    "view": "View Your 3D E-Card | Online Greeting",
    "about": "About | Online E-Cards Tool",
    "contact": "Contact Us | Online E-Cards",
    "landing": "Free Custom E-Cards | Online Greeting Builder",
    "not": "Page Not Found | Online E-Cards"
};

window.addEventListener("load", function () {

    function updateAppState(pageName) {
        console.log("Current Page:", pageName);
        document.body.setAttribute('data-current-page', pageName);
        document.body.setAttribute('data-editor-active', 'false');

        if (seoTitles[pageName]) {
            document.title = seoTitles[pageName];
        }

        // --- NEW: LANDING PAGE DATA INJECTION ---
        // If the router opens the landing page, inject the data immediately!
        if (pageName === 'landing') {
            let pathSegments = window.location.pathname.split("/").filter(Boolean);
            let requestedTheme = pathSegments[pathSegments.length - 1]; // Grabs "birthday" from "/theme/birthday"

            if (themeData[requestedTheme]) {
                document.title = themeData[requestedTheme].title; // Perfect SEO override

                // Slight delay to ensure the HTML div is fully loaded before replacing text
                setTimeout(() => {
                    let titleEl = document.getElementById("landingTitle");
                    let textEl = document.getElementById("landingText");
                    let imgEl = document.getElementById("landingImage");
                    let btnEl = document.getElementById("landingCtaBtn");

                    if (titleEl) titleEl.innerText = themeData[requestedTheme].title;
                    if (textEl) textEl.innerText = themeData[requestedTheme].text;
                    if (imgEl) imgEl.src = themeData[requestedTheme].image;

                    // Set the button to link right to the builder with the theme selected!
                    if (btnEl) btnEl.href = APP_ROOT + "create?theme=" + requestedTheme;
                }, 50);
            }
        }

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

    function updateNav(currentPathCheck) {
        let currentPath = window.location.pathname.replace(APP_ROOT, "");
        if (currentPath === "" || currentPath.includes("index.html")) currentPath = "home";
        if (currentPath.endsWith("/")) currentPath = currentPath.slice(0, -1);

        $(".nav-link").removeClass("active");
        $(".nav-link").each(function() {
            let linkTarget = $(this).attr("href").replace("/", "");
            if (linkTarget === currentPath || linkTarget === currentPathCheck) {
                $(this).addClass("active");
            }
        });
    }

    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;

        let activeUrlObj = redirect ? new URL(redirect) : new URL(location.href);
        let checkPage = "home";

        if (activeUrlObj.searchParams.has("theme")) {
            let requestedTheme = activeUrlObj.searchParams.get("theme");
            if (themeData[requestedTheme] || requestedTheme === "dark") {
                localStorage.setItem("siteTheme", requestedTheme);
                let ts = document.getElementById("globalThemeSelector");
                let mts = document.getElementById("mobileThemeSelector");
                if (ts) ts.value = requestedTheme;
                if (mts) mts.value = requestedTheme;
                if (requestedTheme === "dark") {
                    document.body.removeAttribute("data-theme");
                } else {
                    document.body.setAttribute("data-theme", requestedTheme);
                }
                if (typeof AnimController !== "undefined" && AnimController.setTheme) {
                    AnimController.setTheme(requestedTheme);
                }
            }
        }

        // --- NEW: URL INTERCEPTOR FOR LANDING PAGES ---
        if (redirect) {
            if (activeUrlObj.pathname.includes("/theme/")) {
                checkPage = "landing";
            } else {
                checkPage = activeUrlObj.pathname.split("/").pop().split("?")[0];
                if (activeUrlObj.searchParams.has("c")) checkPage = "view";
                else if (checkPage === "" || checkPage === "index.html") checkPage = "home";
                if (!pages.includes(checkPage)) checkPage = "not";
            }
            history.replaceState(null, "", redirect);
        } else {
            if (activeUrlObj.pathname.includes("/theme/")) {
                checkPage = "landing";
            } else if (activeUrlObj.searchParams.has("c")) {
                checkPage = "view";
            } else {
                checkPage = activeUrlObj.pathname.split("/").pop().split("?")[0];
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

    window.onpopstate = function () {
        let urlObj = new URL(location.href);
        let ext = urlObj.pathname.split("/").pop().split("?")[0];

        if (urlObj.pathname.includes("/theme/")) ext = "landing";
        else if (urlObj.searchParams.has("c")) ext = "view";
        else if (ext === "" || ext === "index.html") ext = "home";
        else if (!pages.includes(ext)) ext = "not";

        loadPage(pages.indexOf(ext));
        updateNav(ext);
    };

    // --- NEW: BULLETPROOF CLICK LISTENER ---
    $("body").on("click", "a.nav-link, a.seo-link", function(e) {
        let targetHref = $(this).attr("href");

        // Ignore external links
        if(targetHref.startsWith("http")) return;

        e.preventDefault();

        // Clean the path to prevent localhost folder escaping
        let cleanTarget = targetHref;
        if (cleanTarget.startsWith(APP_ROOT)) cleanTarget = cleanTarget.replace(APP_ROOT, "");
        if (cleanTarget.startsWith("/")) cleanTarget = cleanTarget.substring(1);

        // STRIP THE QUERY PARAMETERS SO THE ROUTER CAN READ THE PAGE NAME
        let routePath = cleanTarget.split("?")[0];
        let baseRoute = routePath.split("/")[0]; // gets "theme" or "home"

        if (baseRoute === "theme") {
            history.pushState(null, "", APP_ROOT + cleanTarget);
            loadPage(pages.indexOf("landing"));
            $(".nav-link").removeClass("active");

        } else if (pages.includes(routePath)) {
            // Push the full URL (including the ?theme= part) to the browser
            history.pushState(null, "", APP_ROOT + cleanTarget);

            // --- INSTANT THEME APPLICATION ---
            // If they clicked a link with a theme, apply it right now before the page even loads!
            if (cleanTarget.includes("?theme=")) {
                let themeVal = cleanTarget.split("?theme=")[1];
                if (themeData[themeVal] || themeVal === "dark") {
                    localStorage.setItem("siteTheme", themeVal);
                    let ts = document.getElementById("globalThemeSelector");
                    let mts = document.getElementById("mobileThemeSelector");
                    if (ts) ts.value = themeVal;
                    if (mts) mts.value = themeVal;

                    if (themeVal === "dark") {
                        document.body.removeAttribute("data-theme");
                    } else {
                        document.body.setAttribute("data-theme", themeVal);
                    }

                    if (typeof AnimController !== "undefined" && AnimController.setTheme) {
                        AnimController.setTheme(themeVal);
                    }
                }
            }

            // Load the actual page (e.g., 'create')
            loadPage(pages.indexOf(routePath));
            updateNav(routePath);

        } else {
            history.pushState(null, "", APP_ROOT + "404");
            loadPage(pages.indexOf("not"));
        }
    });

    // Handle the Start Creating Now button dynamically
    $("body").on("click", "#emptyStateCreateBtn", function(e) {
        e.preventDefault();
        history.pushState(null, "", APP_ROOT + "create");
        loadPage(pages.indexOf("create"));
        updateNav("create");
    });

    function loadPage(x) {
        if (x === curPage) return;
        let previousPage = curPage;
        curPage = x;

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

    const toggleSwitch = document.getElementById("supportToggleSwitch");
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
            if(toggleSwitch) toggleSwitch.checked = isEnabled;
            if(mobileToggleSwitch) mobileToggleSwitch.checked = isEnabled;
        };
        toggleSwitch.addEventListener("change", toggleHandler);
        if(mobileToggleSwitch) mobileToggleSwitch.addEventListener("change", toggleHandler);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetHref = link.getAttribute('href');
            const desktopLink = document.querySelector(`.nav-link[href="${targetHref}"]`);
            if (desktopLink) desktopLink.click();

            const drawer = document.querySelector('.mobile-drawer');
            const overlay = document.querySelector('.drawer-overlay');
            if (drawer) drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        });
    });

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

    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-modal-btn')) {
            const modal = document.getElementById("successModalOverlay");
            if (modal) modal.style.display = "none";
            return;
        }

        const adBtn = e.target.closest('.trigger-ad-modal-btn');
        if (!adBtn) return;

        console.log("THE BUTTON WAS CLICKED!");

        e.preventDefault();

        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.drawer-overlay');
        if (drawer) drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        const modal = document.getElementById("successModalOverlay");
        const stateVictory = document.getElementById("sm-state-victory");
        const stateAd = document.getElementById("sm-state-ad");
        const stateReward = document.getElementById("sm-state-reward");

        if(!modal || !stateAd) return;

        // --- NEW MONETIZATION LOGIC ---

        // 1. Open the Monetag Direct Link in a new tab to get paid
        window.open("https://omg10.com/4/10964964", "_blank");

        // 2. Set up the UI for when they return
        if(stateVictory) stateVictory.style.display = "none";
        stateAd.style.display = "none";
        if(stateReward) stateReward.style.display = "block";
        modal.style.display = "flex";

        // 3. The Magic: Wait for them to come back before firing confetti!
        const fireRewardOnReturn = () => {
            if (!document.hidden) {
                // They are back! Blast the confetti!
                window.fireConfetti(300, 1.5);
                // Remove the listener so it doesn't fire every time they switch tabs
                document.removeEventListener("visibilitychange", fireRewardOnReturn);
            }
        };

        // Attach the listener
        document.addEventListener("visibilitychange", fireRewardOnReturn);
    });
});