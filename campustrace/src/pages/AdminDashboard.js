import React, { useState, useEffect, useContext } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import FlaggedItems from "../components/FlaggedItems";
import "./admindashboard.css";
import ManageUsers from "../components/ManageUsers";
import ReportSection from "../components/ReportSection";
import UserHome from "../components/UserHome";
import MyReports from "../components/MyReports";
import {
  faUser, faHome, faClipboard, faFlag,
  faSignOut, faClipboardList, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const sidebarItems = [
  { label: "Home", key: "home", icon: faHome },
  { label: "My Reports", key: "myreports", icon: faClipboard },
  { label: "Manage Users", key: "users", icon: faUser },
  { label: "All Reports", key: "reports", icon: faClipboardList },
  { label: "Flaged items", key: "flags", icon: faFlag },
  { label: "Logout", key: "logout", icon: faSignOut }
];

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [confirmlogout, setConfirmLogout] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <Sidebar
        isOpen={isSidebarOpen}
        items={sidebarItems}
        onSelect={handleTabChange}
      />

      <Header toggleSidebar={toggleSidebar} />

      <div className="admin-container">
        {activeTab === "home" && <UserHome />}
        {activeTab === "myreports" && <MyReports />}
        {activeTab === "users" && <ManageUsers />}
        {activeTab === "reports" && <ReportSection />}
        {activeTab === "flags" && <FlaggedItems />}
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

export default AdminDashboard;
