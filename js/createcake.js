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
            //console.log(this.options[i]); 
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
            for (key in options) {
                var option = new Option(key, options[key]); 
                $("#cake-form").append(option.getHTMLObject()); 
            }
            $("#cake-form").append($("<button>", {class : "btn btn-primary", html : "Create Your Cake!"}));
        }
    });
    $("#cake-form").submit( function() {
        alert("button pressed"); 
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