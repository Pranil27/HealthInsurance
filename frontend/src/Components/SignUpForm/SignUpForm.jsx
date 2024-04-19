import React, { useState } from 'react'
import './SignUpForm.css';
import {useNavigate} from "react-router-dom";
import { FaUser,FaLock} from "react-icons/fa";
import axios from 'axios';


export const SignUpForm = ({ toggleSignUp }) => {
    const navigate = useNavigate();
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [email,setEmail] = useState('');
    const [dob,setDob] = useState('');
    const [mobile,setMobile] = useState('');
    const [selectedOption,setSelectedOption] = useState('client');

    const handleSubmit = async(e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/signup`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({username:username,email:email,dob:dob,mobile:mobile,password:password})
        });

        const json = await response.json();
        console.log(json);

        if(!json.success){
            alert("Enter Valid Credentials");
        } else {
            navigate('/login');
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
                    placeholder='Name' value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="text" 
                    placeholder='Email' value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="text" 
                    placeholder='Date of Birth' value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required 
                />
                <FaUser className='icon'/>
            </div>
            <div className="input-box">
                <input type="text" 
                    placeholder='Mobile Number' value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
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