import './loading.css';
import loadingGif from '../assets/loading.gif'; 

const Loading = () => {
  return (
    <div className="loading-container">
      <img src={loadingGif} alt="Loading..." className="loading-gif" />
      <p className="loading-text">Loading, please wait...</p>
    </div>
  );
};

export default Loading;
