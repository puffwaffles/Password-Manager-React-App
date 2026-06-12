# Password-Manager-React-App
A react app for managing passwords.

Front end: React using axios to access the backend
Backend: Express.js using Postgresql for database management. Docker was used to containerize the backend

This password manager app is a crud app used for storing databases.

Backend database tables:
* password_databases-> table for storing created password databases and associated passwords. Must be premade before running program.
* session-> table for storing user session to keep track of database login, entry, and version to access. Must be premade before running program.
* {database name}-> table for storing entries for created password database. Uses database name for table name
* {database name}_copies-> table for storing previous versions of created entries. Uses database name + "_copies" for table name

Users can:
* Create separate password databases to store passwords and set the database name and password 
* View a list of created password databases 
* Log in to database with password
* Delete password databases
* Create entries for each password database
* View list of entries and edit entries
* Delete entries
* Edit entry values
* Access to previous versions of entries to revert to

Features that could be implemented in the future:
* Encryption to avoid plaintext storage
* A search function for entries
* More entry formats i.e. cards to enter
* A way to export databases as a file