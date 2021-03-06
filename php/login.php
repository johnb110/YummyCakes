<?php

function db_connect() {
    $user = 'root';
    $password = 'password';
    $db = 'YummyCakes';
    $host = 'localhost';
    $port = 3306;
    
    $link = mysqli_init();

    $success = mysqli_real_connect(
    $link, 
    $host, 
    $user, 
    $password, 
    $db,
    $port
    );

    return $link; 
}

function check_user_exists($email, $link) {
    $query = "SELECT user_exists('".$email."')"; 
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED";
        return true; 
    }
    $row = mysqli_fetch_array($result); 
    $user_exists = $row[0];
    if ($user_exists == 1) {
        echo "ERROR_USER_EXISTS"; 
        return true;
    }
    return false; 
}

session_start();

if (!(isset($_POST['email']) && isset($_POST['password']) && isset($_POST['action']))) {
    echo "ERROR_NOT_ENOUGH_VARS";
    mysqli_close($link); 
    exit(); 
}

$link = db_connect(); 
if (!$link) {
    echo "ERROR_CONNECT"; 
    mysqli_close($link);
    exit(); 
}

$email = mysqli_real_escape_string($link, trim($_POST['email'])); 
$password = mysqli_real_escape_string($link, trim($_POST['password'])); 

if ($_POST['action'] == "login") {
    $query = "SELECT pass_word FROM user WHERE user='".$email."'"; 
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_FIND_FAILED"; 
        mysqli_close($link);
        exit(); 
    } 
    $row = mysqli_fetch_array($result); 
    if (!$row) {
        echo "ERROR_USER_NOT_FOUND"; 
        mysqli_close($link);
        exit();
    }
    $user_password = $row['pass_word']; 
    $hashed = hash("sha256", $password); 
    if ($user_password != $hashed) {
        echo "ERROR_INVALID_PASSWORD"; 
        mysqli_close($link);
        exit();
    }
    // Valid Login
    $_SESSION['user'] = $email; 
}
else if ($_POST['action'] == "register") {
    if (!check_user_exists($email, $link)) {
        $phone = mysqli_real_escape_string($link, trim($_POST['phone'])); 
        $hashed = hash("sha256", $password); 
        $query = "CALL add_new_user('$email','$hashed', '$phone')";
        if (!mysqli_query($link, $query)) {
            echo "ERROR_ADD_FAILED"; 
            mysqli_close($link);
            exit(); 
        }
        $_SESSION['user'] = $email;
    }
}

mysqli_close($link);

?>