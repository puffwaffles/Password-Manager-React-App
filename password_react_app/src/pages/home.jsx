import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import axios from "axios";
const api_url = 'http://localhost:8000';

const Home = () => {
    const [databases, setDatabases] = useState([]);

    useEffect(() => {
        retrieveDatabases();
    }, []);

    const retrieveDatabases = async () => {
        const result = await axios.get(`${api_url}/databases`); 
        setDatabases(result.data);
    };

    return (
        <div>
            <h1>Password App</h1>
            <h3><Link to = '/prompt_database'>Create New Database</Link></h3>
            <h3>Created Databases</h3>
            <ul>
                {databases.map(database => <li key = {database.database_name}>{ database.database_name }</li>)}
            </ul>
        </div>
    );
};

export default Home;