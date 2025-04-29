import React, { useState, useEffect } from "react";
import EmailModalViewer from "../Pop-Up-Pages/EmailModalViewer"; // Import the EmailModalViewer component
import { sendEmail, fetchEmailConfig } from "../api/emailApi"; // Import the EmailApi
import { FaTimes } from "react-icons/fa";
import { showToast } from "../utils/toastNotifications";

const EmailModal = ({
  isOpen,
  onClose,
  defaultFrom = "",
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  title = "Send Email",
}) => {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState([]); // State for attachments
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await fetchEmailConfig(); // Use Axios to fetch email config
        setFrom(data.from); // Set the 'from' address from the server response
      } catch (error) {
        console.error("Error fetching email configuration:", error);
      }
    };

    fetchConfig();
  }, []); // Run only once when component mounts

  useEffect(() => {
    // Update the form fields if the defaults change
    setFrom(defaultFrom);
    setTo(defaultTo);
    setSubject(defaultSubject);
    setBody(defaultBody);
  }, [defaultFrom, defaultTo, defaultSubject, defaultBody]);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to an array
    const newAttachments = files.map((file) => ({
      originalname: file.name, // Original name of the file
      filename: file.name, // Use the same name for saved filename (or generate a unique name if needed)
      contentType: file.type, // MIME type of the file
      content: file, // Keep the File object for later processing
    }));

    // Update the state with the objects that include originalname, filename, path, and contentType
    setAttachments(newAttachments); // Save the objects for upload
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Reset error message

    // Create a FormData object to handle file uploads
    const formData = new FormData();
    formData.append("from", from);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", body);

    // Append attachments if any
    attachments.forEach((attachment) => {
      formData.append("attachments", attachment.content);
      formData.append("originalname[]", attachment.originalname);
      formData.append("filename[]", attachment.filename);
      formData.append("contentType[]", attachment.contentType);
    });

    try {
      // Use the sendEmail function from the Email API
      const response = await sendEmail(formData); // Pass the FormData instead
      if (response.success) {
        showToast("Email sent successfully!", "success");

        onClose(); // Close the modal on success
      } else {
        setErrorMessage(response.message || "Failed to send email.");
        showToast("Failed to send email!", "error");
      }
    } catch (error) {
      setErrorMessage("Failed to send email: " + error.message);
      showToast("Failed to send email!", "error");
    } finally {
      setIsLoading(false); // Reset loading state
      // Clear the form fields
      setFrom("");
      setTo("");
      setSubject("");
      setBody("");
      setAttachments([]); // Reset attachments
    }
  };

  if (!isOpen) return null; // Do not render if modal is not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full h-auto max-h-[90vh] overflow-y-auto text-[0.7rem] flex flex-row space-x-5">
        {/* Email Modal Viewer Component */}
        <div className="max-w-2xl w-full p-2">
          {" "}
          {/* Adjust width as needed */}
          <EmailModalViewer from={from} to={to} subject={subject} body={body} />
        </div>

        <div className="max-w-2xl w-full p-2">
          {/* Adjust width as needed */}
          <button
            onClick={onClose}
            className="text-gray-500 float-right no-print"
          >
            <FaTimes size={20} /> {/* Close icon */}
          </button>
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <form onSubmit={handleEmailSubmit} encType="multipart/form-data">
            <div className="mb-4">
              <label
                htmlFor="from"
                className="block text-sm font-medium text-gray-700"
              >
                From:
              </label>
              <input
                type="email"
                id="from"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                readOnly // Make the input read-only
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="to"
                className="block text-sm font-medium text-gray-700"
              >
                To:
              </label>
              <input
                type="email"
                id="to"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject:
              </label>
              <input
                type="text"
                id="subject"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700"
              >
                Body:
              </label>
              <textarea
                id="body"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="attachments"
                className="block text-sm font-medium text-gray-700"
              >
                Attachments (optional):
              </label>
              <input
                type="file"
                id="attachments"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                onChange={handleAttachmentChange} // Handle file selection
              />
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <button
              type="submit"
              onClick={async () => {
                // Show confirmation dialog before sending the email
                const confirmed = await showDialog.confirm(
                  "Are you sure you want to send this email?"
                );

                if (confirmed) {
                  handleSubmit(); // Call the handleSubmit function if confirmed
                }
              }}
              className={`w-full ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold py-2 px-4 rounded-md transition duration-200`}
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? "Sending..." : "Send Email"}
            </button>
          </form>
          <button
            onClick={onClose}
            className="mt-4 text-blue-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
