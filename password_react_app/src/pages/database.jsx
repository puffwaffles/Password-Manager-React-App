import React, {useEffect, useState} from 'react';
import {useNavigate, Link, useLocation} from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './pages.css'
import { FaLock } from 'react-icons/fa';
import Databasesidebar from '../navbars/databasesidebar.jsx';
import Databaseplusbar from '../navbars/databaseplusbar.jsx';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Database = () => {
    const [databaseName, setdatabaseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [entries, setEntries] = useState([]);
    const [activebar, setActiveBar] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const sessiondetails = async () => {
        const sessionlogin = await axios.get(`${api_url}/getloginsession`);
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        console.log("front end login: ", sessionlogin.data.login);
        console.log("front end databaseName: ", sessiondatabase.data.databaseName);
        const sesslogin = sessionlogin.data.login;
        const sessdatabaseName = sessiondatabase.data.databaseName;
        setLoggedin(sesslogin);
        setdatabaseName(sessdatabaseName);
        setLoading(false);
        await retrieveEntries(sessdatabaseName);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondetails();
    }, [location]);

    //Calls function in index.js to retrieve all created database entries
    const retrieveEntries = async (databaseName) => {
        const result = await axios.get(`${api_url}/databases/entries/${ databaseName }`); 
        console.log("entries: ", result.data);
        setEntries(result.data);
    }; 
    
    //Locks the database
    const lockDatabase = async () => {
        //Deletes session for database
        const locked = await axios.get(`${api_url}/deleteloginsession`);
        navigate('/');
    };

    //Sets entry name for entry to and navigates to entry
    const goToEntry = async (entryName) => {
        //Set login
        const login = await axios.get(`${api_url}/setsessionentry/${entryName}`);
        navigate('/database/entry');
    };

    if (loading) {
        return(<h1>Loading page</h1>);
    }
    if (!loggedin) {
        return(<Error404 />);
    }
    else {
        return (
            <div className = 'barbox'>
                <div className = 'topbar'>
                    <button type = 'button' className = 'logo' onClick = { lockDatabase }>{ <FaLock /> }</button>
                    <Databasesidebar barDatabaseName = {databaseName}/>
                </div>
                <div className = 'barboxcontent'>
                    <div className = 'screentitle'>
                        <h2>Password Database { databaseName }</h2>
                    </div>
                    <ul className = 'leftlist'>
                        {entries.map(entry => <li className = 'listlinks' key = {entry.name} onClick = {() => goToEntry(entry.name)}>{entry.name}</li>)}
                    </ul>
                </div>
                <div className = 'botbar'>
                    <Databaseplusbar  barDatabaseName = {databaseName}/>
                </div>
            </div>
        );
    }
};

export default Database;