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
    $cart = array(); 
    $cart_items = array();
    if (isset($_SESSION['cart'])) {
        foreach ($_SESSION['cart'] as $id => $quantity) {
            $item_info = get_item_info($link, $id); 
            if (is_null($item_info)) {
                continue; 
            }
            $item_info['quantity'] = $quantity; 
            array_push($cart_items, $item_info); 
        }
    }
    $cart['items'] = $cart_items; 
    $cakes = array();
    if (isset($_SESSION['cakes'])) {
        foreach ($_SESSION['cakes'] as $cake => $sizes) {
            $cake_info = get_item_info($link, $cake); 
            if (is_null($cake_info)) {
                continue; 
            }
            $cake_info['sizes'] = $sizes; 
            array_push($cakes, $cake_info); 
        }
    }
    $cart['cakes'] = $cakes; 
    echo json_encode($cart); 
}

function get_item_info($link, $id) {
    $query = "SELECT dessert_item AS id, name, description, price FROM dessert_item WHERE dessert_item=$id";
    $result = mysqli_query($link, $query);
    if (!$result) {
        //echo "ERROR_QUERY_FAILED"; 
        return null; 
    }
    $row = mysqli_fetch_assoc($result); 
    if (!$row) {
        //echo "ERROR_ITEM_NOT_FOUND"; 
        return null; 
    }
    return $row; 
}

function update_cart($item, $quantity) {
    if ($quantity == 0) {
        unset($_SESSION['cart'][$item]); 
    }
    else {
        $_SESSION['cart'][$item] = $quantity; 
    }
}

function update_cake($cake, $size, $quantity) {
    if ($quantity == 0) {
        unset($_SESSION['cakes'][$cake][$size]); 
    }
    else {
        $_SESSION['cakes'][$cake][$size] = $quantity; 
    }
    if (count($_SESSION['cakes'][$cake]) == 0) {
        unset($_SESSION['cakes'][$cake]); 
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
    if (isset($_SESSION['cart'])) {
        foreach ($_SESSION['cart'] as $id=>$quantity) {
            $query = "INSERT INTO `order_item` (`dessert_order`,`dessert_item`,`cake_size`,`cost`,`quantity`) "; 
            $query .= "VALUES ($order_id, $id, NULL, 0.0, $quantity)"; 
            mysqli_query($link, $query); 
        }
        unset($_SESSION['cart']);
    }
    if (isset($_SESSION['cakes'])) {
        foreach($_SESSION['cakes'] as $cake=>$sizes) {
            foreach ($sizes as $size=>$quantity) {
                $query = "INSERT INTO `order_item` (`dessert_order`, `dessert_item`,`cake_size`,`cost`,`quantity`) ";
                $query.= "VALUES ($order_id, $cake, $size, 0.0, $quantity)"; 
                mysqli_query($link, $query); 
            }
        }
        unset($_SESSION['cakes']);
    }
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
    case "update-cake":
        $cake = $_POST['cake']; 
        $size = $_POST['size']; 
        $quantity = $_POST['quantity']; 
        update_cake($cake, $size, $quantity); 
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