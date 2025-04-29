import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';

const FileNameModal = ({ isOpen, onClose, onSave }) => {
  const [fileName, setFileName] = useState('');

  const handleSave = () => {
    if (fileName.trim()) {
      onSave(fileName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md w-80">
        <h3 className="text-lg font-semibold mb-4">Enter File Name</h3>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="border p-2 rounded-md w-full mb-4"
          placeholder="Enter file name"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white p-2 rounded-md flex items-center"
          >
            <FaSave className="mr-2" /> Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white p-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileNameModal;
