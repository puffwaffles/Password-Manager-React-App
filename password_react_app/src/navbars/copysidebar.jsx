import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import './navbars.css';
import { LuArrowRightLeft } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

const Bar = ({toggleCopybar, hideCopybar, revertEntry}) => {
    if (hideCopybar) {
        return (
            <button className = 'logo' onClick = { toggleCopybar }>{ <LuArrowRightLeft /> }</button>
        );
    }
    else {
        return (
            <div  className = 'sidebar'>    
                <button className = 'sidebarclosebtn' onClick = { toggleCopybar }>x</button>
                <div className = 'sidebars'>Are you sure you want to revert this version?</div>
                <div className = 'yesnosidebar'>
                    <button onClick = { revertEntry }>Yes</button>
                    <button onClick = { toggleCopybar }>No</button>
                </div>
            </div>
        );
    };    
};

const Copysidebar = ({barDatabaseName, barEntryId, barDateUpdated}) => {
    const databaseName = barDatabaseName;
    const entryId = barEntryId;
    const dateUpdated = barDateUpdated;
    const [hideCopybar, setHideCopybar] = useState(true);
    const navigate = useNavigate();

    //Toggles sidebar 
    function toggleCopybar(event) {
        event.preventDefault();
        setHideCopybar(!hideCopybar);
    }

    //Deletes Entry
    async function revertEntry(event) {
        event.preventDefault();

        //Deletes all instances of entry
        const revert = await axios.patch(`${api_url}/entries/copies/revert/${ databaseName }/${ entryId }/${ dateUpdated }`);

        //Leave entry page
        const locked = await axios.get(`${api_url}/deletesessioncopy`);
        navigate('/database/entry');
    };

    return (
        <Bar 
            toggleCopybar = { toggleCopybar } 
            hideCopybar = { hideCopybar } 
            revertEntry = { revertEntry }
        />
    );
};

export default Copysidebar;