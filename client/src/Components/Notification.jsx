import React, { useState, useEffect, useRef } from "react";
import { FaStickyNote, FaSync } from "react-icons/fa";
import NotificationApi from "../api/NotificationApi";
import { useAuth } from "../context/AuthContext";
import { format } from "timeago.js";
import { formatReadableDate } from "../helper/helper";

const Notification = ({}) => {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [taskDate] = useState("2024-10-20"); // for testing purposes
  const [taskDate, setTaskDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [entries, setEntries] = useState([]);
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [signatoryType, setSignatoryType] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to fetch all entries without time filtering
  const fetchEntries = async () => {
    setIsAnimating(true);
    setLoading(true);
    try {
      const result = await NotificationApi.fetchEntriesByUser(
        name,
        signatoryType,
        taskDate,
        page,
        limit
      );
      setEntries(result.entries || []);
      setTotalEntries(result.totalEntries || 0);

      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsAnimating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setName(user.name);
    fetchEntries();
  }, [user, page, limit, taskDate]);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute top-16 right-4 bg-white text-black px-6 pb-6 border rounded-xl shadow-lg z-50 max-h-[400px] overflow-y-auto max-w-[500px] max-sm:right-0 max-sm:left-2"
      >
        <div className="bg-white shadow-md pb-5 mb-2 sticky top-0 rounded-xl ">
          <h2 className="text-green-600 text-center sm:text-lg mb-2">
            🔔 Notifications as of {currentTime.toLocaleTimeString()}
          </h2>
          {loading && (
            <div className="flex justify-center items-center">
              <FaSync className="animate-spin text-gray-500" />
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="text-center text-gray-500">
              No notifications are available.
            </div>
          )}

          <div className="flex item-center justify-center">
            <p className="text-[0.8em] text-gray-600 font-semibold">
              {totalEntries > 0 ? `Total: ${totalEntries}` : "No Entries Found"}
            </p>
          </div>

          {/* Pagination info */}
          <div className="flex justify-center mt-4 space-x-4 flex-col items-center">
            <p className="text-sm">
              Page {page} of {Math.ceil(totalEntries / limit)} | {""}
              {limit}
            </p>
            <p className="text-sm">
              Total entries for this page:{" "}
              {page < Math.ceil(totalEntries / limit)
                ? limit
                : totalEntries % limit || limit}
            </p>
          </div>

          {totalEntries > limit && (
            <div className="flex justify-center mt-4 space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600"
                disabled={page === Math.ceil(totalEntries / limit)}
                onClick={() =>
                  setPage((prev) =>
                    Math.min(prev + 1, Math.ceil(totalEntries / limit))
                  )
                }
              >
                Next
              </button>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <div className="space-y-6 mt-3">
            {" "}
            {entries.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition duration-300 ease-in-out"
              >
                <div className="font-medium text-sm mb-2">
                  New Entry For{" "}
                  <span className="text-green-500 font-bold">
                    {entry.EntryType}
                  </span>
                </div>

                <div className="font-semibold text-sm">
                  Description:{" "}
                  <span className="text-green-500 font-bold">
                    {entry.Particulars}
                  </span>
                </div>

                <div className="mt-4 text-sm text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {entry.JVNo
                        ? "JVNo:"
                        : entry.CRNo
                        ? "CRNo:"
                        : entry.DVNo
                        ? "DVNo:"
                        : "No:"}
                    </span>
                    <span>
                      {entry.JVNo ||
                        entry.CRNo ||
                        entry.DVNo ||
                        "No details available"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">
                      {entry.JVDate
                        ? "JVDate:"
                        : entry.CRDate
                        ? "CRDate:"
                        : entry.DVDate
                        ? "DVDate:"
                        : "Date:"}
                    </span>
                    <span>
                      {formatReadableDate(
                        entry.JVDate ||
                          entry.CRDate ||
                          entry.DVDate ||
                          "No date available"
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Time:</span>
                    <span>
                      {format(entry.createdAt || "No time available")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Notification;
