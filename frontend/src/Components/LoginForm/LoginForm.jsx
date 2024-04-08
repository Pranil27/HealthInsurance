import React from 'react';
import './LoginForm.css';
import {useNavigate} from "react-router-dom";
import { FaUser,FaLock } from "react-icons/fa";

export const LoginForm = ({toggleSignUp}) => {
    const navigate = useNavigate();

    const switchToSignUp = () => {
        navigate('/');
    }

    const switchToDashboard = () => {
        navigate('/client/dashboard');
    }

  return (
    <div className='wrapper'>
        <form action="">
            <h1>Login</h1>
            <div className="input-box">
                <input type="text" placeholder='UserName' required />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="password" placeholder='Password' required />
                <FaLock className='icon'/>
            </div>
            <div className="remember-forget">
                <label><input type="checkbox" />Remember Me</label>
                <a href="#">Forgot Password?</a>
            </div>

            <button type='submit' onClick={switchToDashboard}>Login</button>

            <div className="register-link">
                <p>Don't have an account? <button onClick={switchToSignUp}>Register</button></p>
            </div>
        </form>
    </div>
  )
}