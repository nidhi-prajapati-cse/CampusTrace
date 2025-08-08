import './statuscard.css'; 

const StatusCard = ({ title, count, icon, bgColor }) => {
  return (
    <div className="status-card" style={{ backgroundColor: bgColor }}>
      
      <div className="status-info">
        <h4 className="status-title">{title}</h4>
        <p className="status-count">{count}</p>
      </div>
      <div className="status-icon">{icon}</div>
    </div>
  );
};

export default StatusCard;
