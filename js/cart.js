var $user = ""; 

class CartItem {
    constructor(json, is_cake) {
        this.id = json.id; 
        this.name = json.name; 
        if (is_cake) {
            //this.quantity = json.
        }
        else {
            this.quantity = json.quantity; 
        }
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
        var $price_text; 
        $price_text = $("<p>", {text : "$" + ($price * this.quantity).toFixed(2) }); 
        //$price_text = $("<p>", {text : "$" + (cake_price(this.price, this.size) * this.quantity).toFixed(2)})
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

function cake_price(price_per_inch, size) {
    return price_per_inch * size * size; 
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
            //alert(json); 
            if (!json) {
                $("main").prepend($("<p>", {text : "Your cart is empty"})); 
                $("#place-order").remove(); 
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            cart = JSON.parse(json); 
            if (cart.items.length == 0 && cart.cakes.length == 0) {
                $("main").prepend($("<p>", {text : "Your cart is empty"})); 
                return;
            }
            for (var i in cart.items) {
                var item = new CartItem(cart.items[i], false); 
                $("#item-list").append(item.getHTML()); 
            }
            for (var i in cart.cakes) {
                var cake = new CartItem(cart.cakes[i], true); 
            }
            $("main").append($("<button>", {
                id : "place-order", 
                class : "ml-auto btn align-self-start btn-primary", 
                text : "Place Order"
            })); 
        }
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