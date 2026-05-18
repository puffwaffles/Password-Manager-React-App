import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import Error from './error.jsx';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

const Prompt = () => {
    const [newdatabase, setNewdatabase] = useState({ databasename: '', password: '' });
    const [errormessage, setErrorMessage] = useState('');
    const [showerroressage, setShowErrorMessage] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Handles submission of database name and password
    async function handleSubmit(event) {
        event.preventDefault();
        const {databasename, password} = newdatabase;
        //Checks if database was already created
        const databaseexists = await axios.get(`${api_url}/databases/${databasename}`);
        console.log(databaseexists.data);
        if (databasename === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database must have a name');
        }
        //If database exists, toggle on popup
        else if (databaseexists.data.exists) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database name ${databasename} has been taken`);
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
                <div className = 'formitem'>
                    <div className = "labelblock"><label> Database name </label></div>
                    <input 
                        type = 'text'
                        value = {newdatabase.databasename}
                        onChange = {
                            event => {
                                setNewdatabase({ ...newdatabase, databasename: event.target.value });
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <Error showerror = { showerroressage } errormessage = {errormessage} />
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