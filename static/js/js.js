const pages = ["about", "view", "home", "not", "create"];
// Set default starting page index to 'home' (which is index 2)
let curPage = 2;

window.addEventListener("load", function () {

    // 1. Handle Initial Load / Redirects
    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;

        let targetUrl = redirect ? redirect : location.href;

        if (targetUrl !== location.href || redirect) {
            let urlObj = new URL(targetUrl);
            let check = urlObj.pathname.split("/").pop().split("?")[0];

            // --- NEW MAGIC RULE ---
            // If the URL contains our card data parameter, force it to the View page!
            if (urlObj.searchParams.has("c")) {
                check = "view";
            }
            // Otherwise, apply the normal default logic
            else if (check === "" || check === "index.html") {
                check = "home";
            }

            if (!pages.includes(check)) {
                check = "not";
                redirect = "/404";
            }

            history.replaceState(null, "", targetUrl);
            curPage = pages.indexOf(check);
            $("#" + check).css("display", "flex").hide().fadeIn("slow");

        } else {
            // Check for the 'c' parameter on standard loads too (for localhost testing)
            let urlObj = new URL(location.href);
            if (urlObj.searchParams.has("c")) {
                curPage = pages.indexOf("view");
                $("#view").css("display", "flex").hide().fadeIn("slow");
            } else {
                $("#home").css("display", "flex").hide().fadeIn("slow");
            }
        }
    })();

    // 2. Handle Back/Forward Buttons
    window.onpopstate = function () {
        let urlObj = new URL(location.href);
        let ext = urlObj.pathname.split("/").pop().split("?")[0];

        if (ext === "" || ext === "index.html") {
            ext = "home";
        } else if (!pages.includes(ext)) {
            ext = "not";
        }

        loadPage(pages.indexOf(ext));
    };

    // 3. Handle Navigation Clicks (NEW - Prevents server 404s)
    // Add a class like "nav-link" to your anchor tags: <a href="/home" class="nav-link">Home</a>
    $(".nav-link").on("click", function(e) {
        e.preventDefault(); // STOP the browser from asking the server for a new page

        // Get the intended destination from the href
        let target = $(this).attr("href").replace("/", "");

        if (pages.includes(target)) {
            // Update the URL bar without reloading
            history.pushState(null, "", "/" + target);
            loadPage(pages.indexOf(target));
        } else {
            history.pushState(null, "", "/404");
            loadPage(pages.indexOf("not"));
        }
    });

    // 4. Page Transition Logic
    function loadPage(x) {
        // Prevent doing anything if we click the page we are already heading to
        if (x === curPage) return;

        let previousPage = curPage; // Remember what we are leaving
        curPage = x; // Update the state IMMEDIATELY so rapid clicks don't confuse the logic

        // .stop(true, true) instantly halts any ongoing animations on the old page
        $("#" + pages[previousPage]).stop(true, true).fadeOut("fast", function () {

            // Failsafe: Hide ALL pages except the one we want, just to clear the board
            // This prevents "ghost" pages if clicks happen impossibly fast
            pages.forEach(p => {
                if (pages.indexOf(p) !== curPage) {
                    $("#" + p).hide();
                }
            });

            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            // Stop animations on the NEW page and fade it in
            $("#" + pages[curPage]).stop(true, true).css("display", "flex").hide().fadeIn("slow");
        });
    }
});