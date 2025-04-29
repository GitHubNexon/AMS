import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// Reusable NotesComponent with Optional Title
const NotesComponent = ({ notes, title = "Notes" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="border-2 border-gray-300 bg-gray-50 p-4 rounded-md shadow-md">
      <button 
        onClick={toggleVisibility} 
        className="flex items-center mb-2 p-2 bg-green-600 text-white rounded"
      >
        <FaChevronDown className={`transition-transform ${isVisible ? 'rotate-180' : ''}`} />
      </button>
      
      {isVisible && (
        <>
          <h3 className="text-[0.8em] font-semibold mb-2">{title}</h3>
          {notes.map((note, index) => (
            <p key={index} className="text-[0.7em] text-start mb-2">
              {note}
            </p>
          ))}
        </>
      )}
    </div>
  );
};

export default NotesComponent;
