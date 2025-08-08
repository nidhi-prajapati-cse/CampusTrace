import React, { useEffect, useState } from 'react';
import "./modal.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faMale, faFemale, faTimes, faGenderless } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loading from './Loading';

const SignupModal = ({ isOpen, onClose, onLoginSuccess, openLogin }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const userData = {
      name: form.username.value,
      email: form.email.value,
      password: form.password.value,
      gender: form.gender.value,
    };

    try {
      const signupRes = await axios.post('http://localhost:5000/api/users/signup', userData);
      if (!signupRes.data.success) {
        setErrorMessage(signupRes.data.message || 'Signup failed. Try again.');
        setIsConfirmOpen(true);
        return;
      }
      const loginRes = await axios.post('http://localhost:5000/api/users/login', {
        email: userData.email,
        password: userData.password,
      });
      if (loginRes.data.success && loginRes.data.user) {
        const loggedInUser = loginRes.data.user;
        const token = loginRes.data.token;
        localStorage.setItem('user', JSON.stringify(loggedInUser || {}));
        if (token) localStorage.setItem("token", token);
        if (onLoginSuccess) onLoginSuccess(loggedInUser);
        onClose();
      } else {
        setErrorMessage('Signup succeeded, but auto-login failed. Please try logging in.');
        setIsConfirmOpen(true);
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrorMessage('⚠️ Email already exists. Try logging in.');
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
            <h2 className='heading'>SignUp</h2>
            <button className="close-icon" type="button" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} className="clsbtn" />
            </button>
          </div>



          <label htmlFor='username'>
            <FontAwesomeIcon icon={faUser} className="m user" />
            Username
          </label>
          <input type='text' name='username' placeholder='Enter your username' required />

          <label htmlFor='email'>
            <FontAwesomeIcon icon={faEnvelope} className="m email" />
            Email
          </label>
          <input type='email' name='email' placeholder='Enter your email' required />

          <label htmlFor='password'>
            <FontAwesomeIcon icon={faLock} className="m pass" />
            Password
          </label>
          <input type='password' name='password' placeholder='Enter your password' required />

          <label>Gender:</label>
          <div className="gender-options">
            <label>
              <FontAwesomeIcon icon={faMale} className="m male" />
              Male
              <input type='radio' name='gender' value='male' style={{ marginLeft: '8px' }} required />
            </label>
            <label style={{ marginLeft: '2px' }}>
              <FontAwesomeIcon icon={faFemale} className="m female" />
              Female
              <input type='radio' name='gender' value='female' style={{ marginLeft: '8px' }} />
            </label>
            <label style={{ marginLeft: '2px' }}>
              <FontAwesomeIcon icon={faGenderless} className="m other" />
              Other
              <input type='radio' name='gender' value='other' style={{ marginLeft: '8px' }} />
            </label>
          </div>
          <div className="modal-header">
            <button className='submitbutton' type='submit' disabled={loading}>{loading ? 'Signing up...' : 'Signup'}</button>
          </div>

        </form>

        <p style={{ marginTop: '10px', textAlign: 'center' }}>
          Already have an account?{" "}
          <span
            style={{ color: '#007bff', cursor: 'pointer' }}
            onClick={() => {
              onClose();
              if (openLogin) openLogin();
            }}
          >
            Login
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

export default SignupModal;
