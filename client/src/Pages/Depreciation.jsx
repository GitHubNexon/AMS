import React, { useEffect, useState, useRef } from "react";
import DepreciationTable from "../Sub-pages/DepreciationTable";
import DepreciationReport from "../Sub-pages/DepreciationReport";
const Depreciation = () => {
  return (
    <>
      <DepreciationTable />
      <DepreciationReport />
    </>
  );
};

export default Depreciation;
