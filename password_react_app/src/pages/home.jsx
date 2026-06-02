import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
const api_url = 'http://localhost:8000';

const Home = () => {
    const [databases, setDatabases] = useState([]);
    const navigate = useNavigate();

    //Update list of databases
    useEffect(() => {
        retrieveDatabases();
    }, []);

    //Calls function in index.js to retrieve all created databases
    const retrieveDatabases = async () => {
        const result = await axios.get(`${api_url}/databases`); 
        setDatabases(result.data);
    };

    //Sets database name for login to and navigates to database login
    const goToLogin = async (databaseName) => {
        //Set login
        const login = await axios.get(`${api_url}/setsessiondatabase/${databaseName}`);
        navigate('/login');
    };

    return (
        <div>
            <h1>Password App</h1>
            <div className = 'databaselist'>
                <h3><Link to = '/prompt_database'>Create New Database</Link></h3>
                <h3>Created Databases</h3>
                <ul className = 'leftlist'>
                    {databases.map(database => <li className = 'listlinks' key = {database.database_name} onClick = {() => goToLogin(database.database_name)}>{ database.database_name }</li>)}
                </ul>
            </div>
        </div>
    );
};

export default Home;