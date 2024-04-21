import React, { useState } from 'react';
import './LoginForm.css';
import {useNavigate} from "react-router-dom";
import { FaUser,FaLock } from "react-icons/fa";

export const LoginForm = ({toggleSignUp}) => {
    const navigate = useNavigate();
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    //const [username,setUsername] = useState('');
    //const [selectedOption,setSelectedOption] = useState('client');

    const handleSubmit = async(e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/login`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({email:email,password:password}),
        });

        const json = await response.json();
       
        if(!json.success){
            alert("Enter Valid Credentials");
        }
        else {
            
            localStorage.setItem("userEmail",email);
            //localStorage.setItem("username",username);
            //localStorage.setItem("authToken",json.authToken);
            console.log(localStorage.getItem("userEmail"));
            //console.log(localStorage.getItem("username"));
            if (json.role === 'client') {
                navigate('/client/dashboard');
            } else if (json.role === 'Hospital') {
                navigate('/healthcare/dashboard');
            } else if (json === 'Insurer') {
                navigate('/insurer/dashboard');
            }
        }
        
    }

    

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
                <input type="text" placeholder='Email'
                   value={email} 
                   onChange={(e) => setEmail(e.target.value)} 
                   required />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="password" placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required />
                <FaLock className='icon'/>
            </div>
            <div className="remember-forget">
                <label><input type="checkbox" />Remember Me</label>
                <a href="#">Forgot Password?</a>
            </div>

            <button type='submit' onClick={handleSubmit}>Login</button>

            <div className="register-link">
                <p>Don't have an account? <button onClick={switchToSignUp}>Register</button></p>
            </div>
        </form>
    </div>
  )
}