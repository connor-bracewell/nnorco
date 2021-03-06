$(document).ready(function() {

    let menuUrl = "https://www.bin4burgerlounge.com/our-downtown-menu/";
    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/" + menuUrl,
        dataType: "html",
        crossDomain: true,
        success: writeData
    });

    function writeData(data, textStatus, jqXHR) {
        let root = $($.parseHTML(data));
        writeItem(root, "burger");
        writeItem(root, "appy", "salad");
        writeItem(root, "feature cocktail");
        writeItem(root, "dessert");
    }

    function writeItem(root, name, alt) {
        let itemElem = getItemElem(root, name);
        if (itemElem.length === 0 && alt !== undefined) {
            itemElem = getItemElem(root, alt);
        }
        name = name.replace(" ","");
        jQuery("#" + name + "_name").text(itemElem.find(".item-title").text());
        jQuery("#" + name + "_price").text(itemElem.find(".item-price").text());
        jQuery("#" + name + "_description").text(itemElem.find("p").text());
    }

    function getItemElem(root, name) {
        let itemElem = root.find(".slide-features .menu-item")
            .filter(function(index, elem) {
                let text = jQuery(elem).find(".item-label").first().text();
                return (text == name);
            }).first();
        return itemElem;
    }

});
