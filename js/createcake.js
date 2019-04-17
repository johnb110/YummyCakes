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
        var $group = $("<div>", { class : "form-group"}); 
        $group.append($("<label>", {for : this.category, text : capitalize(this.category)}));
        var $row = $("<div>", { class : "form-group row" });
        var $select = $("<select>", { class : "form-control col-sm-5", id : this.category});
        for (var i in this.options) {
            $select.append($("<option>", { value : this.options[i].id, html : this.options[i].value })); 
        }
        $row.append($select); 
        var $avail = $("<div>", {class : "form-check"}); 

        $avail.append($("<input>", {type : "checkbox", class : "form-check-input", id : "available-"+this.category})); 
        $avail.append($("<label>", {for : "avaialable-"+this.category, class : "form-check-label ", html : "Available"}));
        $row.append($avail); 
        $group.append($row); 
        return $group; 
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

$(function() {
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
            var admin = parsed.admin; 
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
            $row = $("<div>", {class : "form-group col-sm-5"}); 
            $row.append($("<label>", {for : "size", text : "Size"}));
            $row.append($select); 
            $form.append($row); 
            $form.append($("<button>", {type : "submit", class : "form-row form-group btn btn-primary mt-3", html : "Create Your Cake!"}));
        }
    });
    $("#cake-form").submit( function() {
        var selections = {};
        $("select").each( function() {
            var category = $(this).attr('id');  
            var id = $(this).children("option:selected").val();
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