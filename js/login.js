var specialChars = "!#$%&_-*";
var passwordRulesText = "Passwords must have:<br>"+
    "1.At least one upper-case letter<br>"+
    "2.At least one lower-case letter<br>"+
    "3.At least one number<br>"+
    "4.At least one special character: "+specialChars+"<br>"+
    "5.No spaces<br>"; 
var passwordRules = $("<p>", { 
    id : "password-rules", 
    html : passwordRulesText
}).css("color", "red");

function checkEmail(email) {
    var emailRegex = RegExp("^.*@.*\\..*$");
    return emailRegex.test(email); 
}

function goodPassword(password) {
    var upper = RegExp("[A-Z]");
    var lower = RegExp("[a-z]");
    var number = RegExp("[0-9]");
    var spaces = RegExp("^\\S+$");
    var specials = RegExp("[!#$%&_\\-*]");
    return upper.test(password) && lower.test(password) && number.test(password) 
        && spaces.test(password) && specials.test(password);
}

function change_to_register() {
    var $form = $("form");
    $("#login-container").remove(); 
    $("#phone-container").prop("hidden", false); 
    $("#pass-confirm-container").prop("hidden", false); 
    $("#register").off("click"); 
    
    $form.submit(function() {
        register(); 
        return false; 
    }); 
    $("#register").prop("type", "submit"); 
}

function register() {
    var $email = $("#email").val(); 
    var $password = $("#password").val(); 
    var $pass_confirm = $("#pass-confirm").val(); 
    var $phone = $("#phone").val(); 

    if (!$email || !$password || !$pass_confirm || !$phone) {
        $("#help-text").html("<p>All forms must be filled<br></p>"); 
        return; 
    }
    $phone = get_number($phone); 
    if (!checkEmail($email)) {
        $("#help-text").html("<p>Invalid email<br></p>"); 
        return; 
    }
    if (!goodPassword($password)) {
        $("#help-text").html(passwordRules); 
        return; 
    }
    if ($password != $pass_confirm) {
        $("#help-text").html("<p>Passwords must match<br></p>"); 
        return;
    }
    if ($phone.length != 10) {
        $("#help-text").html("<p>Valid phone number required<br></p>");
        return; 
    }
    $.ajax({
        url : '../php/login.php',
        type : 'POST', 
        data : {email : $email, password : $password, action : "register", phone : $phone},
        success : function(html) {
            if (html.indexOf("ERROR") != -1) {
                $("#help-text").html(html); 
            }
            else {
                window.location.replace("../home/home.html");
            }
        }
    });
} 

function get_number(str) {
    var all_nums = str.match(/\d/g); 
    return all_nums.join("");
}

function send (action) {
    var $email = $("#email").val();
    var $password  = $("#password").val(); 
    if (!checkEmail($email) && $email !== "admin") {
        $("#help-text").html("<p>Invalid email<br></p>"); 
        return;
    }
    if (!goodPassword($password)) {
        $("#help-text").html(passwordRules); 
        return;
    }
    $.ajax({
        url : '../php/login.php',
        type : 'POST',
        data : { email : $email, password : $password, action : "login" },
        success : function(html) {
            $("#help-text").html(html); 
            if (html.indexOf("ERROR") != -1) {
                $("#help-text").html(html); 
            }
            else {
                window.location.replace("../home/home.html");
            }
        }
    });
}

$(function (){
    $("#phone").mask("(000) 000-0000"); 
    $("#login").click(function() {
        send("login");
    });
    $("#register").click(function(event) {
        event.preventDefault(); 
        event.stopImmediatePropagation(); 
        change_to_register(); 
    });
});