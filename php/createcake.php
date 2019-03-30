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

function get_options($link) {
    $query = "SELECT * FROM custom WHERE available=1"; 
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        exit(); 
    }
    
    $options = array(); 

    while ($row = mysqli_fetch_assoc($result)) {
        if (!isset($options[$row['category'])) {
            $options[$row['category']] = array(); 
        }
        array_push($options[$row['category']], $row['value']); 
    }

    echo json_encode($options); 
}

session_start(); 

if (!isset($_POST['action'])) {
    echo "ERROR_NO_ACTION";
    exit(); 
}

switch ($_POST['action']) {
    case "options":
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT";
            exit(); 
        }
        get_options($link); 
        break;
}

?>