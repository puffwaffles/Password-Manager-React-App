import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { BsThreeDotsVertical } from "react-icons/fa6";
const api_url = 'http://localhost:8000';

const Entry = () => {
    const { database_username } = useParams();
    const [newentry, setEntry] = useState({ name: '', username: '', email: '', password: '', datecreated: '', dateupdated: '' });
    const [newfield, setField] = useState({ name: '', fieldname: '', fieldvalue: '', private: true});


    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button className = 'closebtn' onClick = {() => navigate('/')}>Go Back</button>
                <button className = 'closebtn'></button>
            </div>
            <div className = 'barboxcontent'>
                <h1>{} Password Database</h1>
            </div>
            <div className = 'botbar'></div>
        </div>
    );
};

export default Entry;