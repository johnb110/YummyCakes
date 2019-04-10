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

function get_dessert_items($link, $page, $page_size) {
    // Only retrieve currently available 
    $is_admin = ($_SESSION['user'] == "admin" ? 0 : 1); 
    $offset = ($page - 1) * $page_size; 
    $ret_val = array(
        "admin" => ($_SESSION['user'] == "admin")
    );
    $query = "SELECT dessert_item as id, name, image_file_name as file, description, price, cake.cake as cake_id, dessert_item.available 
        FROM dessert_item LEFT OUTER JOIN cake ON dessert_item.cake=cake.cake 
        WHERE (dessert_item.available=1 OR dessert_item.available=$is_admin) AND (cake.preset=1 OR cake.preset IS NULL)
        LIMIT $page_size OFFSET $offset"; 
    $result = mysqli_query($link, $query);
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        echo mysqli_error($link); 
        return false; 
    }
    $items = array(); 
    while ($row = mysqli_fetch_assoc($result)) {
        array_push($items, $row); 
    } 
    $ret_val['items'] = $items; 
    echo json_encode($ret_val); 
}

function update_item($link, $changes) {
    $id = $changes["id"]; 
    $name = mysqli_real_escape_string($link, trim($changes["name"]));
    $file = mysqli_real_escape_string($link, trim($changes["file"]));
    $desc = mysqli_real_escape_string($link, trim($changes["description"]));
    $price = mysqli_real_escape_string($link, trim($changes["price"])); 
    $available = mysqli_real_escape_string($link, trim($changes["available"])); 

    $query = "UPDATE dessert_item 
        SET name='$name', image_file_name='$file', description='$desc', price=$price, available=$available
        WHERE dessert_item=$id;"; 

    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        echo mysqli_error($link); 
    }
}

function insert_item($link, $new_item) {
    $name = mysqli_real_escape_string($link, trim($new_item["name"]));
    $file = mysqli_real_escape_string($link, trim($new_item["image_file_name"]));
    $desc = mysqli_real_escape_string($link, trim($new_item["description"]));
    $price = mysqli_real_escape_string($link, trim($new_item["price"]));

    $query = "SELECT insert_new_item ('$name', '$file', '$desc', $price);"; 
    
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED";
        echo mysqli_error($link); 
        exit();
    }
    $row = mysqli_fetch_array($result); 
    $id = $row[0]; 

    $query = "SELECT dessert_item as id, name, image_file_name as file, description, price, dessert_item.available, cake
        FROM dessert_item WHERE dessert_item=$id;"; 
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED";
        echo mysqli_error($link); 
        exit(); 
    }
    $added_item = mysqli_fetch_assoc($result); 
    echo json_encode($added_item); 
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
        $page = $_POST['page'];
        $page_size = $_POST['page_size'];
        get_dessert_items($link, $page, $page_size); 
        mysqli_close($link); 
        break; 
    case "add-cart":
        if (!(isset($_POST['item']) && isset($_POST['quantity']))) {
            echo "ERROR_PARAMS_NOT_SET"; 
            exit(); 
        }
        add_to_cart($_POST['item'], $_POST['quantity']); 
        break; 
    case "update":
        if ($_SESSION['user'] != "admin") {
            echo "ERROR_PRIVELEGES"; 
            exit(); 
        }
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT"; 
            exit(); 
        }
        $changes = json_decode($_POST['changes'], true); 
        update_item($link, $changes); 
        mysqli_close($link); 
        break; 
    case "insert":
        if ($_SESSION['user'] != "admin") {
            echo "ERROR_PRIVELEGES";
            exit();
        }
        $link = db_connect();
        if (!$link) {
            echo "ERROR_DB_CONNECT";
            exit();
        }
        $new_item = json_decode($_POST['item'], true);
        insert_item($link, $new_item); 
        mysqli_close($link); 
        break; 
    case "logout":
        session_destroy(); 
        break;
}

?>