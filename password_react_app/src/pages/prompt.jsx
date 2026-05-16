import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import './pages.css'

const api_url = 'http://localhost:8000';

const Prompt = () => {
    const [newdatabase, setNewdatabase] = useState({ databasename: '', password: '' });
    const [popup, setPopup] = useState(false);
    const navigate = useNavigate();

    //Closes popup btn
    function togglePopup(event) {
        setPopup(!popup);
    }

    //Creates popup button
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
        if (databaseexists.data.exists) {
            togglePopup();
        }
        else {
            //Creates new database
            const newdatabaseentry = await axios.post(`${api_url}/databases/${databasename}`, {databasename: databasename, password: password});
            navigate('/');
        }
    }

    return (
        <div>
            <Popup errormessage = 'This database name has been taken' />
            <h1>Please enter a database name and password</h1>
            <form onSubmit = { handleSubmit }>
                <label> Database name: 
                    <input 
                        type = 'text'
                        value = {newdatabase.databasename}
                        onChange = {event => setNewdatabase({ ...newdatabase, databasename: event.target.value })}
                    />
                </label>
                <label> Password: 
                    <input 
                        type = 'text'
                        value = {newdatabase.password}
                        onChange = {event => setNewdatabase({ ...newdatabase, password: event.target.value })}
                    />
                </label>
                <input type = 'submit' />
            </form>
            <button className = 'closebtn' onClick = {() => navigate('/')}>Go Back</button>
        </div>
    );
};

export default Prompt;