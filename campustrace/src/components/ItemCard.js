import './itemcard.css';
import { useState } from 'react';
import noimage from "../assets/noimage.jpg";

const ItemCard = ({ item }) => {
  const imageUrl = item.image
    ? `http://localhost:5000/uploads/item/${item.image}`
    : noimage;
  return (
    <div className='item-card'>
      <img
        src={imageUrl}
        alt="item"
        className="item-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = noimage;
          
        }}
        
      />
      <div className='detail-container'>
        <div className='itemcard-details'>
        <h3 className="itemtext-title">{item.itemName}</h3>
        <p className="item-location"><strong>Location:</strong>{item.location}</p>
        <p className="item-date"><strong>Date:</strong>{item.dateOfReport
            ? new Date(item.dateOfReport).toISOString().split("T")[0]
            : item.createdAt
              ? new Date(item.createdAt).toISOString().split("T")[0]
              : ""}</p>
        <p className='item-description'><strong>Description:</strong>{item.description}</p>
      </div>
      </div>
      

    </div>
  );
};

export default ItemCard;
