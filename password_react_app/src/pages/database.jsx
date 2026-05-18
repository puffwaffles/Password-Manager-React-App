import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { FaLock } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import Databasesidebar from "../navbars/databasesidebar.jsx"
const api_url = 'http://localhost:8000';

const Database = () => {
    const { databasename } = useParams();
    const [entries, setEntries] = useState([]);
    const navigate = useNavigate();

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
                <button className = 'logo'>{ <CiCirclePlus /> }</button>
            </div>
        </div>
    );
};

export default Database;