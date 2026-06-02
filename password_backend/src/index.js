import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import * as dbqueries from './query.js';
import session from 'express-session';
import connectpgSession from 'connect-pg-simple';

const app = express();
const pgSession = connectpgSession(session);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(bodyParser.json());
app.use(
    session({
        store: new pgSession({
            pool: dbqueries.pool,
            tableName: 'session'
        }),
        secret: process.env.sessionsecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        }
    })
);

//Set session login and database when user logs in
app.get("/setloginsession/:databaseName", (request, result) => {
    const { databaseName } = request.params;
    request.session.databaseName = databaseName;
    request.session.login = true;
    result.send('Session login and database name set');
    console.log(request.session);
});

//Retrieve session login to check if login has been made
app.get("/getloginsession", (request, result) => {
    const login = request.session.login;
    result.set('Cache-Control', 'no-store');
    result.json({login: login});
});

//Retrieve session database name
app.get("/getsessiondatabase", (request, result) => {
    const databaseName = request.session.databaseName;
    console.log("backend databaseName: ", databaseName);
    result.set('Cache-Control', 'no-store');
    result.json({databaseName: databaseName});
});

//Retrieve session entry name
app.get("/getsessionentry", (request, result) => {
    const entryName = request.session.entryName;
    console.log('backend entryName in getentryName: ', entryName);
    result.set('Cache-Control', 'no-store');
    result.json({entryName: entryName});
});

//Set session database name
app.get("/setsessiondatabase/:databaseName", (request, result) => {
    const { databaseName } = request.params;
    request.session.databaseName = databaseName;
    result.send('Session database name set');
});

//Set session database entry
app.get("/setsessionentry/:entryName", (request, result) => {
    const { entryName } = request.params;
    request.session.entryName = entryName;
    console.log('backend entryName: ', entryName);
    result.send('Session entry name set');
});

//Unset entry name
app.get("/deletesessionentry", (request, result) => {
    request.session.entryName = null;
    console.log('backend entryName after setting to null: ', request.session.entryName);
    result.send('Session entry name set to null');
});

//Destroy login session
app.get("/deleteloginsession", (request, result) => {
    request.session.destroy((error) => {
        if (error) {
            console.log('Error with deleting session: ', error);
            result.status(500).send('Error with deleting session');
        }
        else {
            result.send("Session destroyed");
        }
    });
});

//Displays all created password databases - Read
app.get("/databases", dbqueries.getDatabases);

//Checks for database by name
app.get("/databases/:databaseName", dbqueries.checkDatabase);

//Creates a new database
app.post("/databases/:database", dbqueries.createDatabase);

//Checks password by database name
app.get("/databases/password/login/:databaseName/:password", dbqueries.checkDatabasePassword);

//gets password by database name
app.get("/databases/login/:databaseName", dbqueries.getDatabasePassword);

//Deletes a database
app.delete("/databases/delete/:databaseName", dbqueries.deleteDatabase);

//Sets name for a given database
app.patch("/databases/setname/:databaseName", dbqueries.updatedatabaseName);

//Sets password for a given database
app.patch("/databases/setpassword/:databaseName", dbqueries.updateDatabasePassword);

//Displays all entries for a given database
app.get("/databases/entries/:databaseName", dbqueries.getEntries);

//Checks database for a given entry
app.get("/databases/checkentries/:databaseName/:entryName", dbqueries.checkEntry);

//Creates a new entry for a given database
app.post("/entries/create/:databaseName", dbqueries.createEntry);

//Deletes a database entry
app.delete("/entries/delete/:databaseName/:entryName", dbqueries.deleteEntry);

//Gets all fields for a given entry
app.get("/databases/entries/fields/:databaseName/:entryName", dbqueries.getEntryFields);

app.listen(8000, () => {
    console.log('App running on port 8000');
});