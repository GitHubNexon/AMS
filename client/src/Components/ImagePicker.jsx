import React, { useState } from "react";
import { FaImage, FaTimes } from "react-icons/fa";
import { useRef } from "react";

const ImagePicker = ({ image, setImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);

  // Function to handle image change (convert image to base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to handle zoom with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prevZoom) => Math.min(prevZoom + 0.1, 3)); // Max zoom at 3x
    } else {
      setZoom((prevZoom) => Math.max(prevZoom - 0.1, 1)); // Min zoom at 1x
    }
  };

  // Close modal when clicking outside the modal content
  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-4 max-w-sm w-full">
      {/* Image Upload Section */}
      <div className="flex items-center justify-between w-full">
        <label
          htmlFor="imageInput"
          className="cursor-pointer bg-gray-200 hover:bg-gray-300 p-2 rounded-md text-gray-500 flex items-center space-x-2 w-full"
        >
          <FaImage size={20} />
          <span className="text-sm">Click to upload image</span>
        </label>
        <input
          type="file"
          id="imageInput"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Image Preview Section */}
      {image && (
        <div className="flex flex-col items-center mt-4 relative">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-2">
            <img
              src={image}
              alt="Selected"
              className="w-full h-full object-cover rounded-md cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            />
            <button
              onClick={() => setImage(null)}
              className="absolute top-0 right-0 bg-gray-500 text-white p-1 rounded-full"
            >
              <FaTimes size={12} />
            </button>
          </div>
          <p className="text-xs text-gray-500">Click image to zoom</p>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
          onWheel={handleWheel}
          onClick={handleModalClose}
        >
          <div className="bg-white p-4 rounded-lg w-full max-w-sm sm:max-w-lg relative">
            <div className="flex justify-center items-center mb-4">
              <img
                src={image}
                alt="Zoomed Image"
                className="max-w-full max-h-[80vh] object-contain"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
