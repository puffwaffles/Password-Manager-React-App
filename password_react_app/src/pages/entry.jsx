import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import './pages.css';
import { mappings } from './columnmap.js';
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
const api_url = 'http://localhost:8000';

const Entry = () => {
    const { databasename } = useParams();
    const { entryname } = useParams();
    const [entryfields, setEntryFields] = useState([]);
    const [extrafields, setExtraFields] = useState([]);
    const navigate = useNavigate();

    //Update list of database entries
    useEffect(() => {
        retrieveEntryFields();
    }, []);

    //Calls function in index.js to retrieve all created entry fields
    const retrieveEntryFields = async () => {
        const result = await axios.get(`${api_url}/databases/entries/fields/${ databasename }/${ entryname }`); 
        setEntryFields(result.data.mainfields);
        setExtraFields(result.data.extrafields);
    };   

    return (
        <div className = 'barbox'>
            <div className = 'topbar'>
                <button className = 'logo' onClick = {() => navigate(`/database/${databasename}`)}><IoIosArrowRoundBack /></button>
            </div>
            <div className = 'barboxcontent'>
                <h2>{entryname}</h2>
                <ul className = 'leftlist'>
                    {Object.entries(entryfields).map(([key, value]) => (
                        value != null && <li key = { key }>{ mappings[key] }: { value }</li>
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
};

export default Entry;