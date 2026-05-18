import 'dotenv/config';
import pg from 'pg';
import format from 'pg-format';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: Number(process.env.port),
});

//Acquires list of created password databases
const getDatabases = async (request, result) => {
    try {
        const databaselist = await pool.query('SELECT * FROM password_databases ORDER BY database_name')
        result.json(databaselist.rows)
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with getting databases'});
    }
};

//Check if table already exists
const checkDatabase = async (request, result) => {
    const { databasename } = request.params;
    var exists = false;
    try {
        const databaseentry = format('SELECT * FROM password_databases WHERE database_name = %L', [databasename]);
        const database = await pool.query(databaseentry);
        if (database.rowCount > 0) {
            exists = true;
        }
        result.json({ exists });
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with checking database name'});
    }
};

//Creates a new password database
const createDatabase = async (request, result) => {
    const { databasename, password } = request.body;
    try {
        const entryquery = format('INSERT INTO password_databases (database_name, database_password) VALUES (%L, %L) RETURNING *', databasename, password);
        const newdatabaseentry = await pool.query(entryquery);
        const databasequery = format('CREATE TABLE IF NOT EXISTS %I (name VARCHAR(50) PRIMARY KEY,  username VARCHAR(50), phonenumber VARCHAR(10), email VARCHAR(50), password VARCHAR(50), date_created TIMESTAMP DEFAULT NOW(), date_updated TIMESTAMP DEFAULT NOW())', databasename);
        const newdatabase = await pool.query(databasequery);
        const extrafields = `${ databasename }_extra_values`;
        const extraquery = format('CREATE TABLE IF NOT EXISTS %I (name VARCHAR(50),  field_name VARCHAR(50), field_value VARCHAR(50), private boolean)', extrafields);
        const newdatabaseextras = await pool.query(extraquery);
        result.json(newdatabaseentry.rows[0]);
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with creating new database'});
    }
};

//Gets password for database by name
const getDatabasePassword = async (request, result) => {
    const { databasename } = request.params;
    var actualpassword = '';
    console.log(databasename);
    try {
        const passwordquery = format('SELECT database_password FROM password_databases WHERE database_name = %L', databasename);
        const password = await pool.query(passwordquery);
        if (password.rowCount > 0) {
            actualpassword = password.rows[0].database_password;
        }
        result.json({ actualpassword });

    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with retrieving database password'});
    }
    
};

//Deletes all tables for database and removes database entry from password_databases
const deleteDatabase = async (request, result) => {
    const { databasename } = request.params;
    try {
        const extrafields = `${ databasename }_extra_values`;
        const extraquery = format('DROP TABLE IF EXISTS %I', extrafields);
        const deletedatabaseextras = await pool.query(extraquery);
        const databasequery = format('DROP TABLE IF EXISTS %I', databasename);
        const deletedatabase = await pool.query(databasequery);
        const entryquery = format('DELETE FROM password_databases WHERE database_name = %L', databasename);
        const deletedatabaseentry = await pool.query(entryquery);  
        result.json({ databasename });
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with deleting database'});
    }
};

//Changes name for a database
const updateDatabaseName = async (request, result) => {
    const { databasename } = request.params;
    const { newdatabasename } = request.body;

    try {
        const extrafields = `${ databasename }_extra_values`;
        const newextrafields = `${ newdatabasename }_extra_values`;
        const extrafieldsquery = format('ALTER TABLE %I RENAME TO %I', extrafields, newextrafields);
        const extrafieldsdatabase = await pool.query(extrafieldsquery);
        const databasequery = format('ALTER TABLE %I RENAME TO %I', databasename, newdatabasename);
        const regulardatabase = await pool.query(databasequery);
        const namequery = format('UPDATE password_databases SET database_name = %L WHERE database_name = %L RETURNING *', newdatabasename, databasename);
        const newname = await pool.query(namequery);
        result.json(newname.rows[0]);
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with changing database name'});
    }
};

//Changes password for a database
const updateDatabasePassword = async (request, result) => {
    const { databasename } = request.params;
    const { password } = request.body;
    console.log('databasename:', databasename);
    console.log('password:', password);
    console.log('full body:', request.body);

    try {
        const passwordquery = format('UPDATE password_databases SET database_password = %L WHERE database_name = %L RETURNING *', password, databasename);
        const newpassword = await pool.query(passwordquery);
        result.json(newpassword.rows[0]);
    }
    catch (error) {
        console.error(error);
        result.status(500).json({message: 'Error with changing database password'});
    }
};

export {
    getDatabases,
    checkDatabase,
    createDatabase,
    getDatabasePassword,
    deleteDatabase,
    updateDatabaseName,
    updateDatabasePassword,
}
    
