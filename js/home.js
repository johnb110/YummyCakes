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
        var $size_select; 
        if (this.cake_id) {
            $size_select = $("<select>", {class : "form-control mr-3 form-control-sm"});
            var sizes = [6, 8, 10, 12];
            for (i in sizes) {
                $size_select.append($("<option>", {val : sizes[i], text : sizes[i].toString() + "\""})); 
            }
            $price_row.append($size_select); 
        }
        var $quant_select = $("<select>", {class : "form-control mr-3 form-control-sm"}); 
        for (var i = 1; i <= 10; i++) {
            $quant_select.append($("<option>", {val : i, text : i.toString()})); 
        }
        if (this.cake_id) {
            $quant_select.change(function() {
                var price = cake_price(parseFloat($price), parseInt($size_select.val(), 10)) * 
                    parseInt($quant_select.val(), 10);
                $price_text.text("$" + price.toFixed(2)); 
            }); 
            $size_select.change(function() {
                var price = cake_price(parseFloat($price), parseInt($size_select.val(), 10)) * 
                    parseInt($quant_select.val(), 10);
                $price_text.text("$" + price.toFixed(2)); 
            }); 
            $quant_select.change(); 
        }
        else {
            $quant_select.change(function() {
                $price_text.text("$" + (parseFloat($price) * parseInt($(this).val(), 10)).toFixed(2)); 
            });
        }
        
        $price_row.append($quant_select); 
        $in_container.append($price_row); 

        var $last_row = $("<div>", {class : "d-flex flex-row"}); 
        $last_row.append($("<button>", {text : "Add to cart", class : "btn float-left"}));
        if (this.cake_id) {
            $last_row.find("button").click( function () {
                $.ajax({
                    url : '../php/home.php',
                    type : 'POST',
                    data : { action : "add-cake", item : $id, size : $size_select.val(), quantity : $quant_select.val()}, 
                    success : function (json) {
                        alert($name + " added to cart"); 
                    }
                });
            })
        }
        else {
            $last_row.find("button").click(function () {
                $.ajax({
                    url : '../php/home.php',
                    type : 'POST',
                    data : { action : "add-cart", item : $id, quantity : $quant_select.val()}, 
                    success : function (json) {
                        alert($name + " added to cart"); 
                    }
                });
            }); 
        }
        $in_container.append($last_row); 
        $container.append($in_container); 
        return $item; 
    }
}

function cake_price(price_per_inch, size) {
    return price_per_inch * size * size; 
}

class DessertItemAdmin {
    constructor (json) {
        this.id = json.id;
        this.name = json.name;
        this.file = json.file; 
        this.description = json.description; 
        this.price = json.price; 
        this.cake_id = json.cake_id; 
        this.category = json.category; 
        this.available = json.available; 
    }

    getHTML() {
        var id = this.id; 
        var $item = $("<li>", {class : "list-group-item"});
        var $container = $("<div>", { class : "d-flex flex-row"}); 
        $item.append($container); 
        var $img = $("<img>", {alt : "["+this.name+" image]", src : "../images/"+this.file, class : "dessert-item"}); 
        add_upload_func($img); 
        $container.append($img); 
        var $form = $("<form>"); 
        var $name = $("<input>", {class : "form-control", type : "text", val : this.name, placeholder : "Name"}); 
        var $desc = $("<textarea>", {class : "form-control", rows : "3", val : this.description, placeholder : "Description"}); 
        var $cat = $("<input>", {class : "form-control", type : "text", val : capitalize(this.category), placeholder : "Category"}); 
        $form.append($name);
        $form.append($cat);
        $form.append($desc);
        var $price_row = $("<div>", {class : "input-group mb-3"}); 
        $price_row.append($("<div>", {class : "input-group-prepend"}));
        $price_row.find("div").append($("<span>", {class : "input-group-text", text : "$"})); 
        var $price = $("<input>", {class : "form-control", type : "number", step : "0.01", min : "0.00", val : this.price}); 
        $price_row.find("div:last-of-type").append($price); 
        $form.append($price_row);
        var $check_row = $("<div>", {class : "form-check"}); 
        var $available = $("<input>", {type : "checkbox", class : "form-check-input", id : "available"+id});
        $available.prop('checked', this.available == 1);  
        $check_row.append($available); 
        $check_row.append($("<label>", {class : "form-check-label", html : "Available", for : "available"+id}));
        $form.append($check_row); 
        var $save = $("<button>", {class : "btn btn-primary mt-2", text : "Save Changes"}); 
        $form.append($save); 
        $form.submit( function () {
            var img_file_name = null; 
            if ($img.prop('src')) {
                img_file_name = get_file_name($img.attr('src'));
            }
            var available = $available.is(":checked") ? 1 : 0; 
            var $item_changes = {
                id : id,
                name : $name.val(), 
                file : img_file_name,
                category : $cat.val().toLowerCase(),
                description : $desc.val(),
                price : parseFloat($price.val()).toFixed(2),
                available : available
            }; 
            console.log(JSON.stringify($item_changes)); 
            $.ajax({
                method : 'POST',
                url : '../php/home.php',
                data : {action : "update", changes : JSON.stringify($item_changes)},
                success : function(response) {
                    console.log(response); 
                }
            }); 
            return false;
        }); 
        $container.append($form); 
        return $item; 
    }
}

