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

function add_to_cart($item, $quantity) {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = array(); 
    }
    if (!isset($_SESSION['cart'][$item])) {
        $_SESSION['cart'][$item] = 0; 
    }
    $_SESSION['cart'][$item] += $quantity; 
}

function get_items_admin($link) {
    
}

function get_dessert_items($link) {
    // Only retrieve currently available 
    $query = "SELECT dessert_item as id, name, image_file_name as file, description, price, cake as cake_id FROM dessert_item WHERE available=1"; 
    $result = mysqli_query($link, $query);
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        return false; 
    }
    $items = array(); 
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($items, $row); 
    } 
    echo json_encode($items); 
}

session_start(); 

if (!isset($_POST['action'])) {
    echo "ERROR_NO_ACTION"; 
    exit(); 
}

switch ($_POST['action']) {
    case "user":
        if (isset($_SESSION['user'])) {
            echo $_SESSION['user']; 
        }
        break;
    case "items":
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT_FAILED"; 
            exit(); 
        }
        get_dessert_items($link); 
        mysqli_close($link); 
        break; 
    case "add-cart":
        if (!(isset($_POST['item']) && isset($_POST['quantity']))) {
            echo "ERROR_PARAMS_NOT_SET"; 
            exit(); 
        }
        add_to_cart($_POST['item'], $_POST['quantity']); 
        break; 
    case "logout":
        session_destroy(); 
        break;
}

?>