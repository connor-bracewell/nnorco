$(document).ready( function() {
	//show only the first content pane
	$(".content-container").children().addClass("hidden");
	$($(".navigation-list a").first().attr("data-show")).removeClass("hidden");
	
	//add click events to the navigation bar
	$(".navigation-list a").click( function(e) {
		$(".content-container").children().addClass("hidden");
		$($(e.target).attr("data-show")).removeClass("hidden");
		e.preventDefault();
	});
});