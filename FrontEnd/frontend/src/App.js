import logo from './logo.svg';
import './App.css';
import { LoginForm } from './Components/LoginForm/LoginForm';
import { SignUpForm } from './Components/SignUpForm/SignUpForm';
import { useState } from 'react';

function App() {
  const [showSignUp, setShowSignUp] = useState(false);
  const toggleSignUp = () => {
    setShowSignUp(!showSignUp);
  };
  return (
    <div>
      {showSignUp ? (
        <SignUpForm toggleSignUp={toggleSignUp} />
      ) : (
        <LoginForm toggleSignUp={toggleSignUp} />
      )}
    </div>
  );
}

export default App;
