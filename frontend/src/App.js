import { useState } from 'react';
import './App.css';
import ClientFrontPage from './Components/ClientFrontPage';
import { LoginForm } from './Components/LoginForm/LoginForm';
import { SignUpForm } from './Components/SignUpForm/SignUpForm';
import {BrowserRouter as Router,Route,Routes,Navigate } from 'react-router-dom';
import Profile from './Components/User/Profile';



function App() {
  
  return (
    <div>   
      <Router>
        <Routes>

           <Route path="/"  element={<SignUpForm />} />
           <Route path="/login" element={<LoginForm />} />
           <Route path="/client/dashboard" element={<ClientFrontPage />} />
           <Route path="/client/profile" element={<Profile />} />
        </Routes>
  

      </Router>
    </div>



  );
}

export default App;