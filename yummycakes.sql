-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2019 at 08:03 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `yummycakes`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_new_user` (IN `email` VARCHAR(250), IN `pass_word` VARCHAR(100), IN `phone` VARCHAR(10))  BEGIN
	INSERT INTO user VALUES (email, pass_word, phone); 
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `add_new_custom` (`category` VARCHAR(100), `value` VARCHAR(100)) RETURNS INT(11) NO SQL
BEGIN
	INSERT INTO `custom` (`category`, `value`, `available`) 
    VALUES (category, value, 1); 
    RETURN LAST_INSERT_ID();
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `create_new_cake` (`flavor` INT, `frosting` INT, `filling` INT, `preset` TINYINT(1)) RETURNS INT(11) NO SQL
BEGIN
    INSERT INTO `cake` (`flavor`, `frosting`, `filling`, `preset`, `available`) 
        VALUES (flavor, frosting, filling, preset, 1); 
    SELECT LAST_INSERT_ID() INTO @cake_id; 
    SELECT value INTO @flv_name FROM custom WHERE `custom`=flavor;
    SELECT value INTO @fst_name FROM `custom` WHERE `custom`=frosting;
    SELECT value INTO @fll_name FROM `custom` WHERE `custom`=filling;
    SET @desc = CONCAT('Flavor: ',@flv_name,', Frosting: ',@fst_name,', Filling: ',@fll_name);
    INSERT INTO `dessert_item` (`name`, `category`,`description`, `price`, `available`, `cake`) 
        VALUES ('Custom Cake', 'cake', @desc, 0.32, 1, @cake_id); 
    RETURN LAST_INSERT_ID();
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `insert_new_item` (`name` VARCHAR(100), `image_file_name` VARCHAR(250), `description` VARCHAR(500), `price` DECIMAL(10,2), `category` VARCHAR(100)) RETURNS INT(11) NO SQL
BEGIN
	IF image_file_name='' THEN
    	INSERT INTO dessert_item (`name`, `category`, `description`,
        	`price`, `available`)
            VALUES (name, category, description, price, 1); 
    ELSE
    	INSERT INTO dessert_item (`name`, `image_file_name`, 					`description`, `price`, `category`, `available`) 
        VALUES (name, image_file_name, description, price, category, 1);
    END IF; 
     
    RETURN LAST_INSERT_ID();
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `start_order` (`user` VARCHAR(250), `total_cost` DECIMAL(10,2), `placed` DATE, `expected` DATE, `comments` VARCHAR(500)) RETURNS TINYINT(1) BEGIN 
	INSERT INTO `dessert_order` (`user`, `total_cost`, `placed`, `expected`, `comments`) 
    VALUES (user, total_cost, placed, expected, comments);
	RETURN LAST_INSERT_ID(); 
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `user_exists` (`email` VARCHAR(250)) RETURNS TINYINT(1) BEGIN
	SET @result = false; 
	SELECT COUNT(1) INTO @found FROM `user` WHERE `user`=email;
    IF @found > 0 THEN
    	SET @result = true;
    END IF;
    RETURN @result;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cake`
--

