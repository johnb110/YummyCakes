<?php
    $target_dir = "../images/"; 
    $target_file = $target_dir . basename($_FILES['imageFileUpload']["name"]); 
    $image_file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    if(isset($_POST["submit"])) {
        $check = getimagesize($_FILES["imageFileUpload"]["tmp_name"]);
        if($check !== false) {
            echo "File is an image - " . $check["mime"] . ".";
        } else {
            echo "ERROR_NOT_IMAGE";
        }
    }
    if (file_exists($target_file)) {
        exit(); 
    }

    if($image_file_type != "jpg" && $image_file_type != "png" && $image_file_type != "jpeg") {
        echo "ERROR_FILE_TYPE"; 
    }

    if (move_uploaded_file($_FILES["imageFileUpload"]["tmp_name"], $target_file)) {
        echo "FILE_UPLOADED";
    } else {
        echo "ERROR_FILE_UPLOAD";
    }
?>