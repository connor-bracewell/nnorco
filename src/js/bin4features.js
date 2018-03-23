$(document).ready(function() {

    var menuUrl = "https://www.bin4burgerlounge.com/our-downtown-menu/";
    $.ajax({
        url: "https://crossorigin.me/" + menuUrl,
        dataType: "html",
        crossDomain: true,
        success: writeData
    });

    function writeData(data, textStatus, jqXHR) {
        var root = $($.parseHTML(data));
        writeItem(root, "burger");
        writeItem(root, "appy");
        writeItem(root, "feature cocktail");
        writeItem(root, "dessert");
    }

    function writeItem(root, name) {
        var itemElem = root.find(".slide-features .menu-item")
            .filter(function(index, elem) {
                var text = jQuery(elem).find(".item-label").first().text();
                return (text == name);
            }).first();
        name = name.replace(" ","");
        jQuery("#" + name + "_name").text(itemElem.find(".item-title").text());
        jQuery("#" + name + "_price").text(itemElem.find(".item-price").text());
        jQuery("#" + name + "_description").text(itemElem.find("p").text());
    }

});
