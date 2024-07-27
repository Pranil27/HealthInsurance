import { useState } from 'react';
import './App.css';
import ClientFrontPage from './Components/ClientFrontPage';
import { LoginForm } from './Components/LoginForm/LoginForm';
import { SignUpForm } from './Components/SignUpForm/SignUpForm';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './Components/User/Profile';
import HealthCareFrontPage from './Components/HealthCareFrontPage';
import InsurerFrontPage from './Components/Insurer/InsurerFrontPage';
import Payment from './Components/Payment/Payment';
import MyPolicies from './Components/User/MyPolicies';
import Layout from './Components/Layouts/Layout.jsx';
import { Logout } from './Components/LoginForm/Logout.jsx';




function App() {

  return (
    <div>
      <Router>
        <Routes>

          <Route path="/" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/client/dashboard" element={
           
              <ClientFrontPage />
         
          } />
          <Route path="/healthcare/dashboard" element={
            <Layout>
              <HealthCareFrontPage />
            </Layout>
          } />
          <Route path="/insurer/dashboard" element={
            <Layout>
              <InsurerFrontPage />
            </Layout>
          } />
          <Route path="/client/profile" element={
            <Layout>
              <Profile />
            </Layout>
            } />
          <Route path="/client/policies" element={<MyPolicies />} />
          <Route path="/client/payment" element={<Payment />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>


      </Router>
    </div>



  );
}

export default App;
