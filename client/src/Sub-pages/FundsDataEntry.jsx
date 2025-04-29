import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../utils/toastNotifications";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";
import moment from "moment";
import BudgetShortcut from "../Components/BudgetShortcut";
const FundsDataEntry = () => {
  return (
    <>
      <BudgetShortcut />
      <div className="mx-auto p-4 overflow-auto">
        <h1 className="text-xl font-bold mb-4">Budget Set Up</h1>
        <p className=" text-[0.8em] text-gray-500">
          Budget Data Entry And Monitoring
        </p>
      </div>
    </>
  );
};

export default FundsDataEntry;
