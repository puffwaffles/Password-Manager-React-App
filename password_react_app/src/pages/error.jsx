import React from 'react';
import './pages.css';

const Error = ({showerror, errormessage}) => {
    
    //Creates popup button if popup is toggled on
    const Message = ({showerror, errormessage}) => {
        console.log(showerror);
        console.log(errormessage);
        if (showerror) {
            return (
            <h4 style = {{ color: 'red' }}>{ errormessage }</h4>
        ); 
        }
        return(<></>);

    }

    return (
        <Message showerror = { showerror } errormessage = { errormessage }/>
    );
};

export default Error;
