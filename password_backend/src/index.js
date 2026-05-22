import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg'
import * as dbqueries from './query.js'

const app = express();

app.use(cors());
app.use(bodyParser.json());

//Displays all created password databases - Read
app.get("/databases", dbqueries.getDatabases);

//Checks for database by name
app.get("/databases/:databasename", dbqueries.checkDatabase);

//Creates a new database
app.post("/databases/:database", dbqueries.createDatabase);

//Checks password by database name
app.get("/databases/login/:databasename", dbqueries.getDatabasePassword);

//Deletes a database
app.delete("/databases/delete/:databasename", dbqueries.deleteDatabase);

//Sets name for a given database
app.patch("/databases/setname/:databasename", dbqueries.updateDatabaseName);

//Sets password for a given database
app.patch("/databases/setpassword/:databasename", dbqueries.updateDatabasePassword);

//Displays all entries for a given database
app.get("/databases/entries/:databasename", dbqueries.getEntries);

//Checks database for a given entry
app.get("databases/checkentries/:databasename/:entryname", dbqueries.checkEntry);

//Creates a new entry for a given database
app.post("/entries/create/:databasename", dbqueries.createEntry);

//Deletes a database entry
app.delete("/entries/delete/:databasename/:entryname", dbqueries.deleteEntry);

app.listen(8000, () => {
    console.log('App running on port 8000');
});