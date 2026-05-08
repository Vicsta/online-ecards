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
    },
    "halloween": {
        title: "Spooky 3D Halloween E-Cards",
        text: "Send a terrifyingly fun, interactive 3D folding card.",
        image: "/static/assets/seo/spooky-hero.jpg"
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

        if (pageName === 'landing') {
            let pathSegments = window.location.pathname.split("/").filter(Boolean);
            let requestedTheme = pathSegments[pathSegments.length - 1];

            if (themeData[requestedTheme]) {
                document.title = themeData[requestedTheme].title;

                setTimeout(() => {
                    let titleEl = document.getElementById("landingTitle");
                    let textEl = document.getElementById("landingText");
                    let imgEl = document.getElementById("landingImage");
                    let btnEl = document.getElementById("landingCtaBtn");

                    if (titleEl) titleEl.innerText = themeData[requestedTheme].title;
                    if (textEl) textEl.innerText = themeData[requestedTheme].text;
                    if (imgEl) imgEl.src = themeData[requestedTheme].image;
                    if (btnEl) btnEl.href = APP_ROOT + "create?theme=" + requestedTheme;
                }, 50);
            }
        }

        if (pageName === 'create') {
            let editorDiv = document.getElementById("cardEditor");
            let params = new URLSearchParams(window.location.search);
            if ((editorDiv && editorDiv.style.display === "flex") || params.has("theme") || params.has("v")) {
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
            // Robust check for all standard themes
            let validThemes = ["dark", "custom", "birthday", "valentine", "thankyou", "goodluck", "getwell", "graduation", "halloween", "christmas", "easter", "newyear"];

            if (themeData[requestedTheme] || validThemes.includes(requestedTheme)) {
                localStorage.setItem("siteTheme", requestedTheme);
                let ts = document.getElementById("globalThemeSelector");
                let mts = document.getElementById("mobileThemeSelector");
                if (ts) ts.value = requestedTheme;
                if (mts) mts.value = requestedTheme;
                if (requestedTheme === "dark" || requestedTheme === "custom") {
                    document.body.removeAttribute("data-theme");
                } else {
                    document.body.setAttribute("data-theme", requestedTheme);
                }
                if (typeof AnimController !== "undefined" && AnimController.setTheme) {
                    AnimController.setTheme(requestedTheme);
                }
            }
        }

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

    // --- UPDATED: BULLETPROOF CLICK LISTENER INCLUDING GALLERY LINKS ---
    $("body").on("click", "a.nav-link, a.seo-link, a.gallery-link", function(e) {
        let targetHref = $(this).attr("href");

        if(targetHref.startsWith("http")) return;

        e.preventDefault();

        let cleanTarget = targetHref;
        if (cleanTarget.startsWith(APP_ROOT)) cleanTarget = cleanTarget.replace(APP_ROOT, "");
        if (cleanTarget.startsWith("/")) cleanTarget = cleanTarget.substring(1);

        let routePath = cleanTarget.split("?")[0];
        let baseRoute = routePath.split("/")[0];

        if (baseRoute === "theme") {
            history.pushState(null, "", APP_ROOT + cleanTarget);
            loadPage(pages.indexOf("landing"));
            $(".nav-link").removeClass("active");

        } else if (pages.includes(routePath)) {
            history.pushState(null, "", APP_ROOT + cleanTarget);

            if (cleanTarget.includes("?theme=")) {
                let themeVal = cleanTarget.split("?theme=")[1].split("&")[0];
                let validThemes = ["dark", "custom", "birthday", "valentine", "thankyou", "goodluck", "getwell", "graduation", "halloween", "christmas", "easter", "newyear"];

                if (themeData[themeVal] || validThemes.includes(themeVal)) {
                    localStorage.setItem("siteTheme", themeVal);
                    let ts = document.getElementById("globalThemeSelector");
                    let mts = document.getElementById("mobileThemeSelector");
                    if (ts) ts.value = themeVal;
                    if (mts) mts.value = themeVal;

                    if (themeVal === "dark" || themeVal === "custom") {
                        document.body.removeAttribute("data-theme");
                    } else {
                        document.body.setAttribute("data-theme", themeVal);
                    }

                    if (typeof AnimController !== "undefined" && AnimController.setTheme) {
                        AnimController.setTheme(themeVal);
                    }
                }
            }

            loadPage(pages.indexOf(routePath));
            updateNav(routePath);

            // --- NEW: FORCE CREATE.JS TO WAKE UP ---
            if (routePath === "create" && typeof initCreateFlow === "function") {
                initCreateFlow();
            }

        } else {
            history.pushState(null, "", APP_ROOT + "404");
            loadPage(pages.indexOf("not"));
        }
    });

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

        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.drawer-overlay');
        if (drawer) drawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        const modal = document.getElementById("successModalOverlay");
        const stateVictory = document.getElementById("sm-state-victory");
        const stateAd = document.getElementById("sm-state-ad");
        const stateReward = document.getElementById("sm-state-reward");

        if(!modal || !stateAd) return;

        if(stateVictory) stateVictory.style.display = "none";
        stateAd.style.display = "none";
        if(stateReward) stateReward.style.display = "block";
        modal.style.display = "flex";

        const fireRewardOnReturn = () => {
            if (!document.hidden) {
                window.fireConfetti(300, 1.5);
                document.removeEventListener("visibilitychange", fireRewardOnReturn);
            }
        };

        document.addEventListener("visibilitychange", fireRewardOnReturn);
    });
});