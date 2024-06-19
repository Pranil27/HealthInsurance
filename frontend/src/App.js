import { useState } from 'react';
import './App.css';
import ClientFrontPage from './Components/ClientFrontPage';
import { LoginForm } from './Components/LoginForm/LoginForm';
import { SignUpForm } from './Components/SignUpForm/SignUpForm';
import {BrowserRouter as Router,Route,Routes,Navigate } from 'react-router-dom';
import Profile from './Components/User/Profile';
import HealthCareFrontPage from './Components/HealthCareFrontPage';
import InsurerFrontPage from './Components/Insurer/InsurerFrontPage';
import Payment from './Components/Payment/Payment';
import MyPolicies from './Components/User/MyPolicies';



function App() {
  
  return (
    <div>   
      <Router>
        <Routes>

           <Route path="/"  element={<SignUpForm />} />
           <Route path="/login" element={<LoginForm />} />
           <Route path="/client/dashboard" element={<ClientFrontPage />} />
           <Route path="/healthcare/dashboard" element={<HealthCareFrontPage />} />
           <Route path="/insurer/dashboard" element={<InsurerFrontPage/>}/>
           <Route path="/client/profile" element={<Profile />} />
           <Route path="/client/policies" element={<MyPolicies />} />
           <Route path="/client/payment" element={<Payment />} />
        </Routes>
  

      </Router>
    </div>



  );
}

export default App;
