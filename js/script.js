$(document).ready( function() {
	//show only the selected (default first) content pane
	$(".content-container").children().addClass("hidden");
	initialShow = "";
	if (window.location.hash === "") {
		initialShow = $(".navigation-list a").first().attr("data-show");
	} else {
		initialShow = $(".navigation-list a[href=\"" + window.location.hash + "\"]").attr("data-show");
	}
	$(initialShow).removeClass("hidden");

	//hide the fallback headers
	$(".fallback-header").each(function(){ $(this).addClass("hidden"); });

	//add click events to the navigation bar
	$(".navigation-list a").click( function(e) {
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
