import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './searchbar.css';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate(); 

  const handleSearch = () => {
    if (searchText.trim() !== '') {
      navigate(`/view-items?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by item or location..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
