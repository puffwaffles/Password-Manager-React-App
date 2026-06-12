import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './pages.css';
import Errorprop from './error.jsx';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Login = () => {
    const [databaseName, setDatabaseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [loginpassword, setLoginPassword] = useState('');
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const sessiondatabaseName = async () => {
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        const sessdatabaseName = sessiondatabase.data.databaseName;
        setLoading(false);
        setDatabaseName(sessdatabaseName);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondatabaseName();
    }, [location]);


    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    };

    async function goBack() {
        const locked = await axios.get(`${api_url}/deleteloginsession`);
        navigate('/');
    };

    //Handles submission of database name and password
    async function handleSubmit(event) {
        event.preventDefault();
        const password = loginpassword;
        //Checks if password is correct
        const correct = await axios.get(`${api_url}/databases/password/login/${databaseName}/${password}`);
        //If password is correct, travel to database page
        if (correct.data.correct) {
            //Set login
            const login = await axios.get(`${api_url}/setloginsession/${databaseName}`);
            navigate(`/database`);
        }
        else {
            //Set error message on
            setShowErrorMessage(true);
        }
    };

    if (loading) {
        return(<h1>Loading page</h1>);
    }
    if (!databaseName) {
        return(<Error404 />);
    }
    else {
        return (
            <div>
                <h1>Please enter the password</h1>
                <form onSubmit = { handleSubmit } className = "submitform">
                    <div className = 'formitem'>
                        <div className = "labelblock"><label> Password </label><button type = 'button' onClick = { toggleEye }> { hidePassword ? <FaRegEyeSlash /> : <FaRegEye /> } </button></div>
                        <input 
                            type = { hidePassword ? 'password' : 'text' }
                            value = { loginpassword } 
                            onChange = {
                                event => {
                                    setLoginPassword(event.target.value);
                                    //Set error message off
                                    setShowErrorMessage(false);
                                }
                            }
                        />
                    </div>
                    <Errorprop showerror = { showErrorMessage } errorMessage = 'Incorrect password'/>  
                    <div className = "twobtns">
                        <input type = 'submit' />
                        <button type = 'button' className = 'closebtn' onClick = { goBack }>Go Back</button>
                    </div> 
                    
                </form>
            </div>
        );
    }
    
};

export default Login;