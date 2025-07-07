import React, { useState, useEffect } from "react";

const AssetsCategoryPicker = ({ value, onChange, required = false }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const predefinedCategories = [
    "IT Hardware",
    "Medical Equipment",
    "Laboratory Equipment",
    "Security Systems",
    "Kitchen Equipment",
    "Audio Visual",
    "Manufacturing Tools",
    "HVAC Systems",
    "Office Equipment",
    "Automotive",
    "Furniture",
    "Cleaning Equipment",
    "Sports Equipment",
    "Electrical Equipment",
    "Plumbing Equipment",
    "Gardening Equipment",
    "Fire Safety Equipment",
    "Event Equipment",
    "Others",
  ];

  // Initialize component with existing value
  useEffect(() => {
    if (value) {
      if (predefinedCategories.includes(value)) {
        setSelectedCategory(value);
        setShowCustomInput(false);
      } else {
        setSelectedCategory("Others");
        setCustomCategory(value);
        setShowCustomInput(true);
      }
    }
  }, [value]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    if (category === "Others") {
      setShowCustomInput(true);
      // Keep existing custom value if any
      onChange(customCategory);
    } else {
      setShowCustomInput(false);
      setCustomCategory("");
      onChange(category);
    }
  };

  const handleCustomCategoryChange = (e) => {
    const customValue = e.target.value;
    setCustomCategory(customValue);
    onChange(customValue);
  };

  return (
    <div className="flex flex-col">
      <label htmlFor="category" className="text-gray-700">
        Category {required}
      </label>

      <select
        id="category"
        value={selectedCategory}
        onChange={handleCategoryChange}
        required={required}
        className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500 mb-2"
      >
        <option value="">Select a category...</option>
        {predefinedCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {showCustomInput && (
        <input
          type="text"
          placeholder="Enter custom category"
          value={customCategory}
          onChange={handleCustomCategoryChange}
          required={required && selectedCategory === "Others"}
          className="border border-gray-300 p-2 rounded-md bg-gray-100 text-gray-500"
        />
      )}
    </div>
  );
};

export default AssetsCategoryPicker;
