import React from 'react';
import './FallingPetals.css';

const FallingPetals = () => {
  // Tạo mảng 20 cánh hoa với các vị trí và độ trễ ngẫu nhiên
  const petals = Array.from({ length: 20 });

  return (
    <div className="petals-container">
      {petals.map((_, i) => (
        <div 
          key={i} 
          className="petal" 
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

export default FallingPetals;