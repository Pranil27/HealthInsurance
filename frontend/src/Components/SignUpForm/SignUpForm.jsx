import React, { useState } from 'react'
import './SignUpForm.css';
import {useNavigate} from "react-router-dom";
import { useState } from 'react';
import { FaUser,FaLock } from "react-icons/fa";
import axios from 'axios';


export const SignUpForm = ({ toggleSignUp }) => {
    const navigate = useNavigate();
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');

    const handleSubmit = async() => {
        try {
            console.log(username);
            console.log(password);
            const response = await axios.post('http://localhost:5000/signup', { username, password });
            
            console.log(response.data); // Handle successful registration
            navigate('/login'); // Redirect to the login page after successful registration
          } catch (error) {
            console.error(error.response.data.message); // Handle registration error
          }
    }

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
                <input type="text" 
                    placeholder='UserName' value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="password" placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                />
                <FaLock className='icon'/>
            </div>
            <div className="input-box">
                <select name="organisation" className='options' onChange={handleOptionChange} value={selectedOption}>
                    <option value="client">Client</option>
                    <option value="Insurer">Insurer</option>
                    <option value="HealthCare">HealthCare</option>
                </select>
            </div>
            <button type='submit' onClick={handleSubmit}>SignUp</button>

            <div className="register-link">
                <p>Already Have an Account? <button onClick={switchToLogin}>Back To Login</button></p>
            </div>
        </form>
    </div>
  )
}