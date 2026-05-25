import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, Link, useLocation} from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './pages.css'
import { FaLock } from 'react-icons/fa';
import Databasesidebar from '../navbars/databasesidebar.jsx';
import Databaseplusbar from '../navbars/databaseplusbar.jsx';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Database = () => {
    const [databasename, setDatabasename] = useState('');
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
        console.log("front end databasename: ", sessiondatabase.data.databasename);
        const sesslogin = sessionlogin.data.login;
        const sessdatabasename = sessiondatabase.data.databasename;
        setLoggedin(sesslogin);
        setDatabasename(sessdatabasename);
        setLoading(false);
        await retrieveEntries(sessdatabasename);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondetails();
    }, [location]);

    //Calls function in index.js to retrieve all created database entries
    const retrieveEntries = async (databasename) => {
        const result = await axios.get(`${api_url}/databases/entries/${ databasename }`); 
        console.log("entries: ", result.data);
        setEntries(result.data);
    }; 
    
    //Locks the database
    const lockDatabase = async () => {
        const locked = await axios.get(`${api_url}/deleteloginsession`);
        navigate('/');
    };

    //Sets entry name for entry to and navigates to entry
    const goToEntry = async (entryname) => {
        //Set login
        const login = await axios.get(`${api_url}/setsessionentry/${entryname}`);
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
                    <Databasesidebar bardatabasename = {databasename}/>
                </div>
                <div className = 'barboxcontent'>
                    <div className = 'screentitle'>
                        <h2>Password Database { databasename }</h2>
                    </div>
                    <ul className = 'leftlist'>
                        {entries.map(entry => <li className = 'listlinks' key = {entry.name} onClick = {() => goToEntry(entry.name)}>{entry.name}</li>)}
                    </ul>
                </div>
                <div className = 'botbar'>
                    <Databaseplusbar  bardatabasename = {databasename}/>
                </div>
            </div>
        );
    }
};

export default Database;