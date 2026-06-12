import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './pages.css';
import { mappings } from './columnmap.js';
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Copysidebar from '../navbars/copysidebar.jsx';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Copy = () => {
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [databaseName, setDatabaseName] = useState('');
    const [entryId, setEntryId] = useState('');
    const [dateUpdated, setDateUpdated] = useState('');
    const [entryName, setEntryName] = useState('');
    const [entryFields, setEntryFields] = useState([]);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const sessiondetails = async () => {
        const sessionlogin = await axios.get(`${api_url}/getloginsession`);
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        const sessionentry = await axios.get(`${api_url}/getsessionentry`);
        const sessioncopy = await axios.get(`${api_url}/getsessioncopy`);

        const sesslogin = sessionlogin.data.login;
        const sessdatabaseName = sessiondatabase.data.databaseName;
        const sessentry = sessionentry.data.entryId;
        const sesscopy = sessioncopy.data.dateUpdated;
        setLoggedin(sesslogin);
        setDatabaseName(sessdatabaseName);
        setEntryId(sessentry);
        setDateUpdated(sesscopy);
        setLoading(false);
        await retrieveEntryFields(sessdatabaseName, sessentry, sesscopy);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondetails();
    }, [location]);

    //Calls function in index.js to retrieve all created entry fields
    const retrieveEntryFields = async (databaseName, entryId, dateUpdated) => {
        const result = await axios.get(`${api_url}/entries/copies/fields/${ databaseName }/${ entryId }/${ dateUpdated }`); 
        setEntryFields(result.data);
        setEntryName(result.data.name);
    };   

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Leaves copy page
    const goBack = async () => {
        const locked = await axios.get(`${api_url}/deletesessioncopy`);
        navigate('/database/entry');
    };

    //Convert datetime to local time
    const timeFormat = (value) => {
        return new Date(value).toLocaleString();
        return value;
    };

    //Special formating
    const textFormat = (key, value) => {
        if (key === 'date_created' || key === 'date_updated') {
            return timeFormat(value);
        }
        else if (key === 'password' && hidePassword && value !== null) {
            return '*'.repeat(value.length);
        }
        else if (key === 'phone_number') {
            var phonenumber = '(';
            var i;
            for (i = 0; i < 3; i++) {
                phonenumber += value[i];
            }
            phonenumber += ')-';
            for (i = 3; i < 6; i++) {
                phonenumber += value[i];
            }
            phonenumber += '-';
            for (i = 6; i < 10; i++) {
                phonenumber += value[i];
            }
            return phonenumber;
        }
        return value;
    }

    if (loading) {
        return(<h1>Loading page</h1>);
    }
    if (!entryId || !loggedin) {
        return(<Error404 />);
    }
    else {
        return (
            <div className = 'barbox'>
                <div className = 'topbar'>
                    <button className = 'logo' onClick = { goBack }><IoIosArrowRoundBack /></button>
                    <button className = 'logo' onClick = { toggleEye }>
                        { hidePassword ? <FaRegEyeSlash /> : <FaRegEye /> }
                    </button>
                    <div>
                        <Copysidebar barDatabaseName = {databaseName} barEntryId = {entryId} barDateUpdated = {dateUpdated}/>
                    </div>
                    
                </div>
                <div className = 'barboxcontent'>
                    <h2>{entryName}</h2>
                    <ul className = 'leftlist'>
                        {Object.entries(entryFields).map(([key, value]) => (
                            key != 'entry_id' && key != 'name' && value != null && <li key = { key }>{ mappings[key] }: { textFormat(key, value) }</li>
                        ))}
                    </ul>
                </div>
                <div className = 'botbar'></div>
            </div>
        );
    }
};

export default Copy;