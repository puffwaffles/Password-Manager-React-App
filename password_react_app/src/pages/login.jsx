import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import './pages.css';
import Error from './error.jsx';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const api_url = 'http://localhost:8000';

const Login = () => {
    const { databasename } = useParams();
    const [loginpassword, setLoginPassword] = useState('');
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
        console.log('databasename:', databasename);
        event.preventDefault();
        //Checks if password is correct
        const correctpassword = await axios.get(`${api_url}/databases/login/${databasename}`);
        console.log(correctpassword.data);
        console.log('password:', loginpassword);
        //If password is correct, travel to database page
        if (correctpassword.data.actualpassword === loginpassword) {
            navigate(`/database/${databasename}`);
        }
        else {
            //Set error message on
            setShowErrorMessage(true);
        }
    }

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
                <Error showerror = { showerroressage } errormessage = 'Incorrect password'/>  
                <div className = "twobtns">
                    <input type = 'submit' />
                    <button type = 'button' className = 'closebtn' onClick = {() => navigate('/')}>Go Back</button>
                </div> 
                 
            </form>
        </div>
    );
};

export default Login;