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
    const { databaseName } = request.params;
    var exists = false;
    try {
        const databaseentry = format('SELECT * FROM password_databases WHERE database_name = %L', databaseName);
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

//Refactor for creating tables for database
const entryInsert = async (tableName, tabletype) => {
    //Query mapping for each table type
    const queries = {
        'entries': 'CREATE TABLE IF NOT EXISTS %I (name VARCHAR(50) PRIMARY KEY,  username VARCHAR(50), phonenumber VARCHAR(10), email VARCHAR(50), password VARCHAR(50), date_created TIMESTAMP DEFAULT NOW(), date_updated TIMESTAMP DEFAULT NOW())',
        'extra values': 'CREATE TABLE IF NOT EXISTS %I (name VARCHAR(50),  field_name VARCHAR(50), field_value VARCHAR(50), private boolean)'
    }
        
    try {
        //Grab associated sql query based on table type
        const query = format(queries[tabletype], tableName);
        //Execute query
        const newtable = await pool.query(query);
    }
    catch (error) {
        console.error('Error with creating new database table: ', error);
        result.status(500).json({message: 'Error with creating new table ' + tableName});
    }
}

//Creates a new password database
const createDatabase = async (request, result) => {
    const { databaseName, password } = request.body;
    try {
        //Add database to databases table
        const entryquery = format('INSERT INTO password_databases (database_name, database_password) VALUES (%L, %L) RETURNING *', databaseName, password);
        const newdatabaseentry = await pool.query(entryquery);
        //Create database table
        const newdatabase = entryInsert(databaseName, 'entries');
        //Create table for extra entries in the database
        const extraFields = `${ databaseName }_extra_values`;
        const newdatabaseextras = entryInsert(extraFields, 'extra values');
        //Create table for copies of database entries -> used to keep track of previous versions of entries
        const databaseCopies = `${ databaseName }_copies`;
        const newdatabaseCopies = entryInsert(databaseCopies, 'entries');
        //Create table for copies of extra fields -> used to keep track of previous versions of entries
        const extraFieldsCopies = extraFields + '_copies';
        const newdatabaseextrascopies = entryInsert(extraFieldsCopies, 'extra values');
        result.json(newdatabaseentry.rows[0]);
    }
    catch (error) {
        console.error('Error with creating new database: ', error);
        result.status(500).json({message: 'Error with creating new database'});
    }
};

//Checks inputted password for database by name and password
const checkDatabasePassword = async (request, result) => {
    const { databaseName } = request.params;
    const { password } = request.params; 
    console.log("check password database name: ", databaseName);
    console.log("check password password: ", password);
    var correct = false;
    try {
        const passwordquery = format('SELECT * FROM password_databases WHERE database_name = %L AND database_password = %L', databaseName, password);
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
    const { databaseName } = request.params;
    var actualpassword = '';
    console.log(databaseName);
    try {
        const passwordquery = format('SELECT database_password FROM password_databases WHERE database_name = %L', databaseName);
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

//Refactor for deleting databases
const databaseDelete = async (tableName) => {
    try {
        const query = format('DROP TABLE IF EXISTS %I', tableName);
        const deletequery = await pool.query(query);
    }
    catch (error) {
        console.error('Error with deleting table: ', error);
        result.status(500).json({message: 'Error with deleting table ' + tableName});
    }
};

//Deletes all tables for database and removes database entry from password_databases
const deleteDatabase = async (request, result) => {
    const { databaseName } = request.params;
    try {
        //Delete extra fields table
        const extraFields = `${ databaseName }_extra_values`;
        const deleteDatabaseExtras = databaseDelete(extraFields);
        //Delete extra fields copies table
        const extracopies = extraFields + '_copies';
        const deleteDatabaseExtrasCopies = databaseDelete(extracopies);
        //Delete database table
        const deletedatabase = databaseDelete(databaseName);
        //Delete database copies table
        const databaseCopies = databaseName + '_copies';
        const deletedatabaseCopies = databaseDelete(databaseCopies);

        //Delete database from password databases table
        const entryquery = format('DELETE FROM password_databases WHERE database_name = %L', databaseName);
        const deletedatabaseentry = await pool.query(entryquery);  
        result.json({ databaseName })
    }
    catch (error) {
        console.error('Error with deleting database: ', error);
        result.status(500).json({message: 'Error with deleting database'});
    }
};

//Changes name for a database
const updatedatabaseName = async (request, result) => {
    const { databaseName } = request.params;
    const { newdatabaseName } = request.body;

    try {
        const extraFields = `${ databaseName }_extra_values`;
        const newextraFields = `${ newdatabaseName }_extra_values`;
        const extraFieldsquery = format('ALTER TABLE %I RENAME TO %I', extraFields, newextraFields);
        const extraFieldsdatabase = await pool.query(extraFieldsquery);
        const databasequery = format('ALTER TABLE %I RENAME TO %I', databaseName, newdatabaseName);
        const regulardatabase = await pool.query(databasequery);
        const namequery = format('UPDATE password_databases SET database_name = %L WHERE database_name = %L RETURNING *', newdatabaseName, databaseName);
        const newName = await pool.query(namequery);
        result.json(newName.rows[0]);
    }
    catch (error) {
        console.error('Error with changing database name', error);
        result.status(500).json({message: 'Error with changing database name'});
    }
};

//Changes password for a database
const updateDatabasePassword = async (request, result) => {
    const { databaseName } = request.params;
    const { password } = request.body;
    console.log('databaseName:', databaseName);
    console.log('password:', password);
    console.log('full body:', request.body);

    try {
        const passwordquery = format('UPDATE password_databases SET database_password = %L WHERE database_name = %L RETURNING *', password, databaseName);
        const newPassword = await pool.query(passwordquery);
        result.json(newPassword.rows[0]);
    }
    catch (error) {
        console.error('Error with changing database password: ', error);
        result.status(500).json({message: 'Error with changing database password'});
    }
};

//Retrieves all entries for the database
const getEntries = async (request, result) => {
    const { databaseName } = request.params;
    try {
        const entryquery = format('SELECT * FROM %I ORDER BY name', databaseName);
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
    const { databaseName } = request.params;
    const { entryName } = request.body;
    try {
        const entryquery = format('INSERT INTO %I (name) VALUES (%L) RETURNING *', databaseName, entryName);
        const newEntry = await pool.query(entryquery);
        result.json(newEntry.rows[0]);
    }
    catch (error) {
        console.error('Error with creating new database entry: ', error);
        result.status(500).json({message: 'Error with creating new database entry'});
    }
}

//Check if entry already exists for database
const checkEntry = async (request, result) => {
    const { databaseName } = request.params;
    const { entryName } = request.params;
    var exists = false;
    try {
        const databaseentry = format('SELECT * FROM %I WHERE name = %L', databaseName, entryName);
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

//Refactors delete 
const entryDelete = async (tableName, entryName) => {
    try {
        console.log("helper delete entry database name: ", tableName);
        console.log("helper delete entry entry name: ", entryName);
        const query = format('DELETE FROM %I WHERE name = %L', tableName, entryName);
        const deletequery = await pool.query(query);
    }
    catch (error) {
        console.error('Error with deleting database entry: ', error);
        result.status(500).json({message: 'Error with deleting database entry for table ' + tableName});
    }
};

//Deletes an entry for a given database
const deleteEntry = async (request, result) => {
    const { databaseName } = request.params;
    const { entryName } = request.params;
    console.log("delete entry database name: ", databaseName);
    console.log("delete entry entry name: ", entryName);
    try {
        console.log("in try delete entry database name: ", databaseName);
        console.log("in try delete entry entry name: ", entryName);
        //Delete entry from extra fields table
        const extraFields = `${ databaseName }_extra_values`;
        const deleteDatabaseExtras = entryDelete(extraFields, entryName);
        //Delete entry from extra fields copies table 
        const extraFieldsCopies = extraFields + '_copies';
        const deleteDatabaseExtrasCopies = entryDelete(extraFieldsCopies, entryName);
        //Delete entry from database table
        const deleteEntry = entryDelete(databaseName, entryName);
        //Delete entry from database copies table
        const databaseCopies = databaseName + '_copies';
        const deleteEntryCopies = entryDelete(databaseCopies, entryName);
        result.json({ deleteEntry });
    }
    catch (error) {
        console.error('Error with deleting database entry: ', error);
        result.status(500).json({message: 'Error with deleting database entry'});
    }
};

//Retrieves all fields 
const getEntryFields = async (request, result) => {
    const { databaseName } = request.params;
    const { entryName } = request.params;
    try {
        const entryquery = format('SELECT * FROM %I WHERE name = %L', databaseName, entryName);
        const entrylist = await pool.query(entryquery);
        const extraFields = `${ databaseName }_extra_values`;
        const extraFieldsquery = format('SELECT field_name, field_value, private FROM %I WHERE name = %L', extraFields, entryName);
        const extraFieldslist = await pool.query(extraFieldsquery);
        const fullentry = {
            mainfields: entrylist.rows[0],
            extraFields: extraFieldslist.rows
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
    updatedatabaseName,
    updateDatabasePassword,
    getEntries,
    checkEntry,
    createEntry,
    deleteEntry,
    getEntryFields,
}
    
