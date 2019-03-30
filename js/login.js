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

function send (action) {
    var $email = $("input[name='email']").val();
    var $password  = $("input[name='password']").val(); 
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
        data : { email : $email, password : $password, action : action },
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
    $("button[name='login'").click(function() {
        send("login");
    });
    $("button[name='register']").click(function() {
        send("register"); 
    });
});