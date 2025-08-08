import './lostfoundmodal.css';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen, faTags, faClipboard,
  faCalendarDays, faMapMarkerAlt, faPhone, faImage, faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Loading from './Loading';

const LostFoundModal = ({ isOpen, onClose, onSubmit }) => {
  const [itemType, setItemType] = useState("");
  const imageRef = useRef(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (itemType !== "found" && imageRef.current) {
      imageRef.current.setCustomValidity("");
    }
  }, [itemType]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const imageFile = imageRef.current?.files[0];


    if (itemType === "found" && !imageFile) {
      imageRef.current.setCustomValidity("Please upload an image for found items.");
    } else {
      imageRef.current.setCustomValidity("");
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setLoading(false);
      return;
    }


    const formData = new FormData(form);


    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user._id) {
      formData.append("userId", user._id);

    }

    try {
      const res = await axios.post("https://campustrace-backend.onrender.com/api/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setMessage("Item reported successfully! ✅");
        onSubmit && onSubmit(res.data.item);
        form.reset();
        setItemType("");
      } else {
        setMessage(res.data.message || "Failed to report item !");

      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error while reporting item.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reportmodal-overlay">
      <div className="reportmodal-container">
        <h2>Report 📢 Lost / Found Item</h2>
        <form onSubmit={handleSubmit} className="reportmodal-form" encType="multipart/form-data">

          {/* Item Name & Type */}
          <div className="form-row">
            <div className='reportfield'>
              <FontAwesomeIcon icon={faBoxOpen} className="input-iconmodal box" />
              <input type="text" name="itemName" placeholder="Item Name" required />
            </div>
            <div className='reportfield'>
              <FontAwesomeIcon icon={faTags} className="input-iconmodal lostfound" />
              <select
                name="itemType"
                required
                value={itemType}
                onChange={(e) => setItemType(e.target.value.toLowerCase())}
              >
                <option value="">Select Type</option>
                <option value="lost">Lost 🔍</option>
                <option value="found">Found 📦</option>
              </select>
            </div>
          </div>


          <div className="form-row">
            <div className='reportfield'>
              <FontAwesomeIcon icon={faMapMarkerAlt} className="input-iconmodal loc" />
              <input type="text" name="location" placeholder="Location" required />
            </div>
            <div className='reportfield'>
              <FontAwesomeIcon icon={faClipboard} className="input-iconmodal desc" />
              <textarea name="description" placeholder="Description" rows="3" required />
            </div>
          </div>


          <div className='reportfield'>
            <FontAwesomeIcon icon={faCalendarDays} className="input-iconmodal cal" />
            <input type="date" name="dateOfReport" required />
          </div>

          <div className='reportfield'>
            <FontAwesomeIcon icon={faImage} className="input-iconmodal image" />
            <input
              type="file"
              name="image"
              accept="image/*"
              ref={imageRef}
            />
          </div>

          <div className="reportmodal-buttons">
            <button type="submit" className="submit-btn">Submit</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
      {message != "" && <div className="confirm-overlay">
        <div className="confirm-modal">
          <span className="confirm close-button" onClick={() => {
            setMessage("")
            onClose()
          }}>
            <FontAwesomeIcon icon={faTimes} className='dark-close' />
          </span>
          <p className='confirm-msg'>{message}</p>
          <div className="confirm-buttons">
            <button className="no-button" onClick={() => {
              setMessage("")
              onClose()
            }}>OK</button>
          </div>
        </div>
      </div>}
      {loading && (
        <div className="confirm-overlay">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default LostFoundModal;
