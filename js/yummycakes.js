$( function() {
    $.ajax({
        url : '../php/home.php',
        type : 'POST',
        data : { action : "user"}, 
        success : function (user) {
            if (!user) {
                window.location.replace("../login/login.html");
            }
            else {
                $user = user; 
                $("#user-menu").text($user);
            }
        }
    });

    $("#logout").click( function(){
        $.ajax({
            url : '../php/home.php',
            type : 'POST',
            data : { action : "logout"},
            success : function() {
                window.location.replace("../login/login.html");
            }
        }); 
    });

});