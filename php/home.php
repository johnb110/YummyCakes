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

function add_to_cake($item, $size, $quantity) {
    if (!isset($_SESSION['cakes'])) {
        $_SESSION['cakes'] = array(); 
    }
    if (!isset($_SESSION['cakes'][$item])) {
        $_SESSION['cakes'][$item] = array(); 
    }
    if (!isset($_SESSION['cakes'][$item][$size])) {
        $_SESSION['cakes'][$item][$size] = 0; 
    }
    $_SESSION['cakes'][$item][$size] += $quantity;
}

function get_categories($link) {
    $is_admin = ($_SESSION['user'] == "admin" ? 0 : 1); 
    $query = "SELECT DISTINCT category FROM dessert_item 
        WHERE (available=1 OR available=$is_admin)
        ORDER BY category ASC"; 
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED: "; 
        echo mysqli_error($link); 
    }
    $categories = array(); 
    while ($row = mysqli_fetch_array($result)) {
        if ($row[0] != null) {
            array_push($categories, $row[0]);
        }
    }
    echo json_encode($categories); 
}

function get_dessert_items($link, $page, $page_size, $search, $category) {
    // Only retrieve currently available 
    $is_admin = ($_SESSION['user'] == "admin" ? 0 : 1); 
    $offset = ($page - 1) * $page_size; 
    $search_safe = mysqli_real_escape_string($link, trim($search)); 
    if ($category == "none") {
        $category = "%"; 
    }
    $ret_val = array(
        "admin" => ($_SESSION['user'] == "admin")
    );
    $query_count = "SELECT COUNT(*) 
        FROM dessert_item LEFT OUTER JOIN cake ON dessert_item.cake=cake.cake 
        WHERE (dessert_item.available=1 OR dessert_item.available=$is_admin) AND (cake.preset=1 OR cake.preset IS NULL)
        AND dessert_item.name LIKE '%$search%' AND dessert_item.category LIKE '$category'"; 
    $count_result = mysqli_query($link, $query_count); 
    if (!$count_result) {
        echo "ERROR_QUERY_FAILED: ";
        echo mysqli_error($link); 
    }
    $count_row = mysqli_fetch_array($count_result); 
    $pages = ceil($count_row[0] / $page_size); 
    $ret_val["pages"] = $pages; 

    $query = "SELECT dessert_item as id, name, image_file_name as file, description, price, 
        cake.cake as cake_id, dessert_item.available, category
        FROM dessert_item LEFT OUTER JOIN cake ON dessert_item.cake=cake.cake 
        WHERE (dessert_item.available=1 OR dessert_item.available=$is_admin) AND (cake.preset=1 OR cake.preset IS NULL)
        AND dessert_item.name LIKE '%$search%' AND dessert_item.category LIKE '$category'
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
    $cat = mysqli_real_escape_string($link, trim($changes["category"])); 
    $desc = mysqli_real_escape_string($link, trim($changes["description"]));
    $price = mysqli_real_escape_string($link, trim($changes["price"])); 
    $available = mysqli_real_escape_string($link, trim($changes["available"])); 

    $query = "UPDATE dessert_item 
        SET name='$name', image_file_name='$file', description='$desc', category='$cat', price=$price, available=$available
        WHERE dessert_item=$id;"; 

    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED"; 
        echo mysqli_error($link); 
    }
}

function insert_item($link, $new_item) {
    $name = mysqli_real_escape_string($link, trim($new_item["name"]));
    $file = null; 
    if (! is_null($new_item['image_file_name'])) {
        $file = mysqli_real_escape_string($link, trim($new_item["image_file_name"]));
    }
    $cat = mysqli_real_escape_string($link, trim($new_item['category'])); 
    $desc = mysqli_real_escape_string($link, trim($new_item["description"]));
    $price = mysqli_real_escape_string($link, trim($new_item["price"]));

    $query = "SELECT insert_new_item ('$name', '$file', '$desc', $price, '$cat');"; 
    
    $result = mysqli_query($link, $query); 
    if (!$result) {
        echo "ERROR_QUERY_FAILED";
        echo mysqli_error($link); 
        exit();
    }
    $row = mysqli_fetch_array($result); 
    $id = $row[0]; 

    $query = "SELECT dessert_item as id, name, image_file_name as file, description, price, 
        dessert_item.available, cake, category
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
        //echo json_encode($_POST);
        $search = $_POST['search']; 
        $category = $_POST['category']; 
        get_dessert_items($link, $page, $page_size, $search, $category); 
        mysqli_close($link); 
        break; 
    case "categories":
        $link = db_connect(); 
        if (!$link) {
            echo "ERROR_DB_CONNECT"; 
            exit(); 
        }
        get_categories($link); 
        mysqli_close($link); 
        break;
    case "add-cart":
        if (!(isset($_POST['item']) && isset($_POST['quantity']))) {
            echo "ERROR_PARAMS_NOT_SET"; 
            exit(); 
        }
        add_to_cart($_POST['item'], $_POST['quantity']); 
        break; 
    case "add-cake":
        add_to_cake($_POST['item'], $_POST['size'], $_POST['quantity']); 
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