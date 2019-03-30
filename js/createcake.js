class Option {
    constructor(category, options) {
        this.category = category; 
        this.options = options; 
    }

    getHTMLObject() {
        var $group = $("<div>", {class : "form-group"});
        $group.append($("<label>", {for : this.category, html : this.category})); 
        var $select = $("<select>", {class : "form-control"});
        for (var i in this.options) {
            $select.append($("<option>", { html : options[i] })); 
        }
        $group.append($select); 
        return $group; 
    }
}

function fill_options(options) {

}

$(function() {

    $.ajax({
        url : '../php/createcake.php',
        type : 'POST', 
        data : {action : "options"},
        success : function(json) {
            alert(json); 
            if (!json) {
                return; 
            }
            options = JSON.parse(json); 
            for (key in options) {
                var option = new Option(key, options[key]); 
                $("#cake-form").append(option.getHTMLObject()); 
            }
        }
    });
});