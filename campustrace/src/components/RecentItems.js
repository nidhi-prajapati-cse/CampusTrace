import React, { useRef, useEffect, useState } from 'react';
import ItemCard from './ItemCard';
import './recentitems.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';

const RecentItems = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const res = await axios.get('https://campustrace-backend.onrender.com/api/items?limit=6&sort=desc');
        const formattedItems = Array.isArray(res.data) ? res.data : res.data.items || [];
        setRecentItems(formattedItems);
      } catch (err) {
        console.error('Error fetching recent items:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentItems();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    navigate('/view-items');
  };

  return (
    <section className="recent-items">
      <h2>Recently Found Items</h2>

      {loading ? (
        <Loading />
      ) : recentItems.length === 0 ? (
        <p className="no-msg">No recent items found.</p>
      ) : (
        <div className="carousel-wrapper">
          <button className="scroll-btn left" onClick={() => scroll('left')}>&lt;</button>
          <div className={`items-scroll-container ${
    recentItems.length <= 3 ? 'scroll-center-items' : 'scroll-start-items'
  }`} ref={scrollRef}>
            {recentItems.map(item => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          <button className="scroll-btn right" onClick={() => scroll('right')}>&gt;</button>
        </div>
      )}

      <div>
        <button className="view-all-btn" onClick={handleViewAll}>View All Reports</button>
      </div>
    </section>
  );
};

export default RecentItems;
