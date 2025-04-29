import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import ReportNavigation from "../Reports/ReportNavigation";
// import CustomReport from "../Components/CustomReport";

const ScheduleofAccounts = () => {
  return (
    <>
      <ReportNavigation />
      <div className="mx-auto p-4 overflow-auto">
        <div>
          <h1 className="text-xl font-bold mb-4">Schedule of Accounts</h1>

        </div>
      </div>
    </>
  );
};

export default ScheduleofAccounts;
