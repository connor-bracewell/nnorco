let params = new URLSearchParams(window.location.search);

if (!params.has("noscript")) { // Emulate noscript behavior if requested.

$(document).ready(function() {

    // Hide fallback content and show script-only content.
    $(".noscript-only").hide();
    $(".script-only").show();

    // Disable direct image links used for NoScript.
    $(".img-directlink").click(function(e) {
        e.preventDefault();
    });

    // Apply light theme if requested.
    if (params.has("light")) {
        $("body").addClass("light");
    }

    // Update all the container IDs to match the data-show values instead of URL hashes.
    // eg. "#resume" has its ID set to "resume-panel"
    $(".navigation-list a").each(function(){
        let target = $(this);
        let urlHash = target.attr("href");
        let panelId = target.attr("data-show").substring(1);
        //the main tab uses an empty hash for noscript reasons, so this approach doesn't work.
        //its panel should simply start with the "-panel" name applied.
        if (urlHash !== "#") {
            $(urlHash).attr("id", panelId);
        }
    });

    // Add click events to all the navigation links (including the ones in the body).
    $("a[data-show]").click(e => {
        e.preventDefault();
        let clicked = $(e.target);
        // Show only the corresponding panel.
        let show_selector = clicked.attr("data-show");
        $(".content-panel").hide();
        $(show_selector).show();
        // Tag only the current tab as open.
        $(".open").removeClass("open");
        clicked.addClass("open");
        // Update the URL to match the hash from the link.
        let hash = clicked.attr("href");
        if (hash === "#") {
            hash = "";
        }
        history.replaceState(
            null,
            document.title,
            window.location.pathname + window.location.search + hash
        );
    });

    // Don't show focus styles for nav links that are clicked on.
    $(".navigation-list a").mousedown(e => {
        let clicked = $(e.target);
        let click_time = e.timeStamp;
        clicked.addClass("hide-focus");
        clicked.addClass("just-clicked");
        clicked.attr("data-last-clicked", click_time);
        setTimeout(() => {
            if (clicked.attr("data-last-clicked") === click_time.toString()) {
                clicked.removeClass("just-clicked")
            }
        }, 50);
    });

    // Remove the hide-focus class when a nav link regains focus.
    // (Unless it is being focused from _just_ being clicked; see above).
    $(".navigation-list a").focus(e => {
        let focused = $(e.target);
        if (!focused.hasClass("just-clicked")) {
            focused.removeClass("hide-focus");
        }
    });

    // Hide all the panels, then show the panel corresponding to the URL hash.
    // Defaults to the item from the first link if there is no hash.
    $(".content-panel").hide();
    let initialShowLink = $(".navigation-list a[href=\"" + window.location.hash + "\"]");
    if (initialShowLink.length === 0) {
        initialShowLink = $(".navigation-list a").first()
    }
    initialShowLink.click();

    // Load the last commit info from the GitHub API.
    // This has been disabled in favor of setting at build time.
    /*
    $.ajax({
        url: "https://api.github.com/repos/connor-bracewell/nnorco/commits",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            let commit = data[0];
            let shaEl = $("#commit-sha");
            shaEl.text(commit.sha.substring(0,7));
            shaEl.attr("href", commit.html_url);
            let commitDate = new Date(commit.commit.committer.date);
            let commitMonth = commitDate.getMonth() + 1;
            let commitPaddedMonth = (commitMonth < 10 ? "0" : "") + commitMonth;
            $("#commit-date").text(commitPaddedMonth + "/" + commitDate.getFullYear());
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".last-commit-info").hide();
            $(".fetch-failed-message").show();
        }  
    });
    */

    // Give the lightbox elements a name since they are used multiple times.
    let overlayEl = $(".lightbox-overlay");

    function ignoreBubble(f) {
        function impl(e) {
            if (e.target == this) {
                f(e);
            }
        }
        return impl;
    }

    // Resize the open lightbox to fill the lightbox container as much as possible.
    function resizeLightbox() {
        if (overlayEl.is(":visible")) {
            let boundEl = $(".lightbox-overlay");
            let contentEl = $(".lightbox-content");
            let boundX = boundEl.width();
            let boundY = boundEl.height();
            let boundR = boundX / boundY;
            let imageEl = $(".lightbox-image:visible").get(0) as HTMLImageElement;
            let imageX = imageEl.naturalWidth;
            let imageY = imageEl.naturalHeight;
            let imageR = imageX / imageY;
            let contentX;
            let contentY;
            if (imageR <= boundR) {
                contentY = Math.min(boundY, imageY);
                contentX = contentY * imageR;
            } else {
                contentX = Math.min(boundX, imageX);
                contentY = contentX / imageR;
            }
            let contentPadX = (boundX-contentX)/2;
            let contentPadY = (boundY-contentY)/2;
            contentEl.width(contentX);
            contentEl.height(contentY);
            contentEl.css("margin", contentPadY + "px " + contentPadX + "px");
        }
    }

    // Set the lightbox to resize whenever the window is resized.
    $(window).resize(resizeLightbox);

    // Show the lightbox after the image loads.
    function showLightbox(imageSrc, imageAlt) {
        let imageEl = new Image();
        imageEl.src = imageSrc;
        imageEl.alt = imageAlt;
        imageEl.classList.add("lightbox-image");
        imageCache[imageSrc] = $(imageEl);
        $(".lightbox-content").append(imageEl);
        if (typeof imageEl.decode === "function") {
            // Use `decode()` if available.
            imageEl.decode().then(function() {
                overlayEl.show();
                resizeLightbox();
            });
        } else {
            // Otherwise fallback to `onload`
            imageEl.onload = function() {
                overlayEl.show();
                resizeLightbox();
            }
        }
    }

    // Set the lightbox to close when clicked.
    overlayEl.click(function(e) {
        overlayEl.hide();
    });

    // Cache lightbox image elements to prevent further requests eg. in Chrome.
    let imageCache = {};

    // Set the lightbox to open with the clicked-on project image.
    $(".lightbox-source").click(function() {
        $(".lightbox-image").hide();
        let sourceEl = $(this);
        let imageSrc = sourceEl.attr("data-fullsize-src");
        if (imageCache[imageSrc]) {
            // Use cached image
            imageCache[imageSrc].show();
            overlayEl.show();
            resizeLightbox();
        } else {
            let imageAlt = sourceEl.attr("alt");
            showLightbox(imageSrc, imageAlt);
        }
    });

});

}
