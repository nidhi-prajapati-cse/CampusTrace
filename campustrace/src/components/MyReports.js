import React, { useState, useEffect, useContext } from 'react';
import ItemCardFull from './ItemCardFull';
import './myreports.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Loading from './Loading';
import Error from './Error';

const MyReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      if (!user || !user._id) return;
      try {
        const res = await axios.get(`https://campustrace-backend.onrender.com/api/items/user/${user._id}`);
        if (res.data.success) {
          setReports(res.data.reports || []);
        } else {
          console.error('Failed to fetch reports:', res.data.message);
          setReports([]);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(true);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    window.scrollTo(0, 0);
  }, [user]);

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`https://campustrace-backend.onrender.com/api/items/${id}`);
      if (res.data.success) {
        setReports((prev) => prev.filter((report) => report._id !== id));
        setMessage('Report deleted successfully!');
      } else {
        setMessage('Failed to delete report');
      }
    } catch (err) {
      console.error('Error deleting report:', err);
      setMessage('Server error while deleting report.');
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="my-reports">
        <h2>My Reports</h2>
        <Error />
      </div>
    );
  }

  return (
    <div className="my-reports">
      <h2>My Reports</h2>

      {reports.length === 0 ? (
        <div className='noreport-text'>
          <h3>You haven't reported any items yet.</h3>
        </div>
      ) : (
        <div className="itemcardfull-grid">
          {reports.map((report) => (
            <ItemCardFull
              key={report._id}
              item={report}
              onDelete={() => handleDelete(report._id)}
              showDelete={true}
              showFlag={false}
            />
          ))}
        </div>
      )}
      {message != "" && <div className="confirm-overlay">
        <div className="confirm-modal">
          <span className="confirm close-button" onClick={() => setMessage("")}>
            <FontAwesomeIcon icon={faTimes} className='dark-close' />
          </span>
          <p className='confirm-msg'>{message}</p>
          <div className="confirm-buttons">
            <button className="no-button" onClick={() => setMessage("")}>OK</button>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default MyReports;
