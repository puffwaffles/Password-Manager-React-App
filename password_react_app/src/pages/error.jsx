import React from 'react';
import './pages.css';

const Errorprop = ({showerror, errorMessage}) => {
    
    //Creates popup button if popup is toggled on
    const Message = ({showerror, errorMessage}) => {
        if (showerror) {
            return (
            <h4 style = {{ color: 'red' }}>{ errorMessage }</h4>
        ); 
        }
        return(<></>);

    }

    return (
        <Message showerror = { showerror } errorMessage = { errorMessage }/>
    );
};

export default Errorprop;
