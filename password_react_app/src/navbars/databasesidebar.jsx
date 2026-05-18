import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import { BsThreeDotsVertical } from "react-icons/bs";
import './navbars.css';
import Error from "../pages/error.jsx";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const api_url = 'http://localhost:8000';

//Panel for entering new username

//Panel for entering new password
const Newpasswordpanel = ({ hidepasswordpanel, newpassword, setNewPassword, setShowErrorMessage, showerroressage, errormessage, handlePasswordSubmit, toggleEye, toggleEye2, hidePassword, hidePassword2 }) => {
    if (hidepasswordpanel) {
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
                        value = { newpassword.password } 
                        onChange = {
                            event => {
                                setNewPassword({ ...newpassword, password: event.target.value });
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
                        value = { newpassword.confirmpassword } 
                        onChange = {
                            event => {
                                setNewPassword({ ...newpassword, confirmpassword: event.target.value });
                                //Set error message off
                                setShowErrorMessage(false);
                            }
                        }
                    />
                </div>
                <input type = 'submit' />
                <Error showerror = { showerroressage } errormessage = { errormessage }/>
            </form>
        </div>
    );
}

//Panel for deleting database
const Deletepanel = ( {deleteDatabase, toggleDelete, hidedelete} ) => {
    if (hidedelete) {
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

const Bar = ({toggleSidebar, hidesidebar, togglePasswordPanel, toggleDelete, hidedelete, hidepasswordpanel, newpassword, setNewPassword, setShowErrorMessage, showerroressage, errormessage, handlePasswordSubmit, toggleEye, toggleEye2, hidePassword, hidePassword2, deleteDatabase}) => {
        if (hidesidebar) {
            return (
                <button type = 'button' className = 'logo' onClick = { toggleSidebar }>{ <BsThreeDotsVertical /> }</button>
            );
        }
        return (
            <div className = 'sidebar'>
                <button className = 'sidebarclosebtn' onClick = { toggleSidebar }>x</button>
                <div className = 'sidebars'>Change Database Name</div>
                <div className = 'sidebars' onClick = { togglePasswordPanel }>Change Password</div>
                <Newpasswordpanel 
                    hidepasswordpanel = { hidepasswordpanel }
                    newpassword = { newpassword }
                    setNewPassword = { setNewPassword }
                    setShowErrorMessage = { setShowErrorMessage } 
                    showerroressage = { showerroressage }
                    errormessage = { errormessage }
                    handlePasswordSubmit = { handlePasswordSubmit }
                    toggleEye = { toggleEye }
                    toggleEye2 = { toggleEye2 } 
                    hidePassword = { hidePassword } 
                    hidePassword2 = { hidePassword2 }
                />
                <div className = 'sidebars'  onClick = { toggleDelete }>Delete Database</div>
                <Deletepanel 
                    deleteDatabase = { deleteDatabase }
                    toggleDelete = { toggleDelete }
                    hidedelete = { hidedelete }
                />
            </div>
        );
    }

const Databasesidebar = () => {
    const { databasename } = useParams();
    const [hidesidebar, setHideSidebar] = useState(true);
    const [showerroressage, setShowErrorMessage] = useState(false);
    const [errormessage, setErrorMessage] = useState('');
    const [hidepasswordpanel, setHidePasswordPanel] = useState(true);
    const [newpassword, setNewPassword] = useState({ password: '', confirmpassword: '' });
    const [hidePassword, setHidePassword] = useState(true);
    const [hidePassword2, setHidePassword2] = useState(true);
    const [hidedelete, setHideDelete] = useState(true);
    const navigate = useNavigate();

    //Toggles sidebar 
    function toggleSidebar(event) {
        event.preventDefault();
        setHideSidebar(!hidesidebar);
    }

    //Toggles eye btn
    function toggleEye(event) {
        event.preventDefault();
        setHidePassword(!hidePassword);
    }

    function toggleEye2(event) {
        event.preventDefault();
        setHidePassword2(!hidePassword2);
    }

    //Toggles password panel 
    function togglePasswordPanel(event) {
        event.preventDefault();
        setHidePasswordPanel(!hidepasswordpanel);
        //Make sure other panels are hidden
        setHideDelete(true);
    }

    //Toggles delete panel 
    function toggleDelete(event) {
        event.preventDefault();
        setHideDelete(!hidedelete);
        //Make sure other panels are hidden
        setHidePasswordPanel(true);
    }

    //Deletes Database
    async function deleteDatabase(event) {
        event.preventDefault();

        //Deletes all tables for given database
        const deletedatabase = await axios.delete(`${api_url}/databases/delete/${databasename}`);

        //Returns back to homepage
        navigate('/');
    }

    //Handles submission of new password
    async function handlePasswordSubmit(event) {
        console.log('databasename:', databasename);
        event.preventDefault();
        const password = newpassword.password;
        const confirmpassword = newpassword.confirmpassword;
        const correctpassword = await axios.get(`${api_url}/databases/login/${databasename}`);
        console.log(correctpassword.data);
        console.log('newpassword state:', newpassword);
        //Checks if database was already created
        if (correctpassword.data.actualpassword === password) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('New password can not be the same as old password');
        }
        //If password is correct, travel to database page
        else if (password !== confirmpassword) {
            //Set error message on
            setShowErrorMessage(true);
            setErrorMessage('Passwords do not match');
        }
        else {
            const changedpassword = await axios.patch(`${api_url}/databases/setpassword/${databasename}`, { password });
            setNewPassword({ password: '', confirmpassword: '' });
            setHidePasswordPanel(true);
        }
    }

    return (
        <Bar 
            toggleSidebar = { toggleSidebar } 
            hidesidebar = { hidesidebar }
            togglePasswordPanel = { togglePasswordPanel } 
            toggleDelete = { toggleDelete }
            hidedelete = { hidedelete }
            hidepasswordpanel = { hidepasswordpanel }
            newpassword = { newpassword }
            setNewPassword = { setNewPassword }
            setShowErrorMessage = { setShowErrorMessage } 
            showerroressage = { showerroressage }
            errormessage = { errormessage }
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