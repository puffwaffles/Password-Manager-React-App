import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;
import './pages.css';
import Error from './error.jsx';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import Error404 from './error404.jsx';
const api_url = 'http://localhost:8000';

const Login = () => {
    const [databasename, setDatabasename] = useState('');
    const [loading, setLoading] = useState(true);
    const [loginpassword, setLoginPassword] = useState('');
    const [showerroressage, setShowErrorMessage] = useState(false);
    const [hidePassword, setHidePassword] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const sessiondatabasename = async () => {
        const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
        console.log("front end databasename: ", sessiondatabase.data.databasename);
        console.log("full response: ", sessiondatabase.data);
        const sessdatabasename = sessiondatabase.data.databasename;
        setLoading(false);
        setDatabasename(sessdatabasename);
    };

    //Update list of database entries
    useEffect(() => {
        sessiondatabasename();
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
        console.log('databasename:', databasename);
        event.preventDefault();
        //Checks if password is correct
        const correctpassword = await axios.get(`${api_url}/databases/login/${databasename}`);
        console.log(correctpassword.data);
        console.log('password:', loginpassword);
        //If password is correct, travel to database page
        if (correctpassword.data.actualpassword === loginpassword) {
            //Set login
            const login = await axios.get(`${api_url}/setloginsession/${databasename}`);
            console.log(login.data);
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
    if (!databasename) {
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
                    <Error showerror = { showerroressage } errormessage = 'Incorrect password'/>  
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