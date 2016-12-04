$(document).ready( function() {
    //hide fallback content and show script content
    $(".js-only").prop("hidden", false);
    $(".nojs-only").prop("hidden", true);

    //update all the container IDs (so they don't match the url hashes anymore)
    //ie. #resume becomes #panel-resume
    $(".navigation-list a").each(function(){
        var target = $(this);
        $(target.attr("href")).attr("id",target.attr("data-show").substring(1));
    });

    //hide all the panels, then show the panel corresponding to the url hash (default to first item)
    $(".content-container").children().prop("hidden", true);
    var initialShow;
    if (window.location.hash) {
        initialShow = $(".navigation-list a[href=\"" + window.location.hash + "\"]").attr("data-show");
    } else {
        initialShow = $(".navigation-list a").first().attr("data-show");
    }
    $(initialShow).prop("hidden", false);

    //add click events to all the navigation links
    $(".navigation-list a").click(function(e) {
        //show the corresponding panel
        $(".content-container").children().prop("hidden", true);
        $($(e.target).attr("data-show")).prop("hidden", false);
        //update the url
        history.replaceState(
            null,
            document.title,
            window.location.pathname + $(e.target).attr("href")
        );
        e.preventDefault();
    });

    //load the latest commit info from the github api
    $.ajax({
        url: "https://api.github.com/repos/connor-bracewell/nnorco/commits?path=index.html",
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
            var commit = data[0];
            var shaElement = $("#commit-sha");
            shaElement.text(commit.sha.substring(0,7));
            shaElement.attr("href", commit.html_url);
            var commitDate = new Date(commit.commit.committer.date);
            $("#commit-date").text((commitDate.getMonth()+1) + "/" + commitDate.getFullYear());
            $(".commit-failed-msg").prop("hidden", true);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $(".commit-live").prop("hidden", true);
        }  
    });
});
