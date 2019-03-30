var $user = ""; 

class DessertItem  {
    constructor (json) { 
        this.id = json.id; 
        this.name = json.name; 
        this.file = json.file;
        this.description = json.description;
        this.price = json.price; 
        this.cake_id = json.cake_id; 
    }
    getHTML() {
        var $id = this.id; 
        var $name = this.name; 
        var $item = $("<li>", {class : "list-group-item"});
        var $container = $("<div>", { class : "d-flex flex-row"}); 
        $item.append($container); 
        $container.append($("<img>", {alt : "["+this.name+" image]", src : "../images/"+this.file, class : "dessert-item"}));
        var $in_container = $("<div>", {class : "d-flex flex-column full-width"}); 
        $in_container.append($("<p>", {text : this.name }));
        $in_container.append($("<p>", {text : this.description}));

        var $price_row = $("<div>", {class : "d-flex flex-row align-items-start"}); 
        var $price = this.price; 
        var $price_text = $("<p>", { text : "$" + this.price }); 
        $price_row.append($price_text); 
        var $quant_select = $("<select>"); 
        for (var i = 1; i <= 10; i++) {
            $quant_select.append($("<option>", {val : i, text : i.toString()})); 
        }
        $quant_select.change(function() {
            $price_text.text("$" + (parseFloat($price) * parseInt($(this).val(), 10)).toFixed(2)); 
        }); 
        $price_row.append($quant_select); 
        $in_container.append($price_row); 

        var $last_row = $("<div>", {class : "d-flex flex-row"}); 
        $last_row.append($("<button>", {text : "Add to cart", class : "btn float-left"}).click( function () {
            $.ajax({
                url : '../php/home.php',
                type : 'POST',
                data : { action : "add-cart", item : $id, quantity : $quant_select.val()}, 
                success : function (json) {
                    alert($name + " added to cart"); 
                }
            });
        }));
        $in_container.append($last_row); 
        $container.append($in_container); 
        return $item; 
    }
}

$(function() {
    $.ajax({
        url : '../php/home.php',
        type : 'POST',
        data : { action : "items"},
        success : function(json) {
            items = JSON.parse(json); 
            for (var i in items) {
                var item = new DessertItem(items[i]); 
                $("#item-list").append(item.getHTML()); 
            }
        }
    });
});