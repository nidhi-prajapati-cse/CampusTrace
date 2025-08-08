import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen, faListAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatusCard from "./StatusCard";
import './reportsection.css';
import ItemCardFull from "./ItemCardFull";
import axios from 'axios';
import Loading from './Loading';
import Error from './Error';

const ReportSection = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch items from DB
  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items");
      if (res.data.success) {
        setReports(res.data.items || []);
      } else {
        console.error('Failed to fetch reports:', res.data.message);
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err.message);
      setError(true);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Delete item from DB
  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/items/${id}`);
      if (res.data.success) {
        setReports(prev => prev.filter(report => report._id !== id));
        setMessage('Report deleted successfully!');
      } else {
        setMessage("Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err.message);
      setMessage("Server error while deleting item.");
    }
  };

  //  Compute counts
  const lostCount = reports.filter(item => (item.itemType || '').toLowerCase() === 'lost').length;
  const foundCount = reports.filter(item => (item.itemType || '').toLowerCase() === 'found').length;

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className='reportsection'>
        <h2>All Reported Items</h2>
        <Error />
      </div>
    )
  }

  return (
    <div className='reportsection'>
      <h2>All Reported Items</h2>

      {/*  Status Cards */}
      <div className="status-cards-container">
        <StatusCard
          title="Lost Items"
          count={lostCount}
          icon={<FontAwesomeIcon icon={faSearch} />}
          bgColor="#e67e22"
        />
        <StatusCard
          title="Found Items"
          count={foundCount}
          icon={<FontAwesomeIcon icon={faBoxOpen} />}
          bgColor="#27ae60"
        />
        <StatusCard
          title="Total Items"
          count={reports.length}
          icon={<FontAwesomeIcon icon={faListAlt} />}
          bgColor="grey"
        />
      </div>

      {/*  Item Cards */}
      <div className="items-table-container">
        {reports.length === 0 ? (
          <div className='noreport-text'>
            <h3>No reports found.</h3>
          </div>
        ) : (
          <div className="itemcardfull-grid">
            {reports.map((report) => (
              <ItemCardFull
                key={report._id}
                item={report}
                onDelete={() => handleDelete(report._id)}
                showDelete={true}
              />
            ))}
          </div>
        )}
      </div>
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

export default ReportSection;
