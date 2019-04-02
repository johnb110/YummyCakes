class Option {
    constructor(category, options) {
        this.category = category; 
        this.options = options; 
    }

    getHTMLObject() {
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
            options = JSON.parse(json); 
            $form = $("#cake-form"); 
            for (key in options) {
                var option = new Option(key, options[key]); 
                $form.append(option.getHTMLObject()); 
            }
            var $select = $("<select>", {class : "form-control", id : "size"});
            var sizes = [6, 8, 10, 12]; 
            for (i in sizes) {
                var size = sizes[i]; 
                $select.append($("<option>", {value : size, text : size.toString() + "\""}));
            }
            $form.append($("<div>", {class : "form-group"}));
            $form.append($("<label>", {for : "size", text : "Size"}));
            $form.append($select); 
            $form.append($("<button>", {type : "submit", class : "form-row form-group btn btn-primary mr-3", html : "Create Your Cake!"}));
        }
    });
    $("#cake-form").submit( function() {
        //alert("button pressed"); 
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