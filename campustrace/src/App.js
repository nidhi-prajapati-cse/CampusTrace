import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./header.css";
import logo from "../assets/logo.png";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { FaBars } from "react-icons/fa";
import { faMoon, faSignOut, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext } from "../context/AuthContext";

const Header = ({ toggleSidebar }) => {
  const { user, login, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardPage = location.pathname === "/dash";
  const [confirmlogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);


  useEffect(() => {
    document.body.style.overflow = (showLogin || showSignup) ? 'hidden' : 'auto';
  }, [showLogin, showSignup]);


  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true);
    const handleOpenSignup = () => setShowSignup(true);

    window.addEventListener("openLoginModal", handleOpenLogin);
    window.addEventListener("openSignupModal", handleOpenSignup);

    return () => {
      window.removeEventListener("openLoginModal", handleOpenLogin);
      window.removeEventListener("openSignupModal", handleOpenSignup);
    };
  }, []);

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };


  const handleLoginSuccess = (userData) => {
    login(userData);
    closeModals();
  };

  const handleLogout = () => {

    setConfirmLogout(true);
    return;
  };


  const useroptions = (!isDashboardPage) ? (
    <div className="navbar-buttons">
      <div className="dark-toggle">
        <button onClick={() => setDarkMode(!darkMode)}>
          <FontAwesomeIcon icon={faMoon} />
        </button>
      </div>

      {user ? (
        <>
          <button className="btna admindash" onClick={() => navigate('/dash')}>Dashboard</button>
          <button className="btna logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOut} />
          </button>
        </>
      ) : (
        <>
          <button className="btna signup-btn" onClick={() => setShowSignup(true)}>Signup</button>
          <button className="btna login-btn" onClick={() => setShowLogin(true)}>Login</button>
        </>
      )}
    </div>
  ) : (
    <div className="admin-greeting">
      <div className="dark-toggle">
        <button onClick={() => setDarkMode(!darkMode)}>
          <FontAwesomeIcon icon={faMoon} />
        </button>
      </div>
      <p>{isDashboardPage? "Welcome, " : "Hello, "}
        <strong>{user?.name}</strong>
      </p>

    </div>
  );

  return (
    <>
      <div className="header-container">
        <div className="left-header">
          {(isDashboardPage) && (
            <button className="toggle-icon" onClick={toggleSidebar}>
              <FaBars size={22} />
            </button>
          )}
          <div className="logo-container" onClick={() => navigate('/')}>
            <img src={logo} alt="CampusTrace Logo" className="logo" />
            <span className="logo-text">CampusTrace</span>
          </div>
        </div>
        {useroptions}
      </div>


      {showSignup && (
        <SignupModal
          onClose={closeModals}
          isOpen={true}
          onLoginSuccess={handleLoginSuccess}
          openLogin={() => setShowLogin(true)}
        />
      )}
      {showLogin && (
        <LoginModal
          onClose={closeModals}
          isOpen={true}
          onLoginSuccess={handleLoginSuccess}
          openSignup={() => setShowSignup(true)}
        />
      )}
      {confirmlogout && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setConfirmLogout(false)}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>Do you want to logout?</p>
            <div className="confirm-buttons">
              <button className="yes-button" onClick={() => {
                logout();
                navigate("/"); setConfirmLogout(false);
              }}>Yes</button>
              <button className="no-button" onClick={() => setConfirmLogout(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
