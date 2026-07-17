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
import Entrysidebar from '../navbars/entrysidebar.jsx';
import Errorprop from "../pages/error.jsx";
import Error404 from './error404.jsx';
import { FaSave } from "react-icons/fa";
import TextareaAutosize from '@mui/material/TextareaAutosize';
const api_url = 'http://localhost:8000';

const Editentry = () => {
    const [loading, setLoading] = useState(true);
    const [loggedin, setLoggedin] = useState(false);
    const [databaseName, setDatabaseName] = useState('');
    const [entryId, setEntryId] = useState('');
    const [entryName, setEntryName] = useState('');
    const [entryFields, setEntryFields] = useState([]);
    const [updatedFields, setUpdatedFields] = useState({});
    const [hidePassword, setHidePassword] = useState(true);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

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
        setEntryName(result.data.mainfields.name);
    };   

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Leaves entry page
    const goBack = async () => {
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
        return value;
    };

    //Returns true for changeable values
    function mutable (key) {
        return key !== 'entry_id' && key !== 'date_created' && key !== 'date_updated';
    };

    //Updates changed fields
    function updateChanges(key, value) {
        setUpdatedFields(updatedFields => ({ ...updatedFields, [key]: value }));
    }

    //Chooses which input based on key
    function inputType(key, value) {
        if (value === null) {
            value = ''
        }
        switch(key) {
            case 'name': return (
                <div>
                    <input
                        onChange = {
                            event => {
                                updateChanges(key, event.target.value)
                                setShowErrorMessage(false);
                            } 
                        }
                        maxLength = "50"
                        defaultValue = {value}
                    ></input>
                    <Errorprop showerror = { showErrorMessage } errorMessage = { errorMessage }/>
                </div>
            );    
            case 'password': return (
                <input
                    onChange = {event => updateChanges(key, event.target.value )}
                    maxLength = "50"
                    defaultValue = {value}
                    input type = {hidePassword ? 'password' : 'text'}
                ></input>);
            case 'phone_number': return (
                <input
                    pattern = "[0-9]{3}[0-9]{3}[0-9]{4}" 
                    maxLength = "10"
                    onChange = {event => {
                        const numericOnly = event.target.value.replace(/[^0-9]/g, '');
                        event.target.value = numericOnly;
                        updateChanges(key, event.target.value )
                    }}
                    defaultValue = {value}
                ></input>);
            case 'extras': return (
                <TextareaAutosize
                    minRows = {3}
                    maxLength = {1000}
                    onChange = {event => updateChanges(key, event.target.value )}
                    defaultValue = {value}
                />);
            default: return (
                <input
                    onChange = {event => updateChanges(key, event.target.value )}
                    maxLength = "50"
                    defaultValue = {value}
                ></input>);
        }
    }

    //Checks if changed name is valid
    async function isNameValid () {
        const entryName = updatedFields['name'];
        //Checks if database name is already used
        const entryExists = await axios.get(`${api_url}/databases/checkentries/${databaseName}/${entryName}`);
        
        //User enters a blank name for entry
        if (entryName === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database entry must have a name');
            return false;
        }
        //If entry name is already used by another entry
        else if (entryExists.data.exists) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database entry name ${entryName} has been taken`);
            return false;
        }
        //User enters an acceptable entry name
        else {
            return true;
        }
        
    }

    //Saves entry edits by writing to database
    async function save() {
        //Extract updated field names and field values
        const mainFieldNames = Object.keys(updatedFields);
        const mainFields = Object.values(updatedFields);

        if (isNameValid) {
            //Updates database
            const updateEntry = await axios.patch(`${api_url}/entries/update/${ databaseName }/${ entryId }`, {mainFieldNames: mainFieldNames, mainFields: mainFields});
            //Navigate back to updated entry
            navigate('/database/entry');
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
                    <div>
                        <button className = 'logo' onClick = { save }><FaSave /></button>
                    </div>
                </div>
                <div className = 'barboxcontent'>
                    <h2>{entryName}</h2>
                    <ul className = 'leftlist'>
                        {Object.entries(entryFields).map(([key, value]) => (
                            (mutable(key) ? (
                                (
                                    <div key = { key }>
                                        <li>{ mappings[key] }   
                                        </li>
                                        {inputType(key, value)}
                                    </div>  
                                )
                            ) : (
                                key != 'entry_id' && <div key = { key }>
                                    <li>{ mappings[key] }   
                                    </li>
                                    { textFormat(key, value) }
                                </div>
                            )
                        )))}
                    </ul>
                    
                </div>
                <div className = 'botbar'></div>
            </div>
        );
    }
};

export default Editentry;