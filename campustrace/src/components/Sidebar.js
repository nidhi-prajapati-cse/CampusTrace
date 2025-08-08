// src/components/Sidebar.js
import "./sidebar.css"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Sidebar = ({ isOpen, items ,onSelect}) => {
  
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <ul>
        {items.map((item, index) => (
          <li key={index}  onClick={() => onSelect(item.key)}>
            {<FontAwesomeIcon icon={item.icon} className="sidebar-icons"/>} {item.label} 
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