function get_file_name(file_path) {
    return file_path.substr(file_path.lastIndexOf("/") + 1);
}

function add_upload_func($img) {
    $img.click( function() {
        var $file_input = $("input[type='file']"); 
        $("#image-upload").off('submit').submit(function(e) {
            var file_path = $file_input.val(); 
            var file_name = file_path.substr(file_path.lastIndexOf("\\") + 1); 
            var file_ext = file_name.substr(file_name.lastIndexOf(".") + 1).toLowerCase(); 
            if (file_ext != "jpg" && file_ext != "jpeg" && file_ext != "png") {
                alert("Sorry, file must be format 'jpg', 'jpeg', or 'png'"); 
                return; 
            }
            var form_data = new FormData(this); 
            upload_image(form_data, $img, file_name); 
            return false; 
        });
        $file_input.off('change').change( function () {
            $("#image-upload").submit(); 
        }); 
        $file_input.click();
    });
}

function upload_image(form_data, $img, file_name) {
    $.ajax({
        url : '../php/file_upload.php',
        type : 'POST', 
        data : form_data,
        processData : false,
        contentType : false,
        enctype: 'multipart/form-data',
        success : function(response) {
            if (response.indexOf("ERROR") != -1) {
                console.log(response); 
                alert("File could not be uploaded"); 
            }
            else {
                $img.attr('src', "../images/"+file_name);
            }
        }
    });
}

function get_items() {
    var page = $("#page").text(); 
    var page_size = $("#page-size").val(); 
    var search = $("#search-text").val();
    var category = $("#category").val(); 
    if (!search) {
        search = ""; 
    }
    if (!category) {
        category = "none"; 
    }
    
    $.ajax({
        url : '../php/home.php',
        type : 'POST',
        data : { action : "items", page : page, page_size : page_size, search : search, category : category},
        success : function(json) {
            console.log(json); 
            if (!json) {
                return; 
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            var ret_val = JSON.parse(json); 
            $("#item-list").empty();
            var items = ret_val.items; 
            var admin = ret_val.admin;  
            var pages = ret_val.pages; 

            $("#pages").text(pages); 
            $("#prev-page").prop('disabled', (page == 1));
            $("#next-page").prop('disabled', (page == pages));

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
            $form = $("#new-item"); 
            if (!admin) {
                $form.remove();  
            }
            else { 
                if ($form.prop("hidden")) {
                    $form.prop("hidden", false);  
                    add_handlers_to_form($form); 
                } 
            }
        }
    });
}

function add_handlers_to_form($form) {
    $img = $form.find("img"); 
    add_upload_func($img);
    $name = $form.find("#new-name");
    $desc = $form.find("textarea"); 
    $cat = $form.find("#new-category");
    $price = $form.find("input[type='number']"); 

    $form.submit(function(){
        if (!$name.val() || !$desc.val() || !$cat.val() || !$price.val()) {
            alert("All fields required!"); 
            return false; 
        }
        else if (parseFloat($price.val()) <= 0) {
            alert("Price must be positive number!"); 
            return false; 
        }
        var img_file_name = null; 
        if ($img.attr('src')) {
            img_file_name = get_file_name($img.attr('src')); 
        }
        $new_item = {
            name : $name.val(),
            description : $desc.val(),
            category : $cat.val().toLowerCase(),
            price : parseFloat($price.val()).toFixed(2),
            image_file_name : img_file_name
        };
        console.log(JSON.stringify($new_item)); 
        $.ajax({
            url : '../php/home.php',
            method : 'POST',
            data : {action: 'insert', item : JSON.stringify($new_item) },
            success : function(response) {
                console.log(response); 
                if (!response) {
                    return; 
                }
                else if (typeof(response) == "string" && response.indexOf("ERROR") != -1) {
                    $("main").prepend($("<p>", {text : response})); 
                    return; 
                }
                item = new DessertItemAdmin(JSON.parse(response));
                $form[0].reset(); 
                alert($new_item.name + " added!"); 
                get_items(); 
                //$("#item-list").append(item.getHTML()); 
            }
        }); 

        return false; 
    });
}

function switch_page(move_to) {
    page = parseInt($("#page").html()) + move_to; 
    pages = parseInt($("#pages").html()); 
    $("#page").text(page); 
    get_items(); 
    $("#prev-page").prop('disabled', (page == 1)); 
    $("#next-page").prop('disabled', (page == pages)); 
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function get_categories() {
    $.ajax({
        url : '../php/home.php',
        method : 'POST',
        data : {action: 'categories' },
        success : function(json) {
            console.log(json); 
            if (!json) {
                return;
            }
            else if (typeof(json) == "string" && json.indexOf("ERROR") != -1) {
                $("main").prepend($("<p>", {text : json})); 
                return; 
            }
            categories = JSON.parse(json); 
            $category = $("#category"); 
            for (i in categories) {
                $category.append($("<option>", {val : categories[i], html : capitalize(categories[i]) })); 
            }
        }
    }); 
}

$( function() {
    get_categories(); 
    get_items(); 
    $("#category").change(function() {
        get_items(); 
    }); 
    $("#page-size").change(function() {
        $("#page").text(1); 
        get_items(); 
    }); 
    $("#prev-page").click(function() {
        switch_page(-1);
    });
    $("#next-page").click(function() {
        switch_page(1); 
    });
    $("#search").submit(function() {
        get_items(); 
        return false; 
    }); 
});