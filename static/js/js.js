const pages = ["home", "about", "view", "create", "contact", "not"];
let curPage = 0; // Default index

window.addEventListener("load", function () {

    // --- BULLETPROOF NAV HIGHLIGHTER ---
    function updateNav() {
        // Get the current path, default to /home if at the root
        let currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "/index.html") {
            currentPath = "/home";
        }

        // Remove active class from all links
        $(".nav-link").removeClass("active");

        // Loop through and find the exact match
        $(".nav-link").each(function() {
            // Get the raw attribute (e.g. "/home")
            let linkPath = $(this).attr("href");
            if (linkPath === currentPath) {
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

            if (urlObj.searchParams.has("c")) {
                check = "view";
            } else if (check === "" || check === "index.html") {
                check = "home";
            }

            if (!pages.includes(check)) {
                check = "not";
            }

            history.replaceState(null, "", redirect);
            curPage = pages.indexOf(check);

            $(".fullPage").hide();
            $("#" + check).css("display", "flex").show();

            updateNav(check); // Update Nav on redirect load
        } else {
            let urlObj = new URL(location.href);
            let checkPage = "home"; // Default

            if (urlObj.searchParams.has("c")) {
                checkPage = "view";
            } else {
                // If we are explicitly on /create or /about, catch it here
                let ext = urlObj.pathname.split("/").pop().split("?")[0];
                if (pages.includes(ext) && ext !== "") checkPage = ext;
            }

            curPage = pages.indexOf(checkPage);
            $(".fullPage").hide();
            $("#" + checkPage).css("display", "flex").show();

            updateNav(checkPage); // Update Nav on normal load
        }
    })();

    window.onpopstate = function () {
        let urlObj = new URL(location.href);
        let ext = urlObj.pathname.split("/").pop().split("?")[0];

        if (urlObj.searchParams.has("c")) {
            ext = "view";
        } else if (ext === "" || ext === "index.html") {
            ext = "home";
        } else if (!pages.includes(ext)) {
            ext = "not";
        }

        loadPage(pages.indexOf(ext));
        updateNav(ext); // Update Nav on Back/Forward button press
    };

    $(".nav-link").on("click", function(e) {
        e.preventDefault();
        let target = $(this).attr("href").replace("/", "");

        if (pages.includes(target)) {
            history.pushState(null, "", "/" + target);
            loadPage(pages.indexOf(target));
            updateNav(target); // Update Nav when user clicks a button!
        } else {
            history.pushState(null, "", "/404");
            loadPage(pages.indexOf("not"));
        }
    });

    function loadPage(x) {
        if (x === curPage) return;

        let previousPage = curPage;
        curPage = x;

        $("#" + pages[previousPage]).stop(true, true).fadeOut("fast", function () {
            pages.forEach(p => {
                if (pages.indexOf(p) !== curPage) $("#" + p).hide();
            });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            $("#" + pages[curPage]).stop(true, true).css("display", "flex").hide().fadeIn("slow");
        });
    }

    // --- AD TOGGLE LOGIC ---
    const adToggle = document.getElementById("adToggleSwitch");

    // 1. Check if they have a saved preference (Default to true/ads on)
    let adsEnabled = localStorage.getItem("adsEnabled") !== "false";
    adToggle.checked = adsEnabled;

    // 2. Listen for them clicking the switch
    adToggle.addEventListener("change", function() {
        if (this.checked) {
            localStorage.setItem("adsEnabled", "true");
            // Logic to turn ads back on goes here later
            console.log("Ads are ON");
        } else {
            localStorage.setItem("adsEnabled", "false");
            // Logic to hide ads goes here later
            console.log("Ads are OFF");
        }
    });
});