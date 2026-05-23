import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, Link} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { FaLock } from "react-icons/fa";
import Databasesidebar from "../navbars/databasesidebar.jsx";
import Databaseplusbar from "../navbars/databaseplusbar.jsx";
const api_url = 'http://localhost:8000';

const Database = () => {
    const { databasename } = useParams();
    const [entries, setEntries] = useState([]);
    const [activebar, setActiveBar] = useState('');
    const navigate = useNavigate();

    //Update list of database entries
    useEffect(() => {
        retrieveEntries();
    }, []);

    //Calls function in index.js to retrieve all created database entries
    const retrieveEntries = async () => {
        const result = await axios.get(`${api_url}/databases/entries/${ databasename }`); 
        setEntries(result.data);
    };   
    
    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button type = 'button' className = 'logo' onClick = {() => navigate('/')}>{ <FaLock /> }</button>
                <Databasesidebar />
            </div>
            <div className = 'barboxcontent'>
                <div className = 'screentitle'>
                    <h2>Password Database { databasename }</h2>
                </div>
                <ul className = 'leftlist'>
                    {entries.map(entry => <li key = {entry.name} ><Link to = {`/database/${ databasename }/entry/${ entry.name }`}>{entry.name}</Link></li>)}
                </ul>
            </div>
            <div className = 'botbar'>
                <Databaseplusbar />
            </div>
        </div>
    );
};

export default Database;