class Option {
    
}

function fill_options() {

}

$(function() {

    $.ajax({
        url : '../php/createcake.php',
        type : 'POST', 
        data : {action : "options"},
        success : function(json) {
            
        }
    });
});