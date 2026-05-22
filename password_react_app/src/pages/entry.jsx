import React, {useEffect, useState} from 'react';
import {useNavigate, useEffect, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { BsThreeDotsVertical } from "react-icons/fa6";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
const api_url = 'http://localhost:8000';

const Entry = () => {
    const { databaseusername } = useParams();
    const { entryname } = useParams();
    const [entryItems, setEntryItem] = useState([]);
    const navigate = useNavigate();

    //Update list of database entries
    useEffect(() => {
        retrieveEntryFields();
    }, []);

    //Calls function in index.js to retrieve all created entry fields
    const retrieveEntries = async () => {
        
    };   

    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button className = 'closebtn' onClick = {() => navigate(`/database/${databasename}`)}><IoIosArrowRoundBack /></button>
            </div>
            <div className = 'barboxcontent'>
                <h1>{entryname}</h1>
            </div>
            <div className = 'botbar'></div>
        </div>
    );
};

export default Entry;