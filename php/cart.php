<?php

date_default_timezone_set('America/Chicago');

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

function get_cart_items($link) {
    if (!isset($_SESSION['cart'])) {
        return; 
    }
    $cart_items = array(); 
    foreach ($_SESSION['cart'] as $id => $quantity) {
        $query = "SELECT dessert_item as id, name, description, price FROM dessert_item WHERE dessert_item=$id";
        $result = mysqli_query($link, $query);
        if (!$result) {
            echo "ERROR_QUERY_FAILED"; 
            return; 
        }
        $row = mysqli_fetch_assoc($result); 
        if (!$row) {
            //echo "ERROR_ITEM_NOT_FOUND"; 
            continue; 
        }
        $row['quantity'] = $quantity; 
        array_push($cart_items, $row); 
    }
    echo json_encode($cart_items); 
}

function update_cart($item, $quantity) {
    if ($quantity == 0) {
        unset($_SESSION['cart'][$item]); 
    }
    else {
        $_SESSION['cart'][$item] = $quantity; 
    }
}

function place_order($link, $total) {
    $user = $_SESSION['user']; 
    $today = date("Y-m-d");
    $expected = date("Y-m-d", strtotime("+1 week", strtotime($today))); 
    $query = "SELECT start_order('$user', $total, '$today', '$expected', 'yay!');";
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED";
        exit(); 
    }
    $row = mysqli_fetch_array($result); 
    if (!$row) {
        echo "ERROR_NO_RESULT"; 
        exit(); 
    }
    $order_id = $row[0]; 
    foreach ($_SESSION['cart'] as $id=>$quantity) {
        $query = "INSERT INTO `order_item` (`dessert_order`,`dessert_item`,`cake_size`,`cost`,`quantity`) "; 
        $query .= "VALUES ($order_id, $id, NULL, 0.0, $quantity)"; 
        mysqli_query($link, $query); 
    }
    unset($_SESSION['cart']); 
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
        get_cart_items($link);
        mysqli_close($link); 
        break; 
    case "update-cart":
        $item = $_POST['item'];
        $quantity = $_POST['quantity'];
        update_cart($item, $quantity); 
        break; 
    case "logout":
        session_destroy(); 
        break;
    case "order":
        $total = $_POST['total']; 
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT_FAILED"; 
            exit(); 
        }
        place_order($link, $total); 
        mysqli_close($link); 
        break;
}

?>