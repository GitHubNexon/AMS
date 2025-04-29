import React from "react";

const ImageModal = ({ isOpen, onClose, imageSrc }) => {
  // Close modal handler
  const handleClose = () => {
    onClose(); // Call the passed onClose function
  };

  // Only render the modal if it's open
  if (!isOpen) return null;

  // Check if imageSrc is a Base64 string or requires a prefix
  const formattedImageSrc = imageSrc.startsWith("data:image/")
    ? imageSrc
    : `data:image/png;base64,${imageSrc}`; // Assuming PNG, change if needed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-auto max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          &times; {/* Close button */}
        </button>
        <h2 className="text-xl mb-4">Image Preview</h2>
        {formattedImageSrc && (
          <img
            src={formattedImageSrc}
            alt="Uploaded Preview"
            className="rounded-lg max-w-full max-h-full"
          />
        )}
      </div>
    </div>
  );
};

export default ImageModal;
