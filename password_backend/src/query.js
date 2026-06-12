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
        'entries': 'CREATE TABLE IF NOT EXISTS %I (entry_id BIGINT GENERATED ALWAYS AS IDENTITY, name VARCHAR(50) PRIMARY KEY,  username VARCHAR(50), phone_number VARCHAR(10), email VARCHAR(50), password VARCHAR(50), extras VARCHAR(1000), date_created TIMESTAMP(3) DEFAULT NOW(), date_updated TIMESTAMP(3) DEFAULT NOW())',
        'entries copies': 'CREATE TABLE IF NOT EXISTS %I (entry_id BIGINT, name VARCHAR(50),  username VARCHAR(50), phone_number VARCHAR(10), email VARCHAR(50), password VARCHAR(50), extras VARCHAR(1000), date_updated TIMESTAMP(3) DEFAULT NOW())',
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
        const newDatabaseentry = await pool.query(entryquery);
        //Create database table
        const newDatabase = entryInsert(databaseName, 'entries');
        //Create table for copies of database entries -> used to keep track of previous versions of entries
        const databaseCopies = `${ databaseName }_copies`;
        const newDatabaseCopies = entryInsert(databaseCopies, 'entries copies');
        
        result.json(newDatabaseentry.rows[0]);
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
    var correct = false;
    try {
        const passwordquery = format('SELECT * FROM password_databases WHERE database_name = %L AND database_password = %L', databaseName, password);
        const correctpassword = await pool.query(passwordquery);
        correct = correctpassword.rowCount > 0 ? true : false;
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
    const { newDatabaseName } = request.body;
    
    try {
        //Rename copies table
        const databaseCopiesName = databaseName + '_copies';
        const newDatabaseCopiesName = newDatabaseName + '_copies';
        const copyQuery = format('ALTER TABLE %I RENAME TO %I', databaseCopiesName, newDatabaseCopiesName);
        const copyDatabase = await pool.query(copyQuery);
        
        //Rename main entries table
        const databaseQuery = format('ALTER TABLE %I RENAME TO %I', databaseName, newDatabaseName);
        const regulardatabase = await pool.query(databaseQuery);
        
        //Update table for databases
        const nameQuery = format('UPDATE password_databases SET database_name = %L WHERE database_name = %L RETURNING *', newDatabaseName, databaseName);
        const newName = await pool.query(nameQuery);
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
        const entryList = await pool.query(entryquery);
        result.json(entryList.rows);
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
const entryDelete = async (tableName, entryId) => {
    try {
        const query = format('DELETE FROM %I WHERE entry_id = %L', tableName, entryId);
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
    const { entryId } = request.params;
    try {
        //Delete entry from database table
        const deleteEntry = entryDelete(databaseName, entryId);
        //Delete entry from database copies table
        const databaseCopies = databaseName + '_copies';
        const deleteEntryCopies = entryDelete(databaseCopies, entryId);
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
    const { entryId } = request.params;
    try {
        const entryQuery = format('SELECT * FROM %I WHERE entry_id = %L', databaseName, entryId);
        const entryList = await pool.query(entryQuery);
        //Get copies
        const databaseCopies = databaseName + '_copies';
        const copyQuery = format('SELECT date_updated FROM %I WHERE entry_id = %L ORDER BY date_updated DESC', databaseCopies, entryId);
        const copiesList = await pool.query(copyQuery);
        const fullentry = {
            mainfields: entryList.rows[0],
            copies: copiesList.rows
        }   
        result.json(fullentry);
    }
    catch (error) {
        console.error('Error with getting entry fields: ', error);
        result.status(500).json({message: 'Error with getting entry fields'});
    }
};

//Updates fields
const updateFields = async (tableName, entryId, fieldNames, fields, timestamp) => {
    //Get first part of update statement
    const firstQueryPart = 'UPDATE %I SET';
    var middleQueryPart = '';
    //Extract field names from array and append them to statement
    for (var i = 0; i < fieldNames.length; i++) {
        middleQueryPart += ' ' + fieldNames[i] + ' = %L';
        middleQueryPart += ',';
    }
    //Get last part of statement
    const lastQueryPart = ' date_updated = %L WHERE entry_id = %L';
    try {
        //Combine statement and used statement with parameters. mainFields is an array of field values
        const query = format(firstQueryPart + middleQueryPart + lastQueryPart, tableName, ...fields, timestamp, entryId);
        const fieldChange = await pool.query(query); 
        return fieldChange;
    }
    catch (error) {
        console.error('Error with updating fields: ', error);
    }
}

//Updates entry with new field values
const updateEntryFields = async (request, result) => {
    //Get database name and entry name from params
    const { databaseName, entryId} = request.params;
    //Get lists for regular entry fields, extra fields, associated values and newName
    const { mainFieldNames, mainFields} = request.body;
    try {
        //Makes change if any value was changed
        if (mainFieldNames.length > 0) {
            //Get time now
            const timenow = await pool.query('SELECT NOW()::timestamp(3)');
            const timestamp = timenow.rows[0].now;
            //Copy old entry into copies table
            const databaseCopiesName = databaseName + '_copies';
            const insertPart = 'INSERT INTO %I (';
            const columnNames = 'entry_id, name,  username, phone_number, email, password, extras, date_updated';
            const endPart = ' FROM %I WHERE entry_id = %L'
            const copyQuery = format(insertPart + columnNames + ') SELECT ' + columnNames + endPart, databaseCopiesName, databaseName, entryId);
            const copiesList = await pool.query(copyQuery);
            //Update entry in entry table
            const entryList = await updateFields(databaseName, entryId, mainFieldNames, mainFields, timestamp);
            const fullentry = {
                mainfields: entryList.rows[0],
                copies: copiesList.rows
            } 
            result.json(fullentry);
        }
        else {
            result.json({message: 'No entry fields changed'});
        }
        
    }
    catch (error) {
        console.error('Error with updating entry fields: ', error);
        result.status(500).json({message: 'Error with updating entry fields'});
    }
};

//Gets copies
const getEntryCopies = async (request, result) => {
    const { databaseName, entryId } = request.params;
    const copies = databaseName + '_copies'
    try {
        const entryquery = format('SELECT name, date_updated FROM %I WHERE name = %L', copies, entryId);
        const entryList = await pool.query(entryquery);
        result.json(entryList.rows);
    }
    catch (error) {
        console.error('Error with getting entry copies: ', error);
        result.status(500).json({message: 'Error with getting entry copies'});
    }
};

//Get copies fields
const getEntryCopy = async (request, result) => {
    const { databaseName, entryId, dateUpdated } = request.params;
    try {
        const copies = databaseName + '_copies'
        const entryquery = format('SELECT * FROM %I WHERE entry_id = %L AND date_updated = %L', copies, entryId, dateUpdated);
        const entryList = await pool.query(entryquery);
        result.json(entryList.rows[0]);
    }
    catch (error) {
        console.error('Error with getting entry copy: ', error);
        result.status(500).json({message: 'Error with getting entry copy'});
    }
};

//Reverts entry back to an existing copy
const revertEntry = async (request, result) => {
    const { databaseName, entryId, dateUpdated } = request.params;
    try {
        //Get time now
        const timenow = await pool.query('SELECT NOW()::timestamp(3)');
        const timestamp = timenow.rows[0].now;
        //Copy old entry into copies table
        const databaseCopiesName = databaseName + '_copies';
        const insertPart = 'INSERT INTO %I (';
        const columnNames = 'entry_id, name,  username, phone_number, email, password, extras, date_updated';
        const endPart = ' FROM %I WHERE entry_id = %L'
        const copyQuery = format(insertPart + columnNames + ') SELECT ' + columnNames + endPart, databaseCopiesName, databaseName, entryId);
        const copiesList = await pool.query(copyQuery);
        //Change current entry to selected version
        const updatePart = 'UPDATE %I ';
        const setPart = "SET name = copies.name, username = copies.username, phone_number = copies.phone_number, email = copies.email, password = copies.password, extras = copies.extras ";
        const fromPart = "FROM %I AS copies ";
        const wherePart = "WHERE %I.entry_id = %L AND copies.entry_id = %L AND copies.date_Updated = %L RETURNING *";
        const updateQuery = format(updatePart + setPart + fromPart + wherePart, databaseName, databaseCopiesName, databaseName, entryId, entryId, dateUpdated);
        const updatedEntry = await pool.query(updateQuery);
        result.json(updatedEntry.rows[0]);
    }
    catch (error) {
        console.error('Error with updating entry copy: ', error);
        result.status(500).json({message: 'Error with updating entry copy'});
    }
}

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
    updateEntryFields,
    getEntryCopies,
    getEntryCopy,
    revertEntry,
}
    
