/*
Creates the table for storing password database names and passwords
*/
CREATE TABLE IF NOT EXISTS password_databases (
    database_name VARCHAR(50) PRIMARY KEY,
    database_password VARCHAR(50)
);

/*
Creates session table to keep track of login, database used and entry accessed
*/

CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
); 