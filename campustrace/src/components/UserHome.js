import React, { useState, useEffect, useContext } from 'react';
import './userhome.css';
import defaultimage from '../assets/defaultprofile.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit, faSave, faTimes, faUser, faEnvelope, faPhone, faVenusMars,
  faIdBadge, faGraduationCap, faUserShield, faClock, faCamera, faTrash
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loading from './Loading';
import Error from './Error';

const UserHome = () => {
  const { user } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableInfo, setEditableInfo] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [confirmEdit, setConfirmEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(`https://campustrace-backend.onrender.com/api/users/${user._id}`);
        if (res.data.success) {
          setUserInfo(res.data.user);
          setEditableInfo(res.data.user);
        } else {
          console.error('User fetch failed:', res.data.message);
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [user]);

  const handleChange = (e) => {
    setEditableInfo({ ...editableInfo, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setEditableInfo({ ...editableInfo, image: file });
  };

  const handleRemoveImage = () => {
    setConfirmDelete(false);
    setEditableInfo({ ...editableInfo, image: null });
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // If image is null, tell backend to remove
      if (editableInfo.image === null) {
        formData.append('removeImage', true);
      } else {
        Object.entries(editableInfo).forEach(([key, value]) => {
          if (key !== 'image' || value instanceof File) formData.append(key, value);
        });
      }

      const res = await axios.put(`https://campustrace-backend.onrender.com/api/users/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setUserInfo(res.data.user);
        setEditableInfo(res.data.user);
        setIsEditing(false);
      } else {
        alert(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Server error while updating profile.');
    }
  };

  if (loading) return <Loading />;
  if (!userInfo || error) {
    return (
      <div className="user-home">
        <h2 className="profile-heading">My Profile</h2>
        <Error />
      </div>
    );
  }

  const profileImage = isEditing
    ? (editableInfo.image instanceof File
      ? URL.createObjectURL(editableInfo.image)
      : editableInfo.image
        ? `https://campustrace-backend.onrender.com${editableInfo.image}?t=${Date.now()}`
        : defaultimage)
    : (userInfo.image
      ? `https://campustrace-backend.onrender.com${userInfo.image}?t=${Date.now()}`
      : defaultimage);

  return (
    <div className="user-home">
      <h2 className="profile-heading">My Profile</h2>
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-pic-wrapper">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-pic"
              onClick={() => setIsZoomed(true)}
              onError={(e) => { e.target.src = defaultimage; }}
            />

            {isEditing && (
              <>
                {/* Upload Button */}
                <label htmlFor="imageUpload" className="edit-image-icon">
                  <FontAwesomeIcon icon={faCamera} />
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {/* Delete Button */}
                {editableInfo.image && (
                  <button
                    className="remove-image-btn"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </>
            )}
          </div>

          <h2 className='user-profile-name'>{userInfo.name}</h2>
          <p className="user-role">{userInfo.role}</p>
        </div>

        <div className="profile-details">
          {isEditing ? (
            <>
              {[
                { icon: faUser, name: 'name', placeholder: 'Name' },
                { icon: faEnvelope, name: 'email', placeholder: 'Email' },
                { icon: faPhone, name: 'phone', placeholder: 'Phone', type: 'tel' },
                { icon: faVenusMars, name: 'gender', select: ['female', 'male', 'other'] },
                { icon: faIdBadge, name: 'studentId', placeholder: 'Student ID' },
                { icon: faGraduationCap, name: 'branch', placeholder: 'Branch' }
              ].map((field, idx) => (
                <div className="input-group" key={idx}>
                  <FontAwesomeIcon icon={field.icon} className="input-icon" />
                  {field.select ? (
                    <select className='selectbox' name={field.name} value={editableInfo[field.name] || ''} onChange={handleChange}>
                      {field.select.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      name={field.name}
                      value={editableInfo[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              <div className="button-row">
                <button onClick={() => setConfirmEdit(true)}>Save <FontAwesomeIcon icon={faSave} /></button>
                <button className="cancel" onClick={() => { setEditableInfo(userInfo); setIsEditing(false); }}>
                  Cancel <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </>
          ) : (
            <>
              <p><strong><FontAwesomeIcon icon={faEnvelope} /> Email:</strong> {userInfo.email}</p>
              <p><strong><FontAwesomeIcon icon={faPhone} /> Phone:</strong> {userInfo.phone}</p>
              <p><strong><FontAwesomeIcon icon={faVenusMars} /> Gender:</strong> {userInfo.gender}</p>
              <p><strong><FontAwesomeIcon icon={faIdBadge} /> Student ID:</strong> {userInfo.studentId}</p>
              <p><strong><FontAwesomeIcon icon={faGraduationCap} /> Branch:</strong> {userInfo.branch}</p>
              <p><strong><FontAwesomeIcon icon={faUserShield} /> Role:</strong> {userInfo.role}</p>
              <p><strong><FontAwesomeIcon icon={faClock} /> Last Login:</strong>
                {userInfo.lastLogin ? new Date(userInfo.lastLogin).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true // 24-hour format
                }) : 'First login'}
              </p>
              <div className="button-row">
                <button onClick={() => setIsEditing(true)}>Edit Profile <FontAwesomeIcon icon={faEdit} /></button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="zoom-overlay" onClick={() => setIsZoomed(false)}>
          <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
            <img
              src={userInfo.image
                ? `https://campustrace-backend.onrender.com${userInfo.image}?t=${Date.now()}`
                : defaultimage}
              alt="Zoomed Profile"
              className="zoomed-image"
              onError={(e) => { e.target.src = defaultimage; }}
            />
            <span className="close-zoom" onClick={() => setIsZoomed(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
          </div>
        </div>
      )}

      {/* Confirm Save Modal */}
      {confirmEdit && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setConfirmEdit(false)}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>Do you want to update the details?</p>
            <div className="confirm-buttons">
              <button className="yes-button" onClick={() => { handleSave(); setConfirmEdit(false); }}>Yes</button>
              <button className="no-button" onClick={() => setConfirmEdit(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Picture Modal */}
      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setConfirmDelete(false)}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>Are you sure you want to remove your profile picture?</p>
            <div className="confirm-buttons">
              <button className="yes-button" onClick={handleRemoveImage}>Yes</button>
              <button className="no-button" onClick={() => setConfirmDelete(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
