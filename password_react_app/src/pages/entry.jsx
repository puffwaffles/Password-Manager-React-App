import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useLocation} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './pages.css';
import { mappings } from './columnmap.js';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { IoPencil } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa";
import Entrysidebar from '../navbars/entrysidebar.jsx';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Entry = () => {
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [databaseName, setDatabaseName] = useState('');
    const [entryId, setEntryId] = useState('');
    const [entryName, setEntryName] = useState('');
    const [entryFields, setEntryFields] = useState([]);
    const [prevEntries, setPrevEntries] = useState([]);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [copyMessage, setCopyMessage] = useState('Copy');

    const sessiondetails = async () => {
        const sessionlogin = await axios.get(`${api_url}/getloginsession`);
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        const sessionentry = await axios.get(`${api_url}/getsessionentry`);
        const sesslogin = sessionlogin.data.login;
        const sessdatabaseName = sessiondatabase.data.databaseName;
        const sessentry = sessionentry.data.entryId;
        setLoggedin(sesslogin);
        setDatabaseName(sessdatabaseName);
        setEntryId(sessentry);
        setLoading(false);
        await retrieveEntryFields(sessdatabaseName, sessentry);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondetails();
    }, [location]);

    //Calls function in index.js to retrieve all created entry fields
    const retrieveEntryFields = async (databaseName, entryId) => {
        const result = await axios.get(`${api_url}/databases/entries/fields/${ databaseName }/${ entryId }`); 
        setEntryFields(result.data.mainfields);
        setEntryName(result.data.mainfields.name)
        setPrevEntries(result.data.copies);
    };   

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Leaves entry page
    const goBack = async () => {
        const locked = await axios.get(`${api_url}/deletesessionentry`);
        navigate('/database');
    };

    //Go to edit entry page
    const goEdit = async () => {
        navigate('/database/editentry');
    };

    //Go to previous version of entry page
    const goPrev = async (dateUpdated) => {
        //Sets date updated to identify which version to visit
        const copy = await axios.get(`${api_url}/setsessioncopy/${dateUpdated}`);
        navigate('/database/copy');
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

    //Copies text to clipboard
    async function copy2Clipboard (value) {
        try {
            await navigator.clipboard.writeText(value);
            setCopyMessage('Copied!');
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            await wait(1000);
            setCopyMessage('Copy');
        }
        catch (error) {
            console.log("Failed to copy");
        }
        
    }

    //Allows for copy and paste
    const copyButton = (key, value) => {
        if (key !== 'date_created' && key !== 'date_updated') {
            return (
                <div className = 'tooltip'>
                    <button className = 'copybtn' onClick = { () => copy2Clipboard(value) }>
                        <FaRegCopy />
                    </button>
                    <span className = 'tooltiptextright'>{ copyMessage }</span>
                </div>
            );
        }
        else {
            return (<></>);
        }
    } 

    if (loading) {
        return(<h1>Loading page</h1>);
    }
    if (!entryName || !loggedin) {
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
                    <button className = 'logo' onClick = { goEdit }><IoPencil /></button>
                    <div>
                        <Entrysidebar barDatabaseName = {databaseName} barEntryId = {entryId}/>
                    </div>
                    
                </div>
                <div className = 'barboxcontent'>
                    <h2>{entryName}</h2>
                    <ul className = 'leftlist'>
                        {Object.entries(entryFields).map(([key, value]) => (
                            key != 'entry_id' && key != 'name' && value != null && <li key = { key }>{ mappings[key] }: { textFormat(key, value) } { copyButton(key, value) }</li>
                        ))}
                    </ul>
                    {prevEntries.length > 0 && (
                            <ul className = 'leftlist'>
                                Previous Versions
                                {prevEntries.map((field) => (
                                    <li className = 'listlinks' key = { field.date_updated }  onClick = {() => goPrev(encodeURIComponent(field.date_updated))}>{ textFormat('date_updated', field.date_updated) }</li>
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