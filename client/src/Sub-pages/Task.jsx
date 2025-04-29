import React, { useState, useEffect, useRef } from "react";
import TaskNotification from "../hooks/TaskNotification";
import { FaStickyNote, FaSync } from "react-icons/fa";
import NotificationApi from "../api/NotificationApi";
import { useAuth } from "../context/AuthContext";
import { format } from "timeago.js";
import { formatReadableDate } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";

const Task = () => {
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
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

  const handleGoClick = () => {
    showToast("TEST", "success");
  };

  const handleIgnoreClick = () => {
    showToast("TEST", "success");
  };

  const handleSignatoryTypeChange = (e) => {
    setSignatoryType(e.target.value);
  };

  const signatoryTypes = [
    "CreatedBy",
    "PreparedBy",
    "ReviewedBy",
    "CertifiedBy",
    "ApprovedBy1",
    "ApprovedBy2",
  ];

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

  const handleFetch = async () => {
    setIsAnimating(true);
    setLoading(true);

    setTimeout(async () => {
      try {
        await fetchEntries();
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setIsAnimating(false);
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="bg-gray-200 p-4 rounded text-center shadow-2xl cursor-pointer overflow-hidden relative transition-all duration-500 hover:translate-y-2 flex flex-col items-center justify-center gap-2 before:absolute before:w-full hover:before:top-0 before:duration-500 before:-top-1 before:h-1 before:bg-green-400">
      <FaStickyNote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-green-600 mb-2" />
      <h1 className="text-2xl font-bold mb-4">Task Notifications</h1>

      <button
        onClick={handleFetch}
        className="bg-blue-500 text-white px-4 py-2 rounded self-end md:self-auto hover:bg-green-600 active:scale-110 transition-transform duration-300 relative w-full flex item-center justify-center mt-4"
      >
        <FaSync size={28} className={`mr-2 ${isAnimating ? "spin" : ""}`} />
        {isAnimating ? "Loading..." : "Get Latest Tasks"}
      </button>

      {/* Show loading animation */}
      {isAnimating && (
        <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow w-full">
          <div className="space-y-4">
            <div className="h-6 bg-gray-300 animate-pulse text-opacity-0 w-32"></div>
            <div className="h-4 bg-gray-300 animate-pulse text-opacity-0 w-3/4"></div>
            <div className="h-4 bg-gray-300 animate-pulse text-opacity-0 w-1/2"></div>
            <div className="h-4 bg-gray-300 animate-pulse text-opacity-0 w-1/3"></div>
            <div className="h-4 bg-gray-300 animate-pulse text-opacity-0 w-1/4"></div>

            <div className="flex space-x-2">
              <div className="h-8 bg-gray-300 animate-pulse text-opacity-0 w-24"></div>
              <div className="h-8 bg-gray-300 animate-pulse text-opacity-0 w-24"></div>
            </div>
          </div>
        </div>
      )}

      {/* Show tasks if not animating */}
      {!isAnimating && (
        <>
          <select
            className="border border-gray-300 p-2 rounded-md"
            value={signatoryType}
            onChange={handleSignatoryTypeChange}
          >
            <option value="">Select Signatory Type</option>
            {signatoryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex item-center">
            <p className="text-[0.8em]">
              {totalEntries > 0
                ? `Total Entries: ${totalEntries}`
                : "No Entries Found"}
            </p>
          </div>

          <div ref={containerRef} className="h-52 overflow-y-scroll w-full">
            {entries.length > 0 && (
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition duration-300 ease-in-out"
                  >
                    <div className="flex flex-col text-left">
                      <div className="font-medium text-sm">
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
                    <div className="flex space-x-2">
                      <button
                        onClick={handleGoClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                      >
                        Go
                      </button>
                      <button
                        onClick={handleIgnoreClick}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination info */}
          <div className="flex justify-center mt-4 space-x-4 flex-col">
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

          {/* Pagination controls */}
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
        </>
      )}
    </div>
  );
};

export default Task;
