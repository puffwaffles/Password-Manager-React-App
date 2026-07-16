import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
axios.defaults.withCredentials = true;
import { BsThreeDotsVertical } from "react-icons/bs";
import './navbars.css';
import Errorprop from "../pages/error.jsx";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoPencil } from "react-icons/io5";

const api_url = 'http://localhost:8000';

//Panel for entering new username
const Newnamepanel = ({ hideNamePanel, newName, setNewName, setShowErrorMessage, showErrorMessage, errorMessage, handleNameSubmit }) => {
    if (hideNamePanel) {
        return (<></>);
    }
    return (
        <div>
            <div className = 'sidebars'>Please enter a new databse name</div>
            <form onSubmit = { handleNameSubmit }>
                <div className = 'formitem'>
                    <div className = "labelblock"><label> New Name </label></div>
                    <input 
                        type = 'text'
                        value = { newName } 
                        onChange = {
                            event => {
                                setNewName(event.target.value);
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <input type = 'submit' />
                <Errorprop showerror = { showErrorMessage } errorMessage = { errorMessage }/>
            </form>
        </div>
    );
}

//Panel for entering new password
const Newpasswordpanel = ({ hidePasswordPanel, newPassword, setNewPassword, setShowErrorMessage, showErrorMessage, errorMessage, handlePasswordSubmit, toggleEye, toggleEye2, hidePassword, hidePassword2 }) => {
    if (hidePasswordPanel) {
        return (<></>);
    }
    return (
        <div>
            <div className = 'sidebars'>Please enter a new password</div>
            <form onSubmit = { handlePasswordSubmit }>
                <div className = 'formitem'>
                    <div className = "labelblock"><label> New Password </label><button onClick = { toggleEye }>{ hidePassword ? <FaRegEyeSlash /> : <FaRegEye /> }</button></div>
                    <input 
                        type = { hidePassword ? 'password' : 'text' }
                        value = { newPassword.password } 
                        onChange = {
                            event => {
                                setNewPassword({ ...newPassword, password: event.target.value });
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <div className = 'formitem'>
                    <div className = "labelblock"><label> Confirm Password </label><button onClick = { toggleEye2 }>{ hidePassword2 ? <FaRegEyeSlash /> : <FaRegEye /> }</button></div>
                    <input 
                        type = { hidePassword2 ? 'password' : 'text' }
                        value = { newPassword.confirmpassword } 
                        onChange = {
                            event => {
                                setNewPassword({ ...newPassword, confirmpassword: event.target.value });
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <input type = 'submit' />
                <Errorprop showerror = { showErrorMessage } errorMessage = { errorMessage }/>
            </form>
        </div>
    );
}

//Panel for deleting database
const Deletepanel = ( {deleteDatabase, toggleDelete, hideDelete} ) => {
    if (hideDelete) {
        return (<></>);
    }
    return (
        <div>
            <div className = 'sidebars'>Are you sure you want to delete this database?</div>
            <div className = 'yesnosidebar'>
                <button onClick = { deleteDatabase }>Yes</button>
                <button onClick = { toggleDelete }>No</button>
            </div>
        </div>
    );
}

const Bar = ({toggleSidebar, toggleNamePanel, togglePasswordPanel, toggleDelete, hideSidebar, hideDelete, hideNamePanel, newName, setNewName, handleNameSubmit, hidePasswordPanel, newPassword, setNewPassword, setShowErrorMessage, showErrorMessage, errorMessage, handlePasswordSubmit, toggleEye, toggleEye2, hidePassword, hidePassword2, deleteDatabase}) => {
        if (hideSidebar) {
            return (
                <button type = 'button' className = 'logo' onClick = { toggleSidebar }>{ <BsThreeDotsVertical /> }</button>
            );
        }
        return (
            <div className = 'sidebar'>
                <button className = 'sidebarclosebtn' onClick = { toggleSidebar }>x</button>
                <div className = 'sidebars' onClick = { toggleNamePanel }><IoPencil /> Change Database Name</div>
                <Newnamepanel 
                    hideNamePanel = { hideNamePanel }
                    newName = { newName }
                    setNewName = { setNewName }
                    setShowErrorMessage = { setShowErrorMessage } 
                    showErrorMessage = { showErrorMessage }
                    errorMessage = { errorMessage }
                    handleNameSubmit = { handleNameSubmit }
                />
                <div className = 'sidebars' onClick = { togglePasswordPanel }><IoPencil /> Change Password</div>
                <Newpasswordpanel 
                    hidePasswordPanel = { hidePasswordPanel }
                    newPassword = { newPassword }
                    setNewPassword = { setNewPassword }
                    setShowErrorMessage = { setShowErrorMessage } 
                    showErrorMessage = { showErrorMessage }
                    errorMessage = { errorMessage }
                    handlePasswordSubmit = { handlePasswordSubmit }
                    toggleEye = { toggleEye }
                    toggleEye2 = { toggleEye2 } 
                    hidePassword = { hidePassword } 
                    hidePassword2 = { hidePassword2 }
                />
                <div className = 'sidebars'  onClick = { toggleDelete }> <FaRegTrashCan />Delete Database</div>
                <Deletepanel 
                    deleteDatabase = { deleteDatabase }
                    toggleDelete = { toggleDelete }
                    hideDelete = { hideDelete }
                />
            </div>
        );
    }

const Databasesidebar = ({barDatabaseName}) => {
    const databaseName = barDatabaseName;
    const [newName, setNewName] = useState('');
    const [hideSidebar, setHideSidebar] = useState(true);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [hideNamePanel, setHideNamePanel] = useState(true);
    const [hidePasswordPanel, setHidePasswordPanel] = useState(true);
    const [newPassword, setNewPassword] = useState({ password: '', confirmpassword: '' });
    const [hidePassword, setHidePassword] = useState(true);
    const [hidePassword2, setHidePassword2] = useState(true);
    const [hideDelete, setHideDelete] = useState(true);
    const navigate = useNavigate();

    //Toggles sidebar 
    function toggleSidebar(event) {
        event.preventDefault();
        setHideSidebar(!hideSidebar);
    }

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    //Toggles second eye btn
    function toggleEye2(event) {
        event.preventDefault();
        setHidePassword2(!hidePassword2);
    }

    //Toggles name panel
    function toggleNamePanel(event) {
        event.preventDefault();
        setHideNamePanel(!hideNamePanel);
        //Make sure other panels are hidden
        setHideDelete(true);
        setHidePasswordPanel(true);
    }

    //Toggles password panel 
    function togglePasswordPanel(event) {
        event.preventDefault();
        setHidePasswordPanel(!hidePasswordPanel);
        //Make sure other panels are hidden
        setHideNamePanel(true);
        setHideDelete(true);
    }

    //Toggles delete panel 
    function toggleDelete(event) {
        event.preventDefault();
        setHideDelete(!hideDelete);
        //Make sure other panels are hidden
        setHidePasswordPanel(true);
        setHidePasswordPanel(true);
    }

    //Deletes Database
    async function deleteDatabase(event) {
        event.preventDefault();

        //Deletes all tables for given database
        const deletedatabase = await axios.delete(`${api_url}/databases/delete/${databaseName}`);

        //Deletes session for database
        const locked = await axios.get(`${api_url}/deleteloginsession`);

        //Returns back to homepage
        navigate('/');
    }

    //Handles submission of new password
    async function handleNameSubmit(event) {
        event.preventDefault();
        const newDatabaseName = newName;
        //Checks if database name is already used
        const databaseExists = await axios.get(`${api_url}/databases/${newDatabaseName}`);
        
        if (newDatabaseName === '') {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Database must have a name');
        }
        else if (!databaseExists.data.exists) {
            const changedname = await axios.patch(`${api_url}/databases/setname/${databaseName}`, { newDatabaseName });
            setNewName('');
            setHideNamePanel(true);
            setHideSidebar(true);
            const changedsessionname = await axios.get(`${api_url}/setsessiondatabase/${newDatabaseName}`);
            const sessiondatabase = await axios.get(`${api_url}/getsessiondatabase`);
            navigate(`/database/`);
        }
        //If database name is already used by another database
        else if (databaseExists.data.exists && databaseName !== newDatabaseName) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage(`The database name ${newDatabaseName} has been taken`);
        }
    }

    //Handles submission of new password
    async function handlePasswordSubmit(event) {
        event.preventDefault();
        const password = newPassword.password;
        const confirmpassword = newPassword.confirmpassword;
        //Checks if password is old password
        const correct = await axios.get(`${api_url}/databases/password/login/${databaseName}/${password}`);
        //New password is the same as old password
        if (correct.data.correct) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('New password can not be the same as old password');
        }
        //Checks if new password is the same as old password
        else if (password !== confirmpassword) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Passwords do not match');
        }
        else {
            const changedpassword = await axios.patch(`${api_url}/databases/setpassword/${databaseName}`, { password });
            setNewPassword({ password: '', confirmpassword: '' });
            setHidePasswordPanel(true);
        }
    }

    return (
        <Bar 
            toggleSidebar = { toggleSidebar } 
            hideSidebar = { hideSidebar }
            toggleNamePanel= {toggleNamePanel}
            togglePasswordPanel = { togglePasswordPanel } 
            toggleDelete = { toggleDelete }
            hideDelete = { hideDelete }
            hideNamePanel = { hideNamePanel }
            newName = { newName }
            setNewName = { setNewName }
            handleNameSubmit = { handleNameSubmit }
            hidePasswordPanel = { hidePasswordPanel }
            newPassword = { newPassword }
            setNewPassword = { setNewPassword }
            setShowErrorMessage = { setShowErrorMessage } 
            showErrorMessage = { showErrorMessage }
            errorMessage = { errorMessage }
            handlePasswordSubmit = { handlePasswordSubmit }
            toggleEye = { toggleEye }
            toggleEye2 = { toggleEye2 } 
            hidePassword = { hidePassword } 
            hidePassword2 = { hidePassword2 }
            deleteDatabase = { deleteDatabase }
        />
    );
};

export default Databasesidebar;