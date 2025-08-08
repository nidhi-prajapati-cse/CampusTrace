import Header from '../components/Header';
import ItemCardFull from '../components/ItemCardFull';
import './viewitems.css';
import { useState, useEffect } from 'react';
import Footer from "../components/Footer";
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';
import Error from '../components/Error';

const ViewItems = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const searchFromURL = query.get('search') || '';
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const loggedInUserId = parsedUser?._id;
        const res = await axios.get("https://campustrace-backend.onrender.com/api/items");
        let allItems = Array.isArray(res.data) ? res.data : res.data.items || [];
        const filteredItems = allItems.filter(item => {
          const itemUserId = item.userId?._id || item.userId;
          return String(itemUserId) !== loggedInUserId;
        });
        
        setItems(filteredItems);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(true);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);



  const filteredItems = items.filter(item => {
    const category = (item.itemType || '').toLowerCase();
    const location = (item.location || '').toLowerCase();
    const name = (item.itemName || '').toLowerCase();

    const itemDate = item.dateOfReport
      ? new Date(item.dateOfReport).toISOString().split('T')[0]
      : item.createdAt
        ? new Date(item.createdAt).toISOString().split('T')[0]
        : '';

    const matchesType = filter === 'all' || category === filter.toLowerCase();
    const matchesDate = !selectedDate || itemDate === selectedDate;
    const matchesLocation = !selectedLocation || location === selectedLocation.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      name.includes(searchQuery.toLowerCase()) ||
      location.includes(searchQuery.toLowerCase());

    return matchesType && matchesLocation && matchesDate && matchesSearch;
  });

  const handleClear = () => {
    setSelectedDate('');
    setFilter('all');
    setSelectedLocation('');
    setSearchQuery('');
  };
  if (loading) {
    return (
      <>
        <Header />
        <div className='view-items-container'>
          <div className="loading-wrapper">
            <Loading />
          </div>
        </div>
        <Footer />
      </>
    );
  }
  if (error) {
    return (
      <>
        <Header />
        <div className='view-items-container'>
          <div className="loading-wrapper">
            <Error />
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="view-items-container">
        <div className="filters">
          <button className='allbutton' onClick={() => setFilter('all')}>All 📋</button>
          <button className='lostbutton' onClick={() => setFilter('lost')}>Lost 🚫</button>
          <button className='foundbutton' onClick={() => setFilter('found')}>Found 🎁</button>

          <select
            className="locationbutton"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations 📍</option>
            <option value="Library">Library</option>
            <option value="Canteen">Canteen</option>
            <option value="Cafeteria">Cafeteria</option>
            <option value="Playground">Playground</option>
            <option value="Hostel">Hostel</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Sports Complex">Sports Complex</option>
            <option value="Parking Lot">Parking Lot</option>
            <option value="Classroom Block">Classroom Block</option>
            <option value="Labs">Labs</option>
          </select>

          <input
            type="text"
            placeholder="Search by item name 🔍"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="view-item-searchbox"
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='date-filter'
          />

          <button className='clearbutton' onClick={handleClear}>Clear 🧹</button>
        </div>
        <div className="itemcardfull-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCardFull
                key={item._id}
                item={item}
                showFlag={true}
              />
            ))
          ) : (
            <h2 className="no-items-message">No reports found.</h2>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ViewItems;
