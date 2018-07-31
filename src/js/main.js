$(document).ready( function() {
    //Hide the NoScript fallback content.
    $(".noscript-only").hide();

    //Disable the direct image links used for NoScript.
    $(".img-directlink").click(function(e) {
        e.preventDefault();
    });

    //Update all the container IDs to match the data-show values instead of URL hashes.
    //ie. "#resume" has its ID set to "resume-panel"
    $(".navigation-list a").each(function(){
        var target = $(this);
        var urlHash = target.attr("href");
        var panelId = target.attr("data-show").substring(1);
        if (urlHash !== "#") {
            $(urlHash).attr("id", panelId);
        }
    });

    //Add click events to all the navigation links (including the ones in the body).
    $("a[data-show]").click(function(e) {
        //Show the corresponding panel.
        $(".content-container").children().hide();
        $($(e.target).attr("data-show")).show();
        //tag the current tab as open
        $(".open").removeClass("open");
        $(e.target).addClass("open");
        //Update the URL to match the hash from the link.
        history.replaceState(
            null,
            document.title,
            window.location.pathname + $(e.target).attr("href")
        );
        e.preventDefault();
    });

    //Hide all the panels, then show the panel corresponding to the URL hash.
    //Defaults to the item from the first link if there is no hash.
    $(".content-container").children().hide();
    var initialShow;
    if (window.location.hash) {
        initialShow = $(".navigation-list a[href=\"" + window.location.hash + "\"]");
    } else {
        initialShow = $(".navigation-list a").first()
    }
    initialShow.click();

    //Load the last commit info from the GitHub API.
    $.ajax({
        url: "https://api.github.com/repos/connor-bracewell/nnorco/commits?path=src/index.html",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            var commit = data[0];
            var shaEl = $("#commit-sha");
            shaEl.text(commit.sha.substring(0,7));
            shaEl.attr("href", commit.html_url);
            var commitDate = new Date(commit.commit.committer.date);
            var commitMonth = commitDate.getMonth() + 1;
            var commitPaddedMonth = (commitMonth < 10 ? "0" : "") + commitMonth;
            $("#commit-date").text(commitPaddedMonth + "/" + commitDate.getFullYear());
            $(".last-commit-info").show();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".fetch-failed-message").show();
        }  
    });

    //The lightbox element is referenced several times.
    var overlayEl = $(".lightbox-overlay");
    var imageEl = $(".lightbox-image");

    function ignoreBubble(f) {
        function impl(e) {
            if (e.target == this) {
                f(e);
            }
        }
        return impl;
    }

    //Resizes the open lightbox to fill the lightbox container as much as possible.
    function resizeLightbox() {
        if (overlayEl.is(":visible")) {
            var boundEl = $(".lightbox-overlay");
            var contentEl = $(".lightbox-content");
            var boundX = boundEl.width();
            var boundY = boundEl.height();
            var boundR = boundX / boundY;
            var imageX = imageEl.get(0).naturalWidth;
            var imageY = imageEl.get(0).naturalHeight;
            var imageR = imageX / imageY;
            var contentX;
            var contentY;
            if (imageR <= boundR) {
                contentY = Math.min(boundY, imageY);
                contentX = contentY * imageR;
            } else {
                contentX = Math.min(boundX, imageX);
                contentY = contentX / imageR;
            }
            var contentPadX = (boundX-contentX)/2;
            var contentPadY = (boundY-contentY)/2;
            contentEl.width(contentX);
            contentEl.height(contentY);
            contentEl.css("margin", contentPadY + "px " + contentPadX + "px");
        }
    }

    //Set the lightbox to resize when the window is.
    $(window).resize(resizeLightbox);

    //Onclick function to show the lightbox.
    function showLightbox(imageSrc, imageAlt) {
        //Create a new image to load asynchronously.
        var asyncImage = new Image();
        //Set the image to show when done loading
        asyncImage.onload = function() {
            imageEl.attr("src", imageSrc);
            imageEl.attr("alt", imageAlt);
            overlayEl.show();
            resizeLightbox();
        }
        //Set src to start the download.
        asyncImage.src = imageSrc;
    }

    //Set the lightbox to close when clicked
    overlayEl.click(function(e) {
        overlayEl.hide();
    });

    //Set the lightbox to open with the clicked-on project image.
    $(".lightbox-source").click(function() {
        var sourceEl = $(this);
        var imageSrc = sourceEl.attr("data-fullsize-src");
        var imageAlt = sourceEl.attr("alt");
        showLightbox(imageSrc, imageAlt);
    });
});
