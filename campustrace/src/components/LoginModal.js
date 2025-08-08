import React, { useEffect, useState } from 'react';
import "./modal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTimes, faLock } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loading from './Loading';
import { useAuth } from "../context/AuthContext";

const LoginModal = ({ isOpen, onClose, onLoginSuccess, openSignup }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { login } = useAuth();
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const form = event.target;
    const credentials = {
      email: form.email.value.trim(),
      password: form.password.value,
    };

    try {
      const res = await axios.post('https://campustrace-backend.onrender.com/api/users/login', credentials);

      if (res.data.success && res.data.user) {
        const loggedInUser = res.data.user;
        login(res.data.user);
        onClose();
      } else {
        setErrorMessage(res.data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage('⚠️ Invalid email or password.');
        setIsConfirmOpen(true);
      } else if (err.response && err.response.data?.message) {
        setErrorMessage(err.response.data.message);
        setIsConfirmOpen(true);
      } else {
        setErrorMessage('Server error. Please try again later.');
        setIsConfirmOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='signupbox'>
        <form className='signup-form' onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 className='heading'>Login</h2>
            <button className="close-icon" type="button" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} className="clsbtn" />
            </button>
          </div>

          <label htmlFor='email'>
            <FontAwesomeIcon icon={faEnvelope} className="m email" />
            Email
          </label>
          <input type='email' name='email' placeholder='Enter your email' required autoComplete="email" />

          <label htmlFor='password'>
            <FontAwesomeIcon icon={faLock} className="m pass" />
            Password
          </label>
          <input type='password' name='password' placeholder='Enter your password' required autoComplete="current-password" />
          <div className="modal-header">
            <button className='loginbutton' type='submit' disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

        </form>


        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          Don’t have an account?{" "}
          <span
            style={{ color: '#007bff', cursor: 'pointer' }}
            onClick={() => {
              onClose();
              if (openSignup) openSignup();
            }}
          >
            Sign up
          </span>
        </p>
      </div>
      {isConfirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setIsConfirmOpen(false)}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>{errorMessage}</p>
            <div className="confirm-buttons">
              <button className="no-button" onClick={() => setIsConfirmOpen(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="confirm-overlay">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default LoginModal;
