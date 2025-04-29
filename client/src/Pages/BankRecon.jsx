import React, { useEffect, useState, useRef } from "react";
import BankReconTable from "../Sub-pages/BankReconTable";
import Transaction from "../Sub-pages/Transaction";
const BankRecon = () => {
  return (
    <>
      <BankReconTable />
      {/* <Transaction
        startDate="2024-11-01"
        endDate="2024-11-30"
        SLCODE="9488"
        ACCTCODE="10102020"
      /> */}
    </>
  );
};

export default BankRecon;
