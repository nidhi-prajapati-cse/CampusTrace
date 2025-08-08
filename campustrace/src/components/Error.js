import './loading.css';
import errorGif from '../assets/error.gif'; 

const Error = () => {
  return (
    <div className="loading-container">
      <img src={errorGif} alt="Error..." className="loading-gif" />
      <p className="loading-text">Unable to connect to the server. Please try again later.</p>
    </div>
  );
};

export default Error;
