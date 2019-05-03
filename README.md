# YummyCakes
(Obviously) non-working website to order cakes and other sweets. School project

#### Requirements/Dependencies/Technologies:
* xampp server is used for development
* MySQL is used for database, included in xampp
* Bootstrap 4
* JQuery


#### Functionality of website:
* User login
  * Inserts new users into database with hashed passwords
  * Retrieves user names and checks password for login
* User/Admin
  * Several pages have separate user/admin functionality
  * Admin can make changes to database through website interface
    * This includes modifying items/cakes and creating new items/cakes
* Item browsing
  * Retrieves items from the database marked "available" by admin
  * User can scroll through list, using pages
  * user can search for items
    * user can filter items by category
#### Custom cake creating
  * Retrieves available options for cake flavor, frosting, and filling

#### Structure:
* Each html file is stored under its individual folder
* Name of the html file same as folder name, e.g. home.html is under /home/home.html

#### Javascript:
* js files stored in /js/ folder
* Each html page references YummyCakes.js
  * Contains functionality for: checking/getting login info, and redirects if not logged in
  * Also attaches logout function to logout button

#### PHP:
* php files stored in /php/ folder

#### Images:
* image files stored in /images/ folder
* database entry contains file name, so if images are not stored here, they will not be retrieved
