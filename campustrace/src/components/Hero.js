import { useState, useEffect } from 'react';
import './hero.css';
import LostFoundModal from './LostFoundModal';
import { useAuth } from '../context/AuthContext'; 

const Hero = () => {
  const [modalOpen, setModalOpen] = useState(false); 
  const { user } = useAuth(); 

  useEffect(() => {
    if (!user && modalOpen) {
      setModalOpen(false);
      window.dispatchEvent(new CustomEvent("openLoginModal", { detail: { fromHero: true } }));
    }
  }, [user, modalOpen]);

  const handleReportClick = () => {
    if (!user) {
      
      window.dispatchEvent(new CustomEvent("openLoginModal", { detail: { fromHero: true } }));
    } else {
      
      setModalOpen(true);
    }
  };


  return (
    <>
      <section className="hero">
        <h1>Lost or Found something on campus?</h1>
        <p>CampusTrace helps you find lost items fast and securely.</p>
        <button onClick={handleReportClick} className="cta-btn">
          Report Lost or Found
        </button>
      </section>

      <LostFoundModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        
      />
    </>
  );
};

export default Hero;
