import './flagmodal.css';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const FlagModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <div className="flag-modal-overlay">
      <div className="flag-modal">
        <button className="close-button" onClick={onClose}><FontAwesomeIcon icon={faTimes} className="clsbtn"/></button>
        <h2>Flag this item</h2>
        <p>Please select a reason for flagging:</p>
        
        <select id="flagReason" className="dropdown">
          <option value="">-- Select a reason --</option>
          <option value="Spam">Spam or advertisement</option>
          <option value="Incorrect Info">Incorrect information</option>
          <option value="Inappropriate Content">Inappropriate content</option>
          <option value="Duplicate">Duplicate report</option>
        </select>

        <button className="submit-button" onClick={() => {
          const reason = document.getElementById("flagReason").value;
          if (reason) {
            onSubmit(reason);
            onClose();
          }
        }}>Submit</button>
      </div>
    </div>
  );
};

export default FlagModal;
