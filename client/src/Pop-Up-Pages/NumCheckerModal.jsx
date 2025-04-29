import React, { useState, useEffect } from 'react';
import EntriesApi from "../api/EntriesApi";
import { FaFileInvoiceDollar, FaFileInvoice, FaJournalWhills } from 'react-icons/fa';
import { IoIosClose } from "react-icons/io";

const NumCheckerModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('Journal'); 
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsedNumbers = async (entryType) => {
    setLoading(true);
    try {
      const response = await EntriesApi.getAllUsedNumbers(); 
      const filteredNumbers = response.usedNumbers.filter(item => item.type === entryType); 
      setUsedNumbers(filteredNumbers);
    } catch (error) {
      console.error('Failed to fetch used numbers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsedNumbers(activeTab); 
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-center">Existing Number</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoIosClose size={30} /> 
          </button>
        </div>

        <div className="flex justify-between mb-4 border-b">
          <Tab
            icon={<FaJournalWhills />}
            label="JVNo"
            isActive={activeTab === 'Journal'}
            onClick={() => setActiveTab('Journal')}
          />
          <Tab
            icon={<FaFileInvoice />}
            label="CRNo"
            isActive={activeTab === 'Receipt'}
            onClick={() => setActiveTab('Receipt')}
          />
          <Tab
            icon={<FaFileInvoiceDollar />}
            label="DVNo"
            isActive={activeTab === 'Payment'}
            onClick={() => setActiveTab('Payment')}
          />
        </div>

        <div className="h-40 overflow-y-auto p-2 border rounded-md bg-gray-50 text-center">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              {usedNumbers.length > 0 ? (
                <ul>
                  {usedNumbers.map((item, index) => (
                    <li key={index} className="text-[0.8em] font-semibold text-gray-700 ">
                      {item.DVNo || item.CRNo || item.JVNo}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-700 text-[0.9em]'>No used numbers available for this Entry.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Tab = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-t-md 
      ${isActive ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
  >
    {icon}
    <span className="ml-1">{label}</span>
  </button>
);

export default NumCheckerModal;
