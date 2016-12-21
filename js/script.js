$(document).ready( function() {
    //Hide the NoScript fallback content.
    $(".noscript-only").prop("hidden", true);

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

    //Hide all the panels, then show the panel corresponding to the URL hash.
    //Defaults to the item from the first link if there is no hash.
    $(".content-container").children().prop("hidden", true);
    var initialShow;
    if (window.location.hash) {
        initialShow = $(".navigation-list a[href=\"" + window.location.hash + "\"]").attr("data-show");
    } else {
        initialShow = $(".navigation-list a").first().attr("data-show");
    }
    $(initialShow).prop("hidden", false);

    //Add click events to all the navigation links (including the ones in the body).
    $("a[data-show]").click(function(e) {
        //Show the corresponding panel.
        $(".content-container").children().prop("hidden", true);
        $($(e.target).attr("data-show")).prop("hidden", false);
        //Update the URL to match the hash from the link.
        history.replaceState(
            null,
            document.title,
            window.location.pathname + $(e.target).attr("href")
        );
        e.preventDefault();
    });

    //Load the last commit info from the GitHub API.
    $.ajax({
        url: "https://api.github.com/repos/connor-bracewell/nnorco/commits?path=index.html",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            var commit = data[0];
            var shaElement = $("#commit-sha");
            shaElement.text(commit.sha.substring(0,7));
            shaElement.attr("href", commit.html_url);
            var commitDate = new Date(commit.commit.committer.date);
            var commitMonth = commitDate.getMonth() + 1;
            var commitPaddedMonth = (commitMonth < 10 ? "0" : "") + commitMonth;
            $("#commit-date").text(commitPaddedMonth + "/" + commitDate.getFullYear());
            $(".last-commit-info").prop("hidden", false);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".fetch-failed-message").prop("hidden", false);
        }  
    });
});
