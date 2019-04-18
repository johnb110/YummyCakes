class Option {
    constructor(category, options) {
        this.category = category; 
        this.options = options; 
    }

    getHTML() {
        var $group = $("<div>", {class : "form-group"});
        $group.append($("<label>", {for : this.category, text : capitalize(this.category)})); 
        var $select = $("<select>", {class : "form-control", id : this.category});
        for (var i in this.options) {
            $select.append($("<option>", { value : this.options[i].id, html : this.options[i].value })); 
        }
        $group.append($select); 
        return $group; 
    }
}

class OptionAdmin {
    constructor(category, options) {
        this.category = category; 
        this.options = options;
    }

    getHTML() {
        var options = this.options; 
        var category = this.category; 
        var $group = $("<div>", { class : "form-group"}); 
        $group.append($("<label>", {for : this.category, text : capitalize(this.category)}));
        var $row = $("<div>", { class : "row" });
        var $sel_div = $("<div>", {class : "col-md-8"}); 
        var $select = $("<select>", { class : "form-control", id : this.category});
        for (var id in this.options) {
            $select.append($("<option>", { value : id, html : this.options[id].value })); 
        }
        
        $sel_div.append($select); 
        $row.append($sel_div); 
        var $avail = $("<div>", {class : "form-check col"}); 
        var $check = $("<input>", {type : "checkbox", class : "form-check-input", id : "available-"+this.category}); 
        $avail.append($check); 
        $avail.append($("<label>", {for : "available-"+this.category, class : "form-check-label", html : "Available"}));
        $check.click(function() {
            var id  = $select.val(); 
            var available = $(this).prop('checked') ? 1 : 0; 
            console.log(available); 
            $.ajax({
                url : '../php/createcake.php',
                type : 'POST',
                data : {action : "set_available", id : id, available : available},
                success : function(response) {
                    if (response) {
                        console.log(response); 
                    }
                    options[id].available = available; 
                }
            }); 
        }); 
        $row.append($avail); 
        $group.append($row); 

        $select.change(function() {
            var id = $(this).val(); 
            var checked = options[id].available == 1; 
            $check.prop('checked', checked); 
        }); 
        $select.change(); 

        var $new_row = $("<div>", {class : "row m-1"}); 
        var $new_input = $("<input>", {class : "form-control col-md-8", placeholder : "Add new " + this.category + " here"}); 
        var $new_button = $("<button>", {class : "btn btn-primary", text : "Add new!", type : "button"}); 
        $new_button.click(function() { 
            var new_custom = $new_input.val(); 
            if (!new_custom) {
                // Empty field
                return; 
            }
            $.ajax({
                url : '../php/createcake.php',
                type : 'POST',
                data : {action : "add", category : category, new_custom : new_custom }, 
                success : function(response) {
                    if (!response) {
                        return; 
                    }
                    if (response.indexOf("ERROR") != -1) {
                        console.log(response); 
                        return;
                    }
                    $select.append($("<option>", { value : response, html : new_custom })); 
                    $new_input.val(''); 
                    var pair = {"value" : new_custom, "available" : 1}; 
                    options[response] = pair; 
                }
            }); 
        }); 
        $new_row.append($new_input); 
        $new_row.append($new_button); 
        $group.append($new_row); 
        return $group; 
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

$(function() {
    var admin;
    $.ajax({
        url : '../php/createcake.php',
        type : 'POST', 
        data : {action : "options"},
        success : function(json) {
            //alert(json); 
            if (!json) {
                return; 
            }
            parsed = JSON.parse(json); 
            admin = parsed.admin; 
            var options = parsed.options; 
            $form = $("#cake-form"); 
            for (key in options) {
                var option; 
                if (admin) {
                    option = new OptionAdmin(key, options[key]);
                }
                else {
                    option = new Option(key, options[key]);
                }
                $form.append(option.getHTML()); 
            }
            var $select = $("<select>", {class : "form-control", id : "size"});
            var sizes = [6, 8, 10, 12]; 
            for (i in sizes) {
                var size = sizes[i]; 
                $select.append($("<option>", {value : size, text : size.toString() + "\""}));
            }
            if (!admin) {
                var $row = $("<div>", {class : "form-group col-sm-8"}); 
                $row.append($("<label>", {for : "size", text : "Size"}));
                $row.append($select); 
                $form.append($row);
            }
            $form.append($("<button>", {type : "submit", class : "form-row form-group btn btn-primary mt-3", html : "Create Your Cake!"}));
        }
    });
    $("#cake-form").submit( function() {
        var selections = {};
        $("select").each( function() {
            var category = $(this).attr('id');  
            var id = $(this).val();
            selections[category] = id; 
        });
        $.ajax({
            url : '../php/createcake.php',
            type : 'POST',
            data : {action : "submit", select : JSON.stringify(selections)}, 
            success : function (result) {
                if (result) {
                    alert(result); 
                }
            }
        });
        return false;
    }); 
});