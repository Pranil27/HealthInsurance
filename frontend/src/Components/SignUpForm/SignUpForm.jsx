import React from 'react'
import './SignUpForm.css';
import {useNavigate} from "react-router-dom";
import { useState } from 'react';
import { FaUser,FaLock } from "react-icons/fa";

export const SignUpForm = ({ toggleSignUp }) => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState('client');

    const switchToLogin = () => {
        navigate('/login');
    }

    const switchToDashboard = () => {
        if (selectedOption === 'client') {
            navigate('/client/dashboard');
        } else if (selectedOption === 'HealthCare') {
            navigate('/healthcare/dashboard');
        } else if (selectedOption === 'Insurer') {
            navigate('/insurer/dashboard');
        }
    }

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    }

  return (
    <div className='wrapper'>
        <form action="">
            <h1>SignUp</h1>
            <div className="input-box">
                <input type="text" placeholder='UserName' required />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="password" placeholder='Password' required />
                <FaLock className='icon'/>
            </div>
            <div className="input-box">
                <select name="organisation" className='options' onChange={handleOptionChange} value={selectedOption}>
                    <option value="client">Client</option>
                    <option value="Insurer">Insurer</option>
                    <option value="HealthCare">HealthCare</option>
                </select>
            </div>
            <button type='submit' onClick={switchToDashboard}>SignUp</button>

            <div className="register-link">
                <p>Already Have an Account? <button onClick={switchToLogin}>Back To Login</button></p>
            </div>
        </form>
    </div>
  )
}