import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import BudgetChart from "../Charts/BudgetChart";
import BudgetShortcut from "../Components/BudgetShortcut";

const BudgetAnalytics = () => {
  return (
    <>
      <BudgetShortcut />
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Budget Monitoring</h1>
        <p className=" text-[0.8em] text-gray-500">
          Budget Monitoring Analytics
        </p>
        <div className="flex items-center justify-center w-full h-full">
          <BudgetChart />
        </div>
      </div>
    </>
  );
};

export default BudgetAnalytics;
