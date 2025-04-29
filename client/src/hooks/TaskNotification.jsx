import React from "react";
import { format } from "timeago.js";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import { showToast } from "../utils/toastNotifications";

const TaskNotification = ({ status, title, description, date, time }) => {
  const handleGoClick = () => {
    showToast("TEST", "success");
  };

  const handleIgnoreClick = () => {
    showToast("TEST", "success");
  };

  return (
    <li className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow">
      <h2 className="text-xl font-semibold text-blue-600 text-start">
        {status}
      </h2>
      <h1 className="text-[.9rem] font-bold text-start mb-4">{title}</h1>
      <p className="text-gray-700 mb-4 text-[.9rem] text-start text-wrap">{`No: ${description}`}</p>
      <p className="text-[.9rem] font-bold text-start">
        {formatReadableDate(date)}
      </p>

      <p className="text-[.9rem] font-bold text-start">{format(time)}</p>
    </li>
  );
};

export default TaskNotification;