CREATE TABLE `cake` (
  `cake` int(11) NOT NULL,
  `flavor` int(11) NOT NULL,
  `frosting` int(11) NOT NULL,
  `filling` int(11) NOT NULL,
  `preset` tinyint(1) NOT NULL,
  `available` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cake`
--

INSERT INTO `cake` (`cake`, `flavor`, `frosting`, `filling`, `preset`, `available`) VALUES
(5, 61, 67, 73, 0, 1),
(6, 61, 67, 72, 1, 1),
(7, 63, 67, 73, 1, 1),
(10, 64, 68, 72, 1, 1),
(11, 61, 70, 72, 1, 1),
(12, 81, 67, 72, 0, 1),
(13, 63, 71, 73, 0, 1),
(14, 65, 71, 72, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `custom`
--

CREATE TABLE `custom` (
  `custom` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `value` varchar(100) NOT NULL,
  `available` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `custom`
--

INSERT INTO `custom` (`custom`, `category`, `value`, `available`) VALUES
(61, 'flavor', 'Chocolate', 1),
(62, 'flavor', 'Vanilla', 1),
(63, 'flavor', 'Butter', 1),
(64, 'flavor', 'Strawberry', 1),
(65, 'flavor', 'Red Velvet', 1),
(66, 'flavor', 'Carrot', 0),
(67, 'frosting', 'Chocolate', 1),
(68, 'frosting', 'Vanilla', 1),
(69, 'frosting', 'Strawberry', 1),
(70, 'frosting', 'Peanut Butter', 1),
(71, 'frosting', 'Cream Cheese', 1),
(72, 'filling', '[None]', 1),
(73, 'filling', 'Chocolate Pudding', 1),
(74, 'filling', 'Fruit', 1),
(75, 'filling', 'Marshmallow Cream', 1),
(76, 'frosting', 'Cinammon', 1),
(77, 'frosting', 'Coffee', 1),
(78, 'frosting', 'Lemon', 1),
(79, 'frosting', 'Blueberry', 1),
(80, 'flavor', 'Lemon', 1),
(81, 'flavor', 'Marble', 1),
(82, 'flavor', 'Blueberry', 1);

-- --------------------------------------------------------

--
-- Table structure for table `dessert_item`
--

CREATE TABLE `dessert_item` (
  `dessert_item` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `image_file_name` varchar(250) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `available` int(11) NOT NULL,
  `cake` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dessert_item`
--

INSERT INTO `dessert_item` (`dessert_item`, `name`, `category`, `image_file_name`, `description`, `price`, `available`, `cake`) VALUES
(25, 'Chocolate-Dipped Pretzels', 'other', 'chocolate_dipped_pretzel_rods.jpg', 'Pretzels dipped in chocolate and sprinkles (6)', '2.99', 1, NULL),
(26, 'Rice Krispie Treat', 'treats', 'White-Chocolate-Krispie-Treats-Image.JPG', 'Traditional Rice Krispie Treat dipped in white chocolate (5)', '2.99', 0, NULL),
(27, 'Cake Balls', 'other', 'cake_balls.jpg', 'Assorted cake balls (6)', '2.99', 1, NULL),
(28, 'Chocolate Chip Cookies', 'cookies', 'chocolate_chip_cookies.jpg', 'Traditional chocolate chip cookies, like mom used to make (6)', '5.99', 1, NULL),
(29, 'Peanut Butter Cookies', 'cookies', 'peanut_butter_cookies.jpg', 'Peanut butter-flavored cookies (6)', '5.99', 1, NULL),
(30, 'Sugar Cookies', 'cookies', 'frosted_sugar_cookies.jpg', 'Classic sugar cookies, with pink frosting and sprinkles (6)', '5.99', 1, NULL),
(31, 'Snickerdoodles', 'cookies', 'snickerdoodles.jpg', 'Cookies baked with cinnamon and sugar (6)', '5.99', 1, NULL),
(32, 'Chocolate Cupcakes', 'cupcakes', 'chocolate_cupcakes.jpg', 'Chocolate cupcakes with chocolate frosting (4)', '4.99', 1, NULL),
(34, 'Custom Cake', 'cake', NULL, 'Flavor: Chocolate, Frosting: Chocolate, Filling: Chocolate Pudding', '0.32', 1, 5),
(35, 'Chocolate Chocolate Cake', 'cake', 'chocolate_chocolate_cake.jpg', 'Chocolate inside, chocolate outside! Chocolate everywhere!', '0.32', 1, 6),
(41, 'Fudge Brownies', 'brownies', 'brownies.jpg', 'Yummy brownies! (6)', '10.99', 1, NULL),
(44, 'Cheesecake Bites', 'other', 'cheesecake_bites.jpg', 'Chocolate-covered strawberry cheesecake bites (10)', '19.99', 1, NULL),
(45, 'Classic Butter Cake', 'cake', 'butter_cake_chocolate_frosting.jpg', 'Yellow butter cake with chocolate frosting. A classic!', '0.32', 1, 7),
(48, 'Blueberry Muffin', 'muffins', 'blueberry_muffins.jpg', 'Muffin baked with fresh, wild blueberries.', '1.99', 1, NULL),
(49, 'Lemon Poppyseed Muffin', 'muffins', 'lemon_poppyseed_muffins.jpg', 'Lemon muffin with poppy seeds baked in!', '1.99', 1, NULL),
(50, 'Cinnamon Streusel Muffin', 'muffins', 'cinnamon_streusel_muffins.jpg', 'Muffin baked with cinnamon and streusel on top!', '1.99', 1, NULL),
(52, 'Chocolate Chip Muffin', 'muffins', 'chocolate_muffins.jpg', 'Chocolate muffin baked with chocolate chips.', '1.99', 1, NULL),
(53, 'Bran Muffin', 'muffins', 'bran_muffins.jpg', 'Bran muffins aren\'t very good but some people like them.', '1.99', 1, NULL),
(57, 'Lemon Bars', 'other', 'lemon_bars.jpg', 'Lemon bars sprinkled with powdered sugar (6)', '4.99', 1, NULL),
(60, 'Peanut Butter Brownies', 'brownies', 'peanut_butter_brownies.jpg', 'Yummy peanut butter brownies (so good) (6)', '13.99', 1, NULL),
(61, 'Strawberry Cake', 'cake', 'strawberry_cake_vanilla_frosting.jpg', 'Strawberry-flavored cake with vanilla frosting!', '0.32', 1, 10),
(62, 'White Chocolate Macadamia Nut Cookies', 'cookies', 'white_chocolate_macadamia_nut_cookies.jpg', 'Cookies with white chocolate chips and macadamia nuts!', '5.99', 1, NULL),
(63, 'Chocolate Chocolate Chip Cookies', 'cookies', 'chocolate_chocolate_chip_cookies.jpg', 'Chocolate cookies with chocolate chips - lots of chocolate!', '6.99', 1, NULL),
(64, 'Lemon Cookies', 'cookies', 'lemon_cookies.jpg', 'Lemon-flavored cookies!', '5.99', 1, NULL),
(65, 'Chocolate Peanut Butter Cookies', 'cookies', 'chocolate_peanut_butter_cookies.jpg', 'Peanut butter sandwich cookies covered in chocolate!', '7.99', 1, NULL),
(66, 'Oatmeal Raisin Cookies', 'cookies', 'oatmeal_raisin_cookies.jpg', 'Because you have to throw in oatmeal raisin, I guess. Who likes these, anyway?', '3.99', 1, NULL),
(67, 'Chocolate Peanut Butter Cake', 'cake', 'chocolate_peanut_butter_cake.jpg', 'Chocolate cake with peanut butter frosting. Made with real peanut butter!', '0.32', 1, 11),
(68, 'Coffee Cake', 'baked goods', 'coffee_cake.jpg', 'Coffee pound cake with cinnamon and pecans!', '8.99', 1, NULL),
(69, 'French Cruller Donuts', 'baked goods', 'french_cruller_donuts.jpg', 'Delicious french cruller donuts with a sweet glaze! (4)', '7.99', 1, NULL),
(70, 'Tiger Butter', 'fudge', 'tiger_butter.jpg', 'Fudge made with peanut butter and chocolate mixed together!', '5.99', 1, NULL),
(71, 'Cake Batter Fudge', 'fudge', 'cake_batter_fudge.jpg', 'Fudge made with cake batter! And sprinkles!', '7.99', 1, NULL),
(72, 'Peanut Butter Fudge', 'fudge', 'peanut_butter_fudge.jpg', 'Fudge made with creamy peanut butter!', '5.99', 1, NULL),
(73, 'Custom Cake', 'cake', NULL, 'Flavor: Marble, Frosting: Chocolate, Filling: [None]', '0.32', 1, 12),
(74, 'Custom Cake', 'cake', NULL, 'Flavor: Butter, Frosting: Cream Cheese, Filling: Chocolate Pudding', '0.32', 1, 13),
(75, 'Custom Cake', 'cake', NULL, 'Flavor: Red Velvet, Frosting: Cream Cheese, Filling: [None]', '0.32', 1, 14);

-- --------------------------------------------------------

--
-- Table structure for table `dessert_order`
--

CREATE TABLE `dessert_order` (
  `dessert_order` int(11) NOT NULL,
  `user` varchar(250) NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `placed` date NOT NULL,
  `expected` date NOT NULL,
  `comments` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `dessert_order`
--

INSERT INTO `dessert_order` (`dessert_order`, `user`, `total_cost`, `placed`, `expected`, `comments`) VALUES
(32, 'johnberlien@gmail.com', '2.99', '2019-04-18', '2019-04-25', 'Yummy!'),
(33, 'johnberlien@gmail.com', '11.96', '2019-04-26', '2019-05-03', 'Yum!'),
(34, 'johnberlien@gmail.com', '20.48', '2019-04-27', '2019-05-04', 'I want my cake!'),
(35, 'cakelover@gmail.com', '57.45', '2019-04-28', '2019-05-05', 'I really like cake!'),
(36, 'user@gmail.com', '183.36', '2019-04-29', '2019-05-06', 'I like cakes!'),
(37, 'user@gmail.com', '2.99', '2019-04-29', '2019-04-28', 'Yummy');

-- --------------------------------------------------------

--
-- Table structure for table `order_item`
--

CREATE TABLE `order_item` (
  `dessert_order` int(11) NOT NULL,
  `dessert_item` int(11) NOT NULL,
  `cake_size` int(11) DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `order_item`
--

INSERT INTO `order_item` (`dessert_order`, `dessert_item`, `cake_size`, `cost`, `quantity`) VALUES
(32, 25, NULL, '0.00', 1),
(33, 25, NULL, '0.00', 4),
(34, 35, 8, '0.00', 1),
(35, 27, NULL, '0.00', 2),
(35, 32, NULL, '0.00', 1),
(35, 44, NULL, '0.00', 1),
(35, 48, NULL, '0.00', 1),
(35, 57, NULL, '0.00', 1),
(35, 61, 6, '0.00', 1),
(35, 65, NULL, '0.00', 1),
(36, 27, NULL, '0.00', 6),
(36, 35, 10, '0.00', 3),
(36, 52, NULL, '0.00', 1),
(36, 62, NULL, '0.00', 1),
(36, 74, 8, '0.00', 3),
(37, 25, NULL, '0.00', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user` varchar(250) NOT NULL,
  `pass_word` varchar(100) NOT NULL,
  `phone` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user`, `pass_word`, `phone`) VALUES
('admin', '1d707811988069ca760826861d6d63a10e8c3b7f171c4441a6472ea58c11711b', NULL),
('cakelover@gmail.com', '38565b2f27ece968c8e9b5655d6667f7ec09757ac99b834626db86b3b1175395', '2812812811'),
('johnberlien@gmail.com', '1d707811988069ca760826861d6d63a10e8c3b7f171c4441a6472ea58c11711b', '1234567890'),
('user@gmail.com', '1d707811988069ca760826861d6d63a10e8c3b7f171c4441a6472ea58c11711b', '1234567890');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cake`
--
ALTER TABLE `cake`
  ADD PRIMARY KEY (`cake`),
  ADD KEY `cake_flavor_to_custom` (`flavor`),
  ADD KEY `cake_filling_to_custom` (`filling`),
  ADD KEY `cake_frosting_to_custom` (`frosting`);

--
-- Indexes for table `custom`
--
ALTER TABLE `custom`
  ADD PRIMARY KEY (`custom`);

--
-- Indexes for table `dessert_item`
--
ALTER TABLE `dessert_item`
  ADD PRIMARY KEY (`dessert_item`),
  ADD KEY `dessert_item_to_cake` (`cake`);

--
-- Indexes for table `dessert_order`
--
ALTER TABLE `dessert_order`
  ADD PRIMARY KEY (`dessert_order`),
  ADD KEY `user` (`user`);

--
-- Indexes for table `order_item`
--
ALTER TABLE `order_item`
  ADD PRIMARY KEY (`dessert_order`,`dessert_item`),
  ADD KEY `order_item_to_item` (`dessert_item`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cake`
--
ALTER TABLE `cake`
  MODIFY `cake` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `custom`
--
ALTER TABLE `custom`
  MODIFY `custom` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `dessert_item`
--
ALTER TABLE `dessert_item`
  MODIFY `dessert_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `dessert_order`
--
ALTER TABLE `dessert_order`
  MODIFY `dessert_order` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cake`
--
ALTER TABLE `cake`
  ADD CONSTRAINT `cake_filling_to_custom` FOREIGN KEY (`filling`) REFERENCES `custom` (`custom`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cake_flavor_to_custom` FOREIGN KEY (`flavor`) REFERENCES `custom` (`custom`) ON UPDATE CASCADE,
  ADD CONSTRAINT `cake_frosting_to_custom` FOREIGN KEY (`frosting`) REFERENCES `custom` (`custom`) ON UPDATE CASCADE;

--
-- Constraints for table `dessert_item`
--
ALTER TABLE `dessert_item`
  ADD CONSTRAINT `dessert_item_to_cake` FOREIGN KEY (`cake`) REFERENCES `cake` (`cake`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dessert_order`
--
ALTER TABLE `dessert_order`
  ADD CONSTRAINT `order_to_user` FOREIGN KEY (`user`) REFERENCES `user` (`user`) ON UPDATE CASCADE;

--
-- Constraints for table `order_item`
--
ALTER TABLE `order_item`
  ADD CONSTRAINT `order_item_to_item` FOREIGN KEY (`dessert_item`) REFERENCES `dessert_item` (`dessert_item`),
  ADD CONSTRAINT `order_item_to_order` FOREIGN KEY (`dessert_order`) REFERENCES `dessert_order` (`dessert_order`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
