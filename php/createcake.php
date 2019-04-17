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
    $is_admin = $_SESSION['user'] == "admin"; 

    $query = "SELECT * FROM custom"; 
    if (!$is_admin) {
        $query .= " WHERE available=1"; 
    }
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        exit(); 
    }
    
    $options = array(); 

    while ($row = mysqli_fetch_assoc($result)) {
        if (!isset($options[$row['category']])) {
            $options[$row['category']] = array(); 
        }
        $value_id = array(
            "value"=>$row['value'],
            "available"=>$row['available']
        );
        $options[$row['category']][$row['custom']] = $value_id; 
        //array_push($options[$row['category']], $value_id); 
    }

    
    $response = array(
        "options" => $options,
        "admin" => $is_admin
    ); 

    echo json_encode($response); 
}

function submit_cake($link, $selections) {
    $flavor = $selections['flavor']; 
    $frosting = $selections['frosting'];
    $filling = $selections['filling'];
    $query = "SELECT cake FROM cake WHERE flavor=$flavor AND frosting=$frosting AND filling=$filling";
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        exit(); 
    }
    $item_id = -1; 
    if (mysqli_num_rows($result) != 0) {
        $row = mysqli_fetch_assoc($result); 
        $cake_id = $row['cake'];
        $query = "SELECT dessert_item FROM dessert_item WHERE cake=$cake_id"; 
        $result = mysqli_query($link, $query); 
        if (!$result) {
            echo "ERROR_QUERY_FAILED"; 
            exit(); 
        }
        $row = mysqli_fetch_assoc($result); 
        $item_id = $row['dessert_item']; 
    }
    else {
        $query = "SELECT create_new_cake($flavor, $frosting, $filling)";
        $result = mysqli_query($link, $query); 
        if (!$result) {
            echo "ERROR_QUERY_FAILED"; 
            exit(); 
        }
        $row = mysqli_fetch_array($result); 
        $item_id = $row[0];
    }
    if (!isset($_SESSION['cakes'])) {
        $_SESSION['cakes'] = array(); 
    }
    if (!isset($_SESSION['cakes'][$item_id])) {
        $_SESSION['cakes'][$item_id] = array(); 
    }
    $size = $selections['size']; 
    if (!isset($_SESSION['cakes'][$item_id][$size])) {
        $_SESSION['cakes'][$item_id][$size] = 0; 
    }
    $_SESSION['cakes'][$item_id][$size] += 1; 
    echo json_encode($_SESSION['cakes']); 
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
    case "submit":
        if (!isset($_POST['select'])) {
            echo "ERROR_NO_SELECTION";
            exit(); 
        }
        $selections = json_decode($_POST['select'], true);
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT"; 
            exit(); 
        }
        submit_cake($link, $selections); 
        break; 
}

?>