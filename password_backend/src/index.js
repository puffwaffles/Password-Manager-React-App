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


app.listen(8000, () => {
    console.log('App running on port 8000');
});