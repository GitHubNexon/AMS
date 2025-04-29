import React from "react";
import Modal from "react-modal";

const PaidDateModal = ({ 
  isOpen, 
  onRequestClose, 
  onSave, 
  paidDate, 
  setPaidDate, 
  invoiceId, // Add invoiceId prop
  dueDate,    // Add dueDate prop
  termsDate   // Add termsDate prop
}) => {
  const handleSave = async () => {
    // Call the onSave function with the necessary parameters
    await onSave(invoiceId, dueDate, termsDate, paidDate); 
    onRequestClose(); // Close the modal after saving
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-4 w-80">
        <h2 className="text-lg font-semibold">Mark Invoice as Paid</h2>
        <div className="mt-2">
          <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700">
            Select Paid Date:
          </label>
          <input
            type="date"
            id="paidDate"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="border border-gray-300 p-1 rounded-md w-full mt-1"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave} // Use handleSave for the click event
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            Confirm
          </button>
          <button
            onClick={onRequestClose}
            className="bg-red-600 text-white px-3 py-1 rounded ml-2 hover:bg-red-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

Modal.setAppElement('#root'); // Ensure to set the app element

export default PaidDateModal;
