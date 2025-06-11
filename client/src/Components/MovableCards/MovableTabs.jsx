import React from "react";

const MovableTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4 border-b border-gray-300 mb-4 overflow-x-auto">
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => setActiveTab(idx)}
          className={`py-2 px-4 whitespace-nowrap font-medium ${
            activeTab === idx
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default MovableTabs;
