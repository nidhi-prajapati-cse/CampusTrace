import Header from '../components/Header';
import MyReports from '../components/MyReports';
import UserHome from '../components/UserHome';
import React, { useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "./admindashboard.css";
import { faHome, faClipboard, faSignOut, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const sidebarItems = [
  { label: "Home", key: "home", icon: faHome },
  { label: "My Reports", key: "myreports", icon: faClipboard },
  { label: "Logout", key: "logout", icon: faSignOut }
];

const UserDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [confirmlogout, setConfirmLogout] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleTabChange = (tabKey) => {
    if (tabKey === "logout") {
      setIsSidebarOpen(false);
      setConfirmLogout(true);

      return;
    }
    setActiveTab(tabKey);
  };

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} items={sidebarItems} onSelect={handleTabChange} />
      <Header toggleSidebar={toggleSidebar} />
      <div className="admin-container">
        {activeTab === "home" && <UserHome />}
        {activeTab === "myreports" && <MyReports />}
      </div>
      <Footer />
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

export default UserDashboard;
