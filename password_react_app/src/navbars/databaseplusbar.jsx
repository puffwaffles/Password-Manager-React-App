import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './navbars.css';
import Errorprop from "../pages/error.jsx";
import { CiCirclePlus } from "react-icons/ci";

const api_url = 'http://localhost:8000';

const Bar = ({togglePlusbar, hidePlusBar, newEntry, setNewEntry, handleEntrySubmit, setShowErrorMessage, showErrorMessage, errorMessage}) => {
    return (
        <div className = 'fullplusbar'>
            {(hidePlusBar) && (
                <button className = 'logo' onClick = { togglePlusbar }>{ <CiCirclePlus /> }</button>
            )}
            {(!hidePlusBar) && (
                <div className = 'plusbar'>
                    <button className = 'sidebarclosebtn' onClick = { togglePlusbar }>X</button>
                    <div className = 'entryName'>
                        Enter entry name
                        <form onSubmit = { handleEntrySubmit }>
                            <div className = 'formitem'>
                                <div className = "labelblock"><label  style = {{ color: 'white' }}> Entry Name </label></div>
                                <input 
                                    type = 'text'
                                    value = { newEntry } 
                                    onChange = {
                                        event => {
                                            setNewEntry(event.target.value);
                                            //Set error message off
                                            setShowErrorMessage(false);
                                        }
                                    }
                                />
                            </div>
                            <input type = 'submit' />
                            <Errorprop showerror = { showErrorMessage } errorMessage = { errorMessage }/>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Databaseplusbar = ({barDatabaseName}) => {
    const databaseName = barDatabaseName;
    const [newEntry, setNewEntry] = useState('');
    const [hidePlusBar, setHidePlusbar] = useState(true);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    //Toggles plusbar 
    function togglePlusbar(event) {
        event.preventDefault();
        setHidePlusbar(!hidePlusBar);
    }

    //Handles submission of new password
    async function handleEntrySubmit(event) {
        console.log('databaseName:', databaseName);
        event.preventDefault();
        const entryName = newEntry;
        //Checks if database name is already used
        const entryExists = await axios.get(`${api_url}/databases/checkentries/${databaseName}/${entryName}`);
        
        //User enters a blank name for entry
        if (entryName === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database entry must have a name');
        }
        //User enters an acceptable entry name
        else if (!entryExists.data.exists) {
            const createdentry = await axios.post(`${api_url}/entries/create/${databaseName}`, { entryName });
            setNewEntry('');
            setHidePlusbar(true);
            //Refreshes page to show new entry made
            navigate('/database');
        }
        //If entry name is already used by another entry
        else if (entryExists.data.exists) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database entry name ${entryName} has been taken`);
        }
    }

    return (
        <Bar 
            togglePlusbar = { togglePlusbar } 
            hidePlusBar = { hidePlusBar }
            newEntry = { newEntry }
            setNewEntry = { setNewEntry }
            handleEntrySubmit = { handleEntrySubmit }
            setShowErrorMessage = { setShowErrorMessage } 
            showErrorMessage = { showErrorMessage }
            errorMessage = {errorMessage}
        />
    );
};

export default Databaseplusbar;