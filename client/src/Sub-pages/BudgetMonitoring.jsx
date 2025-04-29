import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import BudgetShortcut from "../Components/BudgetShortcut";
import BudgetTable from "../Pages/BudgetTable";

const BudgetMonitoring = () => {
  return (
    <>
      <BudgetShortcut />
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Budget Monitoring</h1>
        <BudgetTable />
      </div>
    </>
  );
};

export default BudgetMonitoring;
