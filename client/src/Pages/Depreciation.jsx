import React, { useEffect, useState, useRef } from "react";
import DepreciationTable from "../Sub-pages/DepreciationTable";
import DepreciationReport from "../Sub-pages/DepreciationReport";
import AssetsDepreciationNav from "../Navigation/AssetsDepreciationNav";
const Depreciation = () => {
  return (
    <>
      {/* <DepreciationTable />
      <DepreciationReport /> */}
      <AssetsDepreciationNav />
    </>
  );
};

export default Depreciation;
