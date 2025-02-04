const pages = ["about", "view", "home", "not", "create"];
let curPage = 0;

window.addEventListener("load", function () {

    (function () {
        let redirect = sessionStorage.redirect;
        delete sessionStorage.redirect;
        console.log("in the load");
        console.log(redirect);
        console.log(location.href);
        if (redirect && redirect !== location.href) {
            if (redirect.substring(redirect.length - 1) === "/") {
                redirect = redirect.substring(0, redirect.length - 1);
            }

            console.log("inside redirect");
            console.log(redirect);

            let check = redirect.replace("https://online-ecards.com/", "");
            console.log("check " + check);
            if (pages.indexOf(check) < 0) {
                check = "not";
                redirect = "404"
            }
            history.replaceState(null, "", redirect);
            // document.getElementsByClassName(pages[curPage])[0].style.display = "none";
            // document.getElementsByClassName(check)[0].style.display = "block";
            curPage = pages.indexOf(check);
            loadPage(pages.indexOf(check))
        } else {
            $("#main").css("display", "flex").hide().fadeIn("slow", function () {});
        }
    })();

    window.onpopstate = function () {
        let toPage = location.href;
        let ext = toPage.replace("online-ecards.com", "");
        console.log("Ext is: " + ext);
        if (ext === "") {
            ext = "main";
        }
        if (ext === "404") {
            ext = "not";
        }
        loadPage(pages.indexOf(ext));
    };


    function loadPage(x) {
        console.log("loading page " + x);
        console.log($("#" + pages[curPage]));

        $("#" + pages[curPage]).fadeOut("slow", function () {
            // let $win = $(window);
            console.log("finished loading out " + curPage);
            document.body.scrollTop = 0; // For Chrome, Safari and Opera
            document.documentElement.scrollTop = 0; // For IE and Firefox
            $("#" + pages[x]).css("display", "flex").hide().fadeIn("slow", function () {
                console.log("finised loading in " + curPage);
                curPage = x;
            });
        });
    }



});