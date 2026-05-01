const pages = ["about", "view", "home", "not", "create"];
let curPage = 2; // Default to 'home'

window.addEventListener("load", function () {
    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;
    
        // Only attempt redirect if the session variable actually existed
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

            // Use the absolute redirect path
            history.replaceState(null, "", redirect);
            curPage = pages.indexOf(check);

            // Force hide all and only show the target
            $(".fullPage").hide();
            $("#" + check).css("display", "flex").show();
        } else {
            // Normal entry (home)
            let urlObj = new URL(location.href);
            if (urlObj.searchParams.has("c")) {
                curPage = pages.indexOf("view");
                $(".fullPage").hide();
                $("#view").css("display", "flex").show();
            } else {
                $(".fullPage").hide();
                $("#home").css("display", "flex").show();
            }
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
    };

    $(".nav-link").on("click", function(e) {
        e.preventDefault();
        let target = $(this).attr("href").replace("/", "");

        if (pages.includes(target)) {
            history.pushState(null, "", "/" + target);
            loadPage(pages.indexOf(target));
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