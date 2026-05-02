const pages = ["home", "about", "view", "create", "contact", "not"];
let curPage = 0; // Default index

window.addEventListener("load", function () {

    // --- 1. THE STATE MANAGER (NEW) ---
    // This single function guarantees the body attributes are always correct
    function updateAppState(pageName) {
        console.log("--- STATE CHANGE ---");
        console.log("Current Page:", pageName);

        document.body.setAttribute('data-current-page', pageName);
        document.body.setAttribute('data-editor-active', 'false');

        // If we land on create, check if the editor should be active
        if (pageName === 'create') {
            let editorDiv = document.getElementById("cardEditor");
            let params = new URLSearchParams(window.location.search);

            // The ultimate truth: Is the editor div actually visible, OR does the URL ask for it?
            if ((editorDiv && editorDiv.style.display === "flex") || params.has("v")) {
                document.body.setAttribute('data-editor-active', 'true');
            }
        }

        let bannersEnabled = localStorage.getItem("bannersEnabled") !== "false";
        console.log("Support Banners Enabled:", bannersEnabled);
        updateBannerVisibility(bannersEnabled);
    }

    // --- 2. BULLETPROOF NAV HIGHLIGHTER ---
    function updateNav(currentPathCheck) {
        let currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "/index.html") currentPath = "/home";

        $(".nav-link").removeClass("active");

        $(".nav-link").each(function() {
            let linkPath = $(this).attr("href");
            if (linkPath === currentPath || linkPath === "/" + currentPathCheck) {
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
                let ext = urlObj.pathname.split("/").pop().split("?")[0];
                if (pages.includes(ext) && ext !== "") checkPage = ext;
            }
        }

        curPage = pages.indexOf(checkPage);

        // Trigger State Manager
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
            history.pushState(null, "", "/" + target);
            loadPage(pages.indexOf(target));
            updateNav(target);
        } else {
            history.pushState(null, "", "/404");
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
    const leftBanner = document.getElementById("supportBannerLeft");
    const rightBanner = document.getElementById("supportBannerRight");
    const mobileBanner = document.getElementById("supportBannerMobile");

    function updateBannerVisibility(isEnabled) {
        if (isEnabled) {
            document.body.classList.remove('support-hidden'); // Changed from ads-disabled
        } else {
            document.body.classList.add('support-hidden');    // Changed from ads-disabled
        }
    }

    if (toggleSwitch) {
        let bannersEnabled = localStorage.getItem("bannersEnabled") !== "false";
        toggleSwitch.checked = bannersEnabled;
        updateBannerVisibility(bannersEnabled);

        toggleSwitch.addEventListener("change", function() {
            let isEnabled = this.checked;
            localStorage.setItem("bannersEnabled", isEnabled ? "true" : "false");
            updateBannerVisibility(isEnabled);
        });
    }
});