var $user = ""; 

class CartItem {
    constructor(json) {
        this.id = json.id; 
        this.name = json.name; 
        this.quantity = json.quantity; 
        this.description = json.description; 
        this.price = json.price; 
    }
    getHTML() {
        var $id = this.id
        var $item = $("<li>", {class : "list-group-item"});
        var $container = $("<div>", {class : "d-flex flex-column full-width"}); 
        $container.append($("<p>", {text : this.name }));
        $container.append($("<p>", {text : this.description}));
        $item.append($container);

        var $price_row = $("<div>", {class : "d-flex flex-row align-items-start"}); 
        var $price = this.price; 
        var $price_text = $("<p>", { text : "$" + (this.price * this.quantity).toFixed(2) }); 
        $price_row.append($price_text); 
        var $quant_select = $("<select>"); 
        for (var i = 1; i <= 10; i++) {
            $quant_select.append($("<option>", {val : i, text : i.toString()})); 
        }
        $quant_select.val(this.quantity); 
        $quant_select.change(function() {
            update_cart($id, $(this).val()); 
            $price_text.text("$" + (parseFloat($price) * parseInt($(this).val(), 10)).toFixed(2)); 
        }); 
        $price_row.append($quant_select); 
        $price_row.append($("<button>", {class : "btn", text : "Remove"}).click( function() {
            update_cart($id, 0); 
            $item.remove(); 
        })); 
        $container.append($price_row);

        return $item;
    }
}

function update_cart(item, quantity) {
    $.ajax({
        url : '../php/cart.php',
        type : 'POST', 
        data : { action : "update-cart", item : item, quantity : quantity}, 
        success : function () {

        }
    });
}

$(function() {
    $.ajax({
        url : '../php/cart.php',
        type : 'POST',
        data : { action : "items"},
        success : function(json) {
            if (!json) {
                $("main").prepend($("<p>", {text : "Your cart is empty"})); 
                $("#place-order").remove(); 
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            items = JSON.parse(json); 
            if (items.length == 0) {
                $("main").prepend($("<p>", {text : "Your cart is empty"})); 
                return;
            }
            for (var i in items) {
                var item = new CartItem(items[i]); 
                $("#item-list").append(item.getHTML()); 
            }
        }
    });
    $("#logout").click( function() {
        $.ajax({
            url : '../php/cart.php',
            type : 'POST',
            data : { action : "logout"},
            success : function() {
                window.location.replace("../login/login.html");
            }
        }); 
    });

    $("#place-order").click( function() {
        $.ajax({
            url : '../php/cart.php',
            type : 'POST', 
            data : {action : "order", total : 0.0},
            success : function(result) {
                if (result) {
                    alert(result); 
                }
                else {
                    window.location.replace("../home/home.html")
                }
            }
        });
    });
});