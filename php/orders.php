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

function get_past_orders($link, $user) {
    $orders = array(); 
    $query = "SELECT * FROM dessert_order WHERE user='$user'"; 
    $orders_result = mysqli_query($link, $query); 
    if (!$orders_result) {
        echo "ERROR_QUERY_FAILED"; 
        exit(); 
    }
    while ($row = mysqli_fetch_assoc($orders_result)) {
        $order_id = $row['dessert_order'];
        $order = array(
            "id" => $row['dessert_order'],
            "total_cost" => $row['total_cost'],
            "placed" => $row['placed'],
            "expected" => $row['expected'],
            "comments" => $row['comments'] 
        );
        $query = "SELECT * FROM order_item NATURAL JOIN dessert_item WHERE dessert_order=$order_id";
        $item_result = mysqli_query($link, $query); 
        if (!$item_result) {
            continue; 
        }
        $items = array(); 
        while ($row = mysqli_fetch_assoc($item_result)) {
            array_push($items, array (
                "id" => $row['dessert_item'],
                "name" => $row['name'],
                "description" => $row['description'],
                "quantity" => $row['quantity'],
                "cake_size" => $row['cake_size']
            ));
        }
        $order["items"] = $items; 
        array_push($orders, $order); 
    }
    echo json_encode($orders); 
}

session_start(); 

if (!isset($_POST['action'])) {
    echo "ERROR_NO_ACTION";
    exit(); 
}

switch ($_POST['action']) {
    case "orders":
        if (!isset($_SESSION['user'])) {
            echo "ERROR_NO_USER";
            exit(); 
        }
        $user = $_SESSION['user'];
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT"; 
            exit(); 
        }
        get_past_orders($link, $user); 
        mysqli_close($link); 
}

?>