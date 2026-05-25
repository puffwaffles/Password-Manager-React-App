import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './navbars.css';
import Error from "../pages/error.jsx";
import { CiCirclePlus } from "react-icons/ci";

const api_url = 'http://localhost:8000';

const Bar = ({togglePlusbar, hideplusbar, newentry, setNewEntry, handleEntrySubmit, setShowErrorMessage, showerroressage, errormessage}) => {
    return (
        <div className = 'fullplusbar'>
            {(hideplusbar) && (
                <button className = 'logo' onClick = { togglePlusbar }>{ <CiCirclePlus /> }</button>
            )}
            {(!hideplusbar) && (
                <div className = 'plusbar'>
                    <button className = 'sidebarclosebtn' onClick = { togglePlusbar }>X</button>
                    <div className = 'entryname'>
                        Enter entry name
                        <form onSubmit = { handleEntrySubmit }>
                            <div className = 'formitem'>
                                <div className = "labelblock"><label  style = {{ color: 'white' }}> Entry Name </label></div>
                                <input 
                                    type = 'text'
                                    value = { newentry } 
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
                            <Error showerror = { showerroressage } errormessage = { errormessage }/>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Databaseplusbar = ({bardatabasename}) => {
    const databasename = bardatabasename;
    const [newentry, setNewEntry] = useState('');
    const [hideplusbar, setHidePlusbar] = useState(true);
    const [showerroressage, setShowErrorMessage] = useState(false);
    const [errormessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    //Toggles plusbar 
    function togglePlusbar(event) {
        event.preventDefault();
        setHidePlusbar(!hideplusbar);
    }

    //Handles submission of new password
    async function handleEntrySubmit(event) {
        console.log('databasename:', databasename);
        event.preventDefault();
        const entryname = newentry;
        //Checks if database name is already used
        const entryexists = await axios.get(`${api_url}/databases/checkentries/${databasename}/${entryname}`);
        
        //User enters a blank name for entry
        if (entryname === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database entry must have a name');
        }
        //User enters an acceptable entry name
        else if (!entryexists.data.exists) {
            const createdentry = await axios.post(`${api_url}/entries/create/${databasename}`, { entryname });
            setNewEntry('');
            setHidePlusbar(true);
        }
        //If entry name is already used by another entry
        else if (entryexists.data.exists) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database entry name ${entryname} has been taken`);
        }
    }

    return (
        <Bar 
            togglePlusbar = { togglePlusbar } 
            hideplusbar = { hideplusbar }
            newentry = { newentry }
            setNewEntry = { setNewEntry }
            handleEntrySubmit = { handleEntrySubmit }
            setShowErrorMessage = { setShowErrorMessage } 
            showerroressage = { showerroressage }
            errormessage = {errormessage}
        />
    );
};

export default Databaseplusbar;