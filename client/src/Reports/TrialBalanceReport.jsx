import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import ReportNavigation from "../Reports/ReportNavigation";
import TrialBalance from "./TrialBalance";

const TrialBalanceReport = () => {
  return (
    <>
      <ReportNavigation />
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Trial Balance Report</h1>
        <TrialBalance />
      </div>
    </>
  );
};

export default TrialBalanceReport;
