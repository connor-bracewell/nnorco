$(document).ready( function() {
	//hide all the content containers
	$(".content-container").children().addClass("hidden");

	//update all the container IDs (so they don't match the passed hashes anymore)
	$(".navigation-list a").each(function(){
		target = $(this);
		$(target.attr("href")).attr("id",target.attr("data-show").substring(1));
	});

	//show the panel corresponding to the passed hash (default to first item)
	initialShow = $(".navigation-list a").first().attr("data-show");
	if (window.location.hash.length != "") {
		initialShow = $(".navigation-list a[href=\"" + window.location.hash + "\"]").attr("data-show");
	}
	$(initialShow).removeClass("hidden");

	//hide the fallback headers
	$(".fallback-header").each(function(){ $(this).addClass("hidden"); });

	//add click events to all the panel links
	$("a[data-show]").click( function(e) {
		$(".content-container").children().addClass("hidden");
		$($(e.target).attr("data-show")).removeClass("hidden");
		history.replaceState(
			null,
			document.title,
			window.location.pathname + $(e.target).attr("href")
		);
		e.preventDefault();
	});
});
