import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { FaLock } from "react-icons/fa";
import Databasesidebar from "../navbars/databasesidebar.jsx"
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
    };   
    

    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button type = 'button' className = 'logo' onClick = {() => navigate('/')}>{ <FaLock /> }</button>
                <Databasesidebar />
            </div>
            <div className = 'barboxcontent'>
                <h1>Password Database { databasename }</h1>
            </div>
            <div className = 'botbar'>
                <Databaseplusbar />
            </div>
        </div>
    );
};

export default Database;