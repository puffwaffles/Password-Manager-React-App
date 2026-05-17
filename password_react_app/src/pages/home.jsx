import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from "axios";
const api_url = 'http://localhost:8000';

const Home = () => {
    const [databases, setDatabases] = useState([]);

    //Update list of databases
    useEffect(() => {
        retrieveDatabases();
    }, []);

    //Calls function in index.js to retrieve all created databases
    const retrieveDatabases = async () => {
        const result = await axios.get(`${api_url}/databases`); 
        setDatabases(result.data);
    };

    return (
        <div>
            <h1>Password App</h1>
            <div className = 'databaselist'>
                <h3><Link to = '/prompt_database'>Create New Database</Link></h3>
                <h3>Created Databases</h3>
                <ul className = 'leftlist'>
                    {databases.map(database => <li key = {database.database_name}><Link to = {`/login/${ database.database_name }`}>{ database.database_name }</Link></li>)}
                </ul>
            </div>
        </div>
    );
};

export default Home;