import './itemcardfull.css';
import { useState } from 'react';
import noimage from "../assets/noimage.jpg";
import { faTimes, faFlag, faMessage, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FlagModal from "./FlagModal";
import { useAuth } from '../context/AuthContext';
import axios from "axios";
import Loading from './Loading';
import { useChat } from "../context/ChatContext";


const ItemCardFull = ({ item, onDelete, showDelete, showFlag = true }) => {
  const { openChatWithUser } = useChat();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFallbackImage, setIsFallbackImage] = useState(false);
  const [isFlagOpen, setFlagOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const displayName = item.userId?.name;
  const displayContact = item.contact || item.userId?.email || item.userPhone || 'N/A';
  const imageUrl = item.image
    ? `http://localhost:5000/uploads/item/${item.image}`
    : noimage;


  const handleFlagClick = () => {
    if (!user) {

      window.dispatchEvent(new CustomEvent("openLoginModal", { detail: { fromFlag: true } }));
    } else {
      setFlagOpen(true);
    }
  };

  const handleContact = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
      return;
    }

    openChatWithUser(item.userId);

  };


  const handleFlagSubmit = async (reason) => {

    setLoading(true);
    try {
      if (!user) {
        window.dispatchEvent(new CustomEvent("openLoginModal", { detail: { fromFlag: true } }));
        return;
      }

      const payload = {
        itemId: item._id,
        reportedBy: item.userId?._id,
        flaggedBy: user._id,
        reason,
      };

      const res = await axios.post("http://localhost:5000/api/flags", payload);
      if (res.status === 201) {
        setMessage("Item flagged successfully ✅");

      }
    } catch (err) {
      console.error("Error flagging item:", err);
      setMessage("Failed to flag item !");

    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="itemcard-full">
        <div className="image-container" >
          <img
            src={imageUrl}
            alt="item"
            className="item-image-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = noimage;
              setIsFallbackImage(true);
            }}
            onClick={() => {
              if (!isFallbackImage) setIsZoomed(true);
            }}
          />
        </div>
        <div className="item-details">
          <h3>{item.itemName}</h3>
          <p><strong>Category:</strong> {item.itemType}</p>
          <p><strong>Date:</strong>{item.dateOfReport
            ? new Date(item.dateOfReport).toLocaleDateString('en-GB')
            : item.createdAt
              ? new Date(item.createdAt).toLocaleDateString('en-GB')
              : ""}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Description:</strong> {item.description}</p>
          <p>
            <strong>{(item.itemType || '').toLowerCase() === "lost" ? "Lost by" : "Found by"}:</strong> {displayName}
          </p>
        </div>

        <div className="button-container">
          <button className="contact-button" onClick={handleContact}>
            Contact <FontAwesomeIcon icon={faMessage} />
          </button>
          <div className="right-buttons">
            {showFlag && (
              <button className="flag-button" onClick={handleFlagClick}>
                <FontAwesomeIcon icon={faFlag} className="flgbtn" />
              </button>
            )}
            {showDelete && (
              <button className="flag-button" onClick={() => setIsConfirmOpen(true)}>
                <FontAwesomeIcon icon={faTrash} className="flgbtn" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Image */}
      {isZoomed && (
        <div className="zoom-overlay">
          <div className="zoom-content">
            <span className="close-button" onClick={() => setIsZoomed(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </span>
            <img src={imageUrl} alt="zoomed" className="zoomed-image" />
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmOpen && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <span className="confirm close-button" onClick={() => setIsConfirmOpen(false)}>
              <FontAwesomeIcon icon={faTimes} className='dark-close' />
            </span>
            <p className='confirm-msg'>Are you sure you want to delete this item?</p>
            <div className="confirm-buttons">
              <button className="yes-button" onClick={() => { onDelete(); setIsConfirmOpen(false); }}>Yes</button>
              <button className="no-button" onClick={() => setIsConfirmOpen(false)}>No</button>
            </div>
          </div>
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
      {loading && (
        <div className="confirm-overlay">
          <Loading />
        </div>
      )}
      <FlagModal
        isOpen={isFlagOpen}
        onClose={() => setFlagOpen(false)}
        onSubmit={handleFlagSubmit}
      />
    </>
  );
};

export default ItemCardFull;
