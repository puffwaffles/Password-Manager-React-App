import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import { Lineicons } from "@lineiconshq/react-lineicons";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

const Prompt = () => {
    const [newdatabase, setNewdatabase] = useState({ databasename: '', password: '' });
    const [popup, setPopup] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Toggles popup btn
    function togglePopup(event) {
        setPopup(!popup);
    }

    //Creates popup button if popup is toggled on
    const Popup = ({signin, errormessage}) => {
        if (popup) {
            return (
            <div className = 'popupbtn'>
                <h4>{ errormessage }</h4>
                <button className = 'closebtn' onClick = {togglePopup}>Ok</button>
            </div>
        ); 
        }
        return(<></>);

    }

    //Handles submission of database name and password
    async function handleSubmit(event) {
        event.preventDefault();
        const {databasename, password} = newdatabase;
        //Checks if database was already created
        const databaseexists = await axios.get(`${api_url}/databases/${databasename}`);
        console.log(databaseexists.data);
        //If database exists, toggle on popup
        if (databaseexists.data.exists) {
            togglePopup();
        }
        else {
            //Creates new database
            const newdatabaseentry = await axios.post(`${api_url}/databases/${databasename}`, {databasename: databasename, password: password});
            //Return to home page
            navigate('/');
        }
    }

    return (
        <div>
            <h1>Please enter a database name and password</h1>
            <form onSubmit = { handleSubmit } className = "submitform">
                <Popup errormessage = 'This database name has been taken' />
                <div className = 'formitem'>
                    <div className = "labelblock"><label> Database name </label></div>
                    <input 
                        type = 'text'
                        value = {newdatabase.databasename}
                        onChange = {event => setNewdatabase({ ...newdatabase, databasename: event.target.value })}
                    />
                </div>
                <div className = 'formitem'>
                    <div className = "labelblock"><label> Password </label><button onClick = { toggleEye }>{ hidePassword ? <FaRegEyeSlash /> : <FaRegEye /> }</button></div>
                    <input 
                        type = { hidePassword ? 'password' : 'text' }
                        value = {newdatabase.password}
                        onChange = {event => setNewdatabase({ ...newdatabase, password: event.target.value })}
                    />
                </div>
                <div className = "twobtns">
                    <input type = 'submit' />
                    <button type = 'button' className = 'closebtn' onClick = {() => navigate('/')}>Go Back</button>
                </div>    
            </form>
        </div>
    );
};

export default Prompt;