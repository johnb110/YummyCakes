var $user = ""; 

class CartItem {
    constructor(json, is_cake) {
        this.id = json.id; 
        this.name = json.name; 
        if (is_cake) {
            this.sizes = json.sizes;
        }
        else {
            this.quantity = json.quantity; 
        }
        this.description = json.description; 
        this.price = json.price; 
        this.is_cake = is_cake; 
    }
    getHTML() {
        var $id = this.id
        var $item = $("<li>", {class : "list-group-item", id : $id.toString()});
        var $container = $("<div>", {class : "d-flex flex-column full-width"}); 
        $container.append($("<h5>", {text : this.name }));
        $container.append($("<p>", {text : this.description}));
        $item.append($container);
        if (this.is_cake) {
            var sizes = this.sizes; 
            var price_per_inch = this.price;  
            Object.keys(sizes).forEach(function(size) {
                var quantity = sizes[size]; 
                var price = cake_price(price_per_inch, size); 
                var $price_row = add_price_row($id, price, quantity, size); 
                $container.append($price_row); 
            });
        }
        else {
            var $price_row = add_price_row(this.id, this.price, this.quantity); 
            $container.append($price_row);
        }
        //$price_text = $("<p>", {text : "$" + (cake_price(this.price, this.size) * this.quantity).toFixed(2)})

        return $item;
    }
}

function add_price_row(id, price, quantity, size=null) {
    var $price_row = $("<div>", {class : "container d-flex mr-3 flex-row align-items-start"}); 
    var $price_text = $("<label>", {class: "price mr-3 form-control", text : "$" + (price * quantity).toFixed(2) });
    $price_row.append($price_text); 
    if (size) {
        $price_row.append($("<label>", {class : "mr-3 form-control", text : "Size: " + size + "\""}));
    }
    var $quant_select = $("<select>", {class : "mr-3 form-control"}); 
    for (var i = 1; i <= 10; i++) {
        $quant_select.append($("<option>", {val : i, text : i.toString()})); 
    }
    $quant_select.val(quantity); 
    if (size) {
        $quant_select.change(function () {
            update_cake(id, size, $(this).val()); 
            $price_text.text("$" + (price * $(this).val()).toFixed(2)); 
            update_total(); 
        }); 
    }
    else {
        $quant_select.change(function() {
            update_cart(id, $(this).val()); 
            $price_text.text("$" + (price * $(this).val()).toFixed(2)); 
            update_total(); 
        }); 
    }
    $price_row.append($quant_select);
    if (size) {
        $price_row.append($("<button>", {class : "btn", text : "Remove"}).click( function() {
            update_cake(id, size, 0); 
            $price_row.remove();
            $item = $("#"+id); 
            update_total(); 
            if ($item.find("button").length == 0) {
                $item.remove(); 
                check_empty_cart(); 
            }
        }));
    }
    else {
        $price_row.append($("<button>", {class : "btn", text : "Remove"}).click( function() {
            update_cart(id, 0); 
            $("#"+id).remove(); 
            update_total(); 
            check_empty_cart(); 
        })); 
    }
    
    return $price_row; 
}

function check_empty_cart() {
    if ($("#item-list").find("li").length == 0) {
        $("#order-form").remove(); 
        $("main").prepend($("<p>", {text : "Your cart is empty! Go add some treats!"}));
        return true; 
    }
    return false; 
}

function cake_price(price_per_inch, size) {
    return price_per_inch * size * size; 
}

function update_cake(cake, size, quantity) {
    $.ajax({
        url : '../php/cart.php',
        type : 'POST',
        data : {action : "update-cake", cake : cake, size : size, quantity : quantity},
        success : function(result) {
            if (result) {
                alert(result); 
            }
        }
    }); 
}

function update_cart(item, quantity) {
    $.ajax({
        url : '../php/cart.php',
        type : 'POST', 
        data : { action : "update-cart", item : item, quantity : quantity}, 
        success : function (result) {
            if (result) {
                alert(result); 
            }
        }
    });
}

function update_total() {
    var total = 0; 
    console.log($("#price"));
    $(".price").each(function() {
        var price = parseFloat($(this).text().replace("$", "")); 
        total += price; 
    });
    $("#total").text("$" + total.toFixed(2)); 
}

$(function() {
    $.ajax({
        url : '../php/cart.php',
        type : 'POST',
        data : { action : "items"},
        success : function(json) {
            if (!json) {
                $("main").prepend($("<p>", {text : "Your cart is empty"})); 
                $("#order-form").remove(); 
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            cart = JSON.parse(json); 
            for (var i in cart.items) {
                var item = new CartItem(cart.items[i], false); 
                $("#item-list").append(item.getHTML()); 
            }
            for (var i in cart.cakes) {
                var cake = new CartItem(cart.cakes[i], true); 
                $("#item-list").append(cake.getHTML()); 
            }
            update_total();
            if (check_empty_cart()) {
                return; 
            }

            var auto_date = new Date();
            auto_date.setDate(auto_date.getDate() + 7); 
            var date_str = auto_date.toISOString().substr(0, 10); 
            $("#order-form").find("input").val(date_str); 

            $("#order-form").submit(function () {
                var deliv = $("#order-form").find("input").val(); 
                var total = parseFloat($("#total").text().replace("$", ""));
                var comments = $("#order-form").find("textarea").val(); 
                $.ajax({
                    url : '../php/cart.php',
                    type : 'POST', 
                    data : {action : "order", total : total, date : deliv, comments : comments},
                    success : function(result) {
                        if (result) {
                            alert(result); 
                        }
                        else {
                            window.location.replace("../home/home.html")
                        }
                    }
                });
                return false; 
            });
        }
    });
});