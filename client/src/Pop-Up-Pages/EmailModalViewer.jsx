import React from "react";

const EmailModalViewer = ({ from, to, subject, body }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full h-auto max-h-[90vh] overflow-y-auto text-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Preview</h2>
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700">
          <span className="font-semibold">From:</span> {from}
        </div>
        <div className="text-sm font-medium text-gray-700">
          <span className="font-semibold">To:</span> {to}
        </div>
        <div className="text-sm font-medium text-gray-700">
          <span className="font-semibold">Subject:</span> {subject}
        </div>
      </div>
      <div className="mb-6 border rounded-lg p-4 bg-gray-50">
        <div className="text-gray-800 whitespace-pre-wrap">{body}</div>
      </div>
      <footer className="mt-6 border-t pt-4 text-sm text-gray-600">
        <p>
          If you receive an email that seems fraudulent, please verify with the
          sender before taking any action.
        </p>
      </footer>
    </div>
  );
};

export default EmailModalViewer;
