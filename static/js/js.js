const pages = ["home", "about", "view", "create", "contact", "not"];
let curPage = 0; // Default index

window.addEventListener("load", function () {

    // --- BULLETPROOF NAV HIGHLIGHTER ---
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

    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;

        if (redirect) {
            let urlObj = new URL(redirect);
            let check = urlObj.pathname.split("/").pop().split("?")[0];
            if (urlObj.searchParams.has("c")) check = "view";
            else if (check === "" || check === "index.html") check = "home";
            if (!pages.includes(check)) check = "not";

            history.replaceState(null, "", redirect);
            curPage = pages.indexOf(check);

            // NEW: Set initial page state for Ad logic
            document.body.setAttribute('data-current-page', check);
            document.body.setAttribute('data-editor-active', "false");

            $(".fullPage").hide();
            $("#" + check).css("display", "flex").show();
            updateNav(check);
        } else {
            let urlObj = new URL(location.href);
            let checkPage = "home";

            if (urlObj.searchParams.has("c")) {
                checkPage = "view";
            } else {
                let ext = urlObj.pathname.split("/").pop().split("?")[0];
                if (pages.includes(ext) && ext !== "") checkPage = ext;
            }

            curPage = pages.indexOf(checkPage);

            // NEW: Set initial page state for Ad logic
            document.body.setAttribute('data-current-page', checkPage);
            document.body.setAttribute('data-editor-active', "false");

            $(".fullPage").hide();
            $("#" + checkPage).css("display", "flex").show();
            updateNav(checkPage);
        }
    })();

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

    function loadPage(x) {
        if (x === curPage) return;

        let previousPage = curPage;
        curPage = x;

        // NEW: Update body attributes for Ad routing
        document.body.setAttribute('data-current-page', pages[curPage]);
        document.body.setAttribute("data-editor-active", "false"); // Reset editor state

        $("#" + pages[previousPage]).stop(true, true).fadeOut("fast", function () {
            pages.forEach(p => {
                if (pages.indexOf(p) !== curPage) $("#" + p).hide();
            });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            $("#" + pages[curPage]).stop(true, true).css("display", "flex").hide().fadeIn("slow");
        });
    }

    // --- SAFE TOGGLE LOGIC ---
    const toggleSwitch = document.getElementById("supportToggleSwitch");
    const leftBanner = document.getElementById("supportBannerLeft");
    const rightBanner = document.getElementById("supportBannerRight");
    const mobileBanner = document.getElementById("supportBannerMobile");

    function updateBannerVisibility(isEnabled) {
        if (isEnabled) {
            if (leftBanner) { leftBanner.style.opacity = "1"; leftBanner.style.visibility = "visible"; }
            if (rightBanner) { rightBanner.style.opacity = "1"; rightBanner.style.visibility = "visible"; }
            if (mobileBanner) { mobileBanner.style.opacity = "1"; mobileBanner.style.visibility = "visible"; }
        } else {
            if (leftBanner) leftBanner.style.visibility = "hidden";
            if (rightBanner) rightBanner.style.visibility = "hidden";
            if (mobileBanner) mobileBanner.style.visibility = "hidden";
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