import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import './pages.css'
import Error from './error.jsx';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

const Prompt = () => {
    const [newdatabase, setNewdatabase] = useState({ databaseName: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
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
        const {databaseName, password} = newdatabase;
        //Checks if database was already created
        const databaseExists = await axios.get(`${api_url}/databases/${databaseName}`);
        console.log(databaseExists.data);
        //Regex for detecting alphanumeric characters
        const regex = /^[a-z0-9]+$/i;
        //If databaseName is empty string, do not accept
        if (databaseName === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database must have a name');
        }
        //Do not accept database name with special characters
        else if (!regex.test(databaseName)) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database must contain only alphanumeric characters');
        }
        //If database exists, toggle on popup
        else if (databaseExists.data.exists) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database name ${databaseName} has been taken`);
        }
        else {
            //Creates new database
            const newdatabaseentry = await axios.post(`${api_url}/databases/${databaseName}`, {databaseName: databaseName, password: password});
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
                        value = {newdatabase.databaseName}
                        onChange = {
                            event => {
                                setNewdatabase({ ...newdatabase, databaseName: event.target.value });
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <Error showerror = { showErrorMessage } errorMessage = {errorMessage} />
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