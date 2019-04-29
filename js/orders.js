class Order {
    constructor (order) {
        this.id = order.id; 
        this.total_cost = order.total_cost; 
        this.placed = order.placed; 
        this.expected = order.expected; 
        this.comments = order.comments; 
        this.items = new Array(); 
        for (var i in order.items) {
            this.items.push(new OrderItem(order.items[i])); 
        }
    }

    getHTMLObject() {
        var $order = $("<li>", {class : "list-group-item"});
        var $wrap = $("<div>", {class : "d-flex flex-column"});
        $wrap.append($("<p>", {text : "Order placed: " + this.placed})); 
        $wrap.append($("<p>", {text : "Total: $"+this.total_cost})); 
        if (this.comments) {
            $wrap.append($("<p>", {text : this.comments})); 
        }
        var $item_list = $("<ul>", {class : "mr-auto p-2 list-group"});
        for (var i in this.items) {
            $item_list.append(this.items[i].getHTMLObject()); 
        }
        $wrap.append($item_list); 
        $order.append($wrap); 
        return $order; 
    }
}

class OrderItem {
    constructor (item) {
        this.id = item.id; 
        this.name = item.name; 
        this.description = item.description; 
        this.quantity = item.quantity; 
        this.cake_size = item.cake_size; 
    }

    getHTMLObject() {
        var $item = $("<div>", { class : "d-flex flex-column list-group-item" }); 
        $item.append($("<p>", {text : this.name })); 
        $item.append($("<p>", {text : this.description}));
        if (this.cake_size) {
            $item.append($("<p>", {text : this.cake_size + "\""}));
        }
        $item.append($("<p>", {text : this.quantity}));
        
        return $item; 
    }
}

$(function() {
    $.ajax({
        url : '../php/orders.php',
        type : 'POST',
        data : {action : "orders"},
        success : function(json) {
            //alert(json); 
            if (!json) {
                $("main").prepend($("<p>", {text : "You don't have any orders"})); 
                $("h4").remove(); 
                //$("#place-order").remove(); 
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            orders = JSON.parse(json); 
            if (orders.length == 0) {
                $("main").prepend($("<p>", {text : "You don't have any orders"})); 
                $("h4").remove(); 
                $("#place-order").remove();
                return;
            }
            for (var i in orders) {
                var order = new Order(orders[i]); 
                $("#order-list").append(order.getHTMLObject()); 
            }
        }
    });
});