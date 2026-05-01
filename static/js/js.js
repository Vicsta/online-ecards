window.addEventListener("load", function () {

    // --- NEW: Helper function to manage the active button ---
    function updateNav(targetPage) {
        $(".nav-link").removeClass("active"); // Clear all
        $(`.nav-link[href='/${targetPage}']`).addClass("active"); // Highlight current
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
});