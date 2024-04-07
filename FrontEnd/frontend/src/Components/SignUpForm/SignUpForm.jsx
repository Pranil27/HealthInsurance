import React from 'react'
import './SignUpForm.css'
import { FaUser,FaLock } from "react-icons/fa";

export const SignUpForm = ({ toggleSignUp }) => {
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
                <select name="organisation" className='options'>
                    <option value="client">Client</option>
                    <option value="Insurer">Insurer</option>
                    <option value="HealthCare">HealthCare</option>
                </select>
            </div>
            <button type='submit'>SignUp</button>

            <div className="register-link">
                <p>Already Have an Account? <button onClick={toggleSignUp}>Back To Login</button></p>
            </div>
        </form>
    </div>
  )
}
