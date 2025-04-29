import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import ReportChart from './../Charts/ReportChart';
import ReportNavigation from "../Reports/ReportNavigation";
import EntriesExport from "../Components/EntriesExport";
import PeriodClosing from "../Components/PeriodClosing";
import OtherReportsNavigation from "../Components/OtherReports/OtherReportsNavigation";

const Reports = () => {

  const [page, setPage] = useState(1);

  return (
    <>
      <ReportNavigation />
      <div className="mx-auto p-4 overflow-auto">
        <OtherReportsNavigation />
        <PeriodClosing />
        <EntriesExport />
        <h1 className="text-xl font-bold mb-4">Daily Report Analytics</h1>
        <p className=" text-[0.8em] text-gray-500">
          Report Monitoring
        </p>
        <div className="flex items-center justify-center w-full h-full">
          <ReportChart />
        </div>
      </div>
    </>
  );
};

export default Reports;
