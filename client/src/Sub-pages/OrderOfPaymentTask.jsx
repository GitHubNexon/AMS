import React, { useState, useEffect, useRef } from "react";
import { FaStickyNote, FaSync } from "react-icons/fa";
import NotificationApi from "../api/NotificationApi";
import { format } from "timeago.js";
import { showToast } from "../utils/toastNotifications";
import { useNavigate, useLocation } from "react-router-dom";

const OrderOfPaymentTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [orderOfPayments, setOrderOfPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const containerRef = useRef(null);

  const fetchOrderOfPayments = async () => {
    setIsAnimating(true);
    setLoading(true);
    try {
      const result = await NotificationApi.fetchOrderOfPayments(
        "",
        page,
        limit
      );
      setOrderOfPayments(result?.data || []);
      setTotalRecords(result?.totalRecords || 0);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Failed to fetch order of payments:", error);
    } finally {
      setIsAnimating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderOfPayments();
  }, [page]);

  const handleFetch = async () => {
    setIsAnimating(true);
    setLoading(true);

    setTimeout(async () => {
      try {
        await fetchOrderOfPayments();
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setIsAnimating(false);
        setLoading(false);
      }
    }, 2000);
  };

  const handleShowToast = (message) => {
    showToast(message, "info");
  };

  return (
    <div className="bg-gray-200 p-4 rounded text-center shadow-lg overflow-hidden relative transition-all duration-500 flex flex-col items-center justify-center gap-4">
      <FaStickyNote className="text-3xl text-green-600 mb-2" />
      <h1 className="text-xl font-bold">Order of Payment Notifications</h1>

      <button
        onClick={handleFetch}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 active:scale-105 transition-transform duration-300 flex items-center"
      >
        <FaSync className={`mr-2 ${isAnimating ? "animate-spin" : ""}`} />
        {isAnimating ? "Loading..." : "Fetch Latest"}
      </button>

      <div ref={containerRef} className="h-52 overflow-y-scroll w-full mt-4">
        {loading && (
          <div className="border border-gray-300 rounded-lg p-4 bg-white shadow">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {!loading && orderOfPayments.length > 0 && (
          <div className="space-y-4">
            {orderOfPayments.map((order) => (
              <div
                key={order._id}
                className="bg-gray-50 p-4 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col text-left">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {order.client.name} - Order #{order.orderOfPaymentNo}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Time: {format(order.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount:{" "}
                      <span className="text-green-500">{order.amount}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Remarks:{" "}
                      <span className="text-gray-800">{order.remarks}</span>
                    </p>
                  </div>

                  <div className="flex flex-1 items-end text-right"></div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleShowToast(
                        `Viewing Order #${order.orderOfPaymentNo}`
                      );
                      navigate("/OrderOfPayment");
                      // Add additional functions here
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                  >
                    View
                  </button>
                  {/* <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleShowToast(
                        `Ignoring Order #${order.orderOfPaymentNo}`
                      );
                      // Add additional functions here
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    Ignore
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orderOfPayments.length === 0 && (
          <p className="text-gray-600">No orders found.</p>
        )}
      </div>

      <div className="flex justify-between w-full mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={page === Math.ceil(totalRecords / limit)}
          onClick={() =>
            setPage((prev) =>
              Math.min(prev + 1, Math.ceil(totalRecords / limit))
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderOfPaymentTask;
