import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { FaLock } from "react-icons/fa";
import { CiCirclePlus } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
const api_url = 'http://localhost:8000';

const Database = () => {
    const { database_username } = useParams();
    const [entries, setEntries] = useState([]);
    const navigate = useNavigate();

    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button type = 'button' className = 'logo' onClick = {() => navigate('/')}>{ <FaLock /> }</button>
                <button type = 'button' className = 'logo'>{ <BsThreeDotsVertical /> }</button>
            </div>
            <div className = 'barboxcontent'>
                <h1>{ database_username } Password Database</h1>
            </div>
            <div className = 'botbar'>
                <button className = 'logo'>{ <CiCirclePlus /> }</button>
            </div>
        </div>
    );
};

export default Database;