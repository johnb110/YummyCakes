var $is_admin = false; 

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
        $in_container.append($("<h5>", {text : this.name }));
        $in_container.append($("<p>", {text : this.description}));

        var $price_row = $("<div>", {class : "d-flex flex-row align-items-start"}); 
        var $price = this.price; 
        var $price_text = $("<p>", {class : "mr-3", text : "$" + this.price }); 
        $price_row.append($price_text); 
        var $quant_select = $("<select>", {class : "form-control mr-3 form-control-sm"}); 
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

class DessertItemAdmin {
    constructor (json) {
        this.id = json.id;
        this.name = json.name;
        this.file = json.file; 
        this.description = json.description; 
        this.price = json.price; 
        this.cake_id = json.cake_id; 
    }

    getHTML() {
        var $item = $("<li>", {class : "list-group-item"});
        var $container = $("<div>", { class : "d-flex flex-row"}); 
        $item.append($container); 
        var $img = $("<img>", {alt : "["+this.name+" image]", src : "../images/"+this.file, class : "dessert-item"}); 
        $img.click( function() {
            var $file_input = $("input[type='file']"); 
            $("#image-upload").submit(function(e) {
                var file_path = $file_input.val(); 
                var file_name = file_path.substr(file_path.lastIndexOf("\\") + 1); 
                var file_ext = file_name.substr(file_name.lastIndexOf(".") + 1).toLowerCase(); 
                if (file_ext != "jpg" && file_ext != "jpeg" && file_ext != "png") {
                    alert("Sorry, file must be format 'jpg', 'jpeg', or 'png'"); 
                    return; 
                }
                var form_data = new FormData(this); 
                upload_image(form_data); 
            });
            $file_input.click();
        });
        $container.append($img); 
        return $item; 
    }
}

function upload_image(form_data) {
    $.ajax({
        url : '../php/file_upload.php',
        type : 'POST', 
        data : form_data,
        processData : false,
        contentType : false,
        enctype: 'multipart/form-data',
        success : function(response) {
            console.log(response); 
        }
    });
}


$(function() {
    $.ajax({
        url : '../php/home.php',
        type : 'POST',
        data : { action : "items"},
        success : function(json) {
            if (!json) {
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            var ret_val = JSON.parse(json); 
            var items = ret_val.items; 
            var admin = ret_val.admin; 
            for (var i in items) {
                var item; 
                if (admin) {
                    item = new DessertItemAdmin(items[i]); 
                }
                else {
                    item = new DessertItem(items[i]);
                }
                $("#item-list").append(item.getHTML()); 
            }
        }
    });
});