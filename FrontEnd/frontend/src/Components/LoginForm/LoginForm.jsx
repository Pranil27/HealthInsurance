import React from 'react'
import './LoginForm.css'
import { FaUser,FaLock } from "react-icons/fa";

export const LoginForm = ({toggleSignUp}) => {
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

            <button type='submit'>Login</button>

            <div className="register-link">
                <p>Don't have an account? <button onClick={toggleSignUp}>Register</button></p>
            </div>
        </form>
    </div>
  )
}
