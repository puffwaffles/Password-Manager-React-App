import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './navbars.css';
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaRegTrashCan } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

const Bar = ({toggleEntrybar, hideEntrybar, deleteEntry}) => {
    if (hideEntrybar) {
        return (
            <button className = 'logo' onClick = { toggleEntrybar }>{ <FaRegTrashCan /> }</button>
        );
    }
    else {
        return (
            <div  className = 'sidebar'>    
                <button className = 'sidebarclosebtn' onClick = { toggleEntrybar }>x</button>
                <div className = 'sidebars'>Are you sure you want to delete this entry?</div>
                <div className = 'yesnosidebar'>
                    <button onClick = { deleteEntry }>Yes</button>
                    <button onClick = { toggleEntrybar }>No</button>
                </div>
            </div>
        );
    };    
};

const Entrysidebar = ({barDatabaseName, barEntryId}) => {
    const databaseName = barDatabaseName;
    const entryId = barEntryId;
    const [hideEntrybar, setHideEntrybar] = useState(true);
    const navigate = useNavigate();

    //Toggles sidebar 
    function toggleEntrybar(event) {
        event.preventDefault();
        setHideEntrybar(!hideEntrybar);
    }

    //Deletes Entry
    async function deleteEntry(event) {
        event.preventDefault();

        //Deletes all instances of entry
        const deletedEntry = await axios.delete(`${api_url}/entries/delete/${databaseName}/${entryId}`);

        //Leave entry page
        const locked = await axios.get(`${api_url}/deletesessionentry`);
        navigate('/database');
    };

    return (
        <Bar 
            toggleEntrybar = { toggleEntrybar } 
            hideEntrybar = { hideEntrybar } 
            deleteEntry = { deleteEntry }
        />
    );
};

export default Entrysidebar;