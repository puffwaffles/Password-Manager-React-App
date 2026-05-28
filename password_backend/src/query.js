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
        const databaselist = await pool.query('SELECT * FROM password_databases ORDER BY database_name');
        result.json(databaselist.rows);
    }
    catch (error) {
        console.error('Error with getting databases: ', error);
        result.status(500).json({message: 'Error with getting databases'});
    }
};

//Check if table already exists
const checkDatabase = async (request, result) => {
    const { databasename } = request.params;
    var exists = false;
    try {
        const databaseentry = format('SELECT * FROM password_databases WHERE database_name = %L', databasename);
        const database = await pool.query(databaseentry);
        if (database.rowCount > 0) {
            exists = true;
        }
        result.json({ exists });
    }
    catch (error) {
        console.error('Error with checking database name: ', error);
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
        console.error('Error with creating new database: ', error);
        result.status(500).json({message: 'Error with creating new database'});
    }
};

//Checks inputted password for database by name and password
const checkDatabasePassword = async (request, result) => {
    const { databasename } = request.params;
    const { password } = request.params; 
    console.log("check password database name: ", databasename);
    console.log("check password password: ", password);
    var correct = false;
    try {
        const passwordquery = format('SELECT * FROM password_databases WHERE database_name = %L AND database_password = %L', databasename, password);
        const correctpassword = await pool.query(passwordquery);
        correct = correctpassword.rowCount > 0 ? true : false;
        console.log("correct: ", correct);
        result.json({ correct });
    }
    catch (error) {
        console.error('Error with retrieving database password: ', error);
        result.status(500).json({message: 'Error with checking database password'});
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
        console.error('Error with retrieving database password: ', error);
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
        console.error('Error with deleting database: ', error);
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
        console.error('Error with changing database name', error);
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
        console.error('Error with changing database password: ', error);
        result.status(500).json({message: 'Error with changing database password'});
    }
};

//Retrieves all entries for the database
const getEntries = async (request, result) => {
    const { databasename } = request.params;
    try {
        const entryquery = format('SELECT * FROM %I ORDER BY name', databasename);
        const entrylist = await pool.query(entryquery);
        result.json(entrylist.rows);
    }
    catch (error) {
        console.error('Error with getting database entries: ', error);
        result.status(500).json({message: 'Error with getting database entries'});
    }
};

//Creates new entry for database
const createEntry = async (request, result) => {
    const { databasename } = request.params;
    const { entryname } = request.body;
    try {
        const entryquery = format('INSERT INTO %I (name) VALUES (%L) RETURNING *', databasename, entryname);
        const newentry = await pool.query(entryquery);
        result.json(newentry.rows[0]);
    }
    catch (error) {
        console.error('Error with creating new database entry: ', error);
        result.status(500).json({message: 'Error with creating new database entry'});
    }
}

//Check if entry already exists for database
const checkEntry = async (request, result) => {
    const { databasename } = request.params;
    const { entryname } = request.params;
    var exists = false;
    try {
        const databaseentry = format('SELECT * FROM %I WHERE name = %L', databasename, entryname);
        const database = await pool.query(databaseentry);
        if (database.rowCount > 0) {
            exists = true;
        }
        result.json({ exists });
    }
    catch (error) {
        console.error('Error with checking database name: ', error);
        result.status(500).json({message: 'Error with checking database name'});
    }
};

//Deletes an entry for a given database
const deleteEntry = async (request, result) => {
    const { databasename } = request.params.databasename;
    const { entryname } = request.params.entryname;
    try {
        const extrafields = `${ databasename }_extra_values`;
        const extraquery = format('DELETE FROM %I WHERE name = %L', extrafields, entryname);
        const deletedatabaseextras = await pool.query(extraquery);
        const entryquery = format('DELETE FROM %I WHERE name = %L', databasename, entryname);
        const deleteentry = await pool.query(databasequery);
        result.json({ deleteentry });
    }
    catch (error) {
        console.error('Error with deleting database entry: ', error);
        result.status(500).json({message: 'Error with deleting database entry'});
    }
};

//Retrieves all fields 
const getEntryFields = async (request, result) => {
    const { databasename } = request.params;
    const { entryname } = request.params;
    try {
        const entryquery = format('SELECT * FROM %I WHERE name = %L', databasename, entryname);
        const entrylist = await pool.query(entryquery);
        const extrafields = `${ databasename }_extra_values`;
        const extrafieldsquery = format('SELECT field_name, field_value, private FROM %I WHERE name = %L', extrafields, entryname);
        const extrafieldslist = await pool.query(extrafieldsquery);
        const fullentry = {
            mainfields: entrylist.rows[0],
            extrafields: extrafieldslist.rows
        }   
        result.json(fullentry);
    }
    catch (error) {
        console.error('Error with getting entry fields: ', error);
        result.status(500).json({message: 'Error with getting entry fields'});
    }
};

export {
    pool,
    getDatabases,
    checkDatabase,
    createDatabase,
    checkDatabasePassword,
    getDatabasePassword,
    deleteDatabase,
    updateDatabaseName,
    updateDatabasePassword,
    getEntries,
    checkEntry,
    createEntry,
    deleteEntry,
    getEntryFields,
}
    
