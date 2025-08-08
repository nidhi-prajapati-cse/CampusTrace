import React, { useState, useEffect } from 'react';
import './flaggeditems.css';
import ItemCardFull from './ItemCardFull';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faTrashAlt, faQuestionCircle, faUserCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loading from './Loading';
import Error from './Error';

const FlaggedItems = () => {
  const [flaggedData, setFlaggedData] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [flagToRemove, setFlagToRemove] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch flagged items
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchFlaggedItems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/flags');
        const formatted = res.data.map(flag => ({
          _id: flag._id,
          reason: flag.reason,
          user: flag.flaggedBy?.name || 'Unknown',
          contact: flag.flaggedBy?.email || 'N/A',
          itemId: flag.itemId?._id,
          item: {
            _id: flag.itemId?._id,
            itemName: flag.itemId?.itemName || 'N/A',
            itemType: flag.itemId?.itemType || 'N/A',
            description: flag.itemId?.description || 'N/A',
            location: flag.itemId?.location || 'N/A',
            dateOfReport: flag.itemId?.dateOfReport || flag.itemId?.createdAt || null,
            image: flag.itemId?.image || null,
            userId: flag.itemId?.userId || null,
            userPhone: flag.itemId?.userId?.phone || 'N/A'
          }
        }));

        setFlaggedData(formatted);
      } catch (error) {
        console.error('Error fetching flagged items:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedItems();
  }, []);

  // Delete entire item
  const handleDeleteItem = async (itemId, flagId) => {
    try {
      await axios.delete(`http://localhost:5000/api/items/${itemId}`);
      await axios.delete(`http://localhost:5000/api/flags/${flagId}`);
      setFlaggedData(flaggedData.filter(flag => flag._id !== flagId));
      setMessage('Item deleted ✅');
    } catch (error) {
      console.error('Error deleting item and flag:', error);
      setMessage('Failed to delete item ❌');
    }
  };

  // Delete only flag
  const handleRemoveFlagOnly = async (flagId) => {
    try {
      await axios.delete(`http://localhost:5000/api/flags/${flagId}`);
      setFlaggedData(flaggedData.filter(flag => flag._id !== flagId));
      setMessage('Flag removed ✅');
    } catch (error) {
      console.error('Error removing flag:', error);
      setMessage('Failed to remove flag ❌');
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="flagged-items-container">
        <h2>Flagged Items</h2>
        <Error />
      </div>
    );
  }

  return (
    <div className="flagged-items-container">
      <h2>Flagged Items</h2>

      {flaggedData.length === 0 ? (
        <div className='noreport-text'>
          <h3>No Flagged items are found.</h3>
        </div>
      ) : (
        <div className="itemcardfull-grid">
  {flaggedData.map((flag) => (
    <div key={flag._id} className="flagged-card">
      {/* Item info */}
      <ItemCardFull
        item={flag.item}
        onDelete={() => handleDeleteItem(flag.itemId, flag._id)}
        showDelete={true}
        showFlag={false}
      />

      {/* Flag info box */}
      <div className="flagged-meta-container">
        <div className="flagged-meta">
          <p>
            <strong>
              <FontAwesomeIcon icon={faQuestionCircle} className="reason" /> Reason:
            </strong> {flag.reason}
          </p>
          <p>
            <strong>
              <FontAwesomeIcon icon={faUserCheck} className="personflag" /> Flagged By:
            </strong> {flag.user} 
          </p>
        </div>
        <div className="flagged-btncontainer-wrapper">
          <div className="flagged-btncontainer">
            <button
              className="contactbtn"
              onClick={() => {
                if (flag.contact !== 'N/A') {
                  window.location.href = `mailto:${flag.contact}`;
                }
              }}
            >
              <FontAwesomeIcon icon={faMessage} className="flgbtn" />
            </button>
            <button
              className="flag-button"
              onClick={() => {
                setFlagToRemove(flag._id);
                setIsConfirmOpen(true);
              }}
            >
              <FontAwesomeIcon icon={faTrashAlt} className="flgbtn" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

      )}

      {/* Confirm Delete Flag Modal */}
      {isConfirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setIsConfirmOpen(false)}>
              <FontAwesomeIcon icon={faTimes} className="dark-close" />
            </span>
            <p className="confirm-msg">Do you want to remove this flag ?</p>
            <div className="confirm-buttons">
              <button
                className="yes-button"
                onClick={() => {
                  handleRemoveFlagOnly(flagToRemove);
                  setIsConfirmOpen(false);
                }}
              >
                Yes
              </button>
              <button className="no-button" onClick={() => setIsConfirmOpen(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {message !== "" && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setMessage("")}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>{message}</p>
            <div className="confirm-buttons">
              <button className="no-button" onClick={() => setMessage("")}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlaggedItems;
