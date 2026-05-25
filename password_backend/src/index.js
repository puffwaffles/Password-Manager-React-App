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
app.get("/setloginsession/:databasename", (request, result) => {
    const { databasename } = request.params;
    request.session.databasename = databasename;
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
    const databasename = request.session.databasename;
    console.log("backend databasename: ", databasename);
    result.set('Cache-Control', 'no-store');
    result.json({databasename: databasename});
});

//Retrieve session entry name
app.get("/getsessionentry", (request, result) => {
    const entryname = request.session.entryname;
    console.log('backend entryname in getentryname: ', entryname);
    result.set('Cache-Control', 'no-store');
    result.json({entryname: entryname});
});

//Set session database name
app.get("/setsessiondatabase/:databasename", (request, result) => {
    const { databasename } = request.params;
    request.session.databasename = databasename;
    result.send('Session database name set');
});

//Set session database entry
app.get("/setsessionentry/:entryname", (request, result) => {
    const { entryname } = request.params;
    request.session.entryname = entryname;
    console.log('backend entryname: ', entryname);
    result.send('Session entry name set');
});

//Unset entry name
app.get("/deletesessionentry", (request, result) => {
    request.session.entryname = null;
    console.log('backend entryname after setting to null: ', request.session.entryname);
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
app.get("/databases/checkentries/:databasename/:entryname", dbqueries.checkEntry);

//Creates a new entry for a given database
app.post("/entries/create/:databasename", dbqueries.createEntry);

//Deletes a database entry
app.delete("/entries/delete/:databasename/:entryname", dbqueries.deleteEntry);

//Gets all fields for a given entry
app.get("/databases/entries/fields/:databasename/:entryname", dbqueries.getEntryFields);

app.listen(8000, () => {
    console.log('App running on port 8000');
});