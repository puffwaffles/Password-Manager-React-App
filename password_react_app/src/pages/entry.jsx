import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './pages.css';
import { mappings } from './columnmap.js';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Entry = () => {
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [databasename, setDatabasename] = useState('');
    const [entryname, setEntryname] = useState('');
    const [entryfields, setEntryFields] = useState([]);
    const [extrafields, setExtraFields] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const sessiondetails = async () => {
        const sessionlogin = await axios.get(`${api_url}/getloginsession`);
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        const sessionentry = await axios.get(`${api_url}/getsessionentry`);
        console.log("front end login: ", sessionlogin.data.login);
        console.log("front end databasename: ", sessiondatabase.data.databasename);
        console.log("front end entryname: ", sessionentry.data.entryname);
        const sesslogin = sessionlogin.data.login;
        const sessdatabasename = sessiondatabase.data.databasename;
        const sessentry = sessionentry.data.entryname;
        setLoggedin(sesslogin);
        setDatabasename(sessdatabasename);
        setEntryname(sessentry);
        setLoading(false);
        await retrieveEntryFields(sessdatabasename, sessentry);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondetails();
    }, [location]);

    //Calls function in index.js to retrieve all created entry fields
    const retrieveEntryFields = async (databasename, entryname) => {
        const result = await axios.get(`${api_url}/databases/entries/fields/${ databasename }/${ entryname }`); 
        setEntryFields(result.data.mainfields);
        setExtraFields(result.data.extrafields);
    };   

    //Leaves entry page
    const goBack = async () => {
        const locked = await axios.get(`${api_url}/deletesessionentry`);
        navigate('/database');
    };

    //Convert datetime to local time
    const timeFormat = (key, value) => {
        if (key === 'date_created' || key === 'date_updated') {
            console.log('Date changed to local');
            return new Date(value).toLocaleString();
        }
        return value;
    };

    if (loading) {
        return(<h1>Loading page</h1>);
    }
    if (!entryname || !loggedin) {
        return(<Error404 />);
    }
    else {
        return (
            <div className = 'barbox'>
                <div className = 'topbar'>
                    <button className = 'logo' onClick = { goBack }><IoIosArrowRoundBack /></button>
                </div>
                <div className = 'barboxcontent'>
                    <h2>{entryname}</h2>
                    <ul className = 'leftlist'>
                        {Object.entries(entryfields).map(([key, value]) => (
                            value != null && <li key = { key }>{ mappings[key] }: { timeFormat(key, value) }</li>
                        ))}
                    </ul>
                    {extrafields.length > 0 && (
                            <ul className = 'leftlist'>
                                Extra Fields
                                {extrafields.map((field) => (
                                    <li key = { field.field_name }>{ field.field_name }: { field.field_value }</li>
                                ))}
                            </ul>
                        )
                    }
                </div>
                <div className = 'botbar'></div>
            </div>
        );
    }
};

export default Entry;