import React, { useState, useEffect } from "react";
import AssetsTable from "../Sub-pages/AssetsTable";
import EmployeeAssetsTable from "../Sub-pages/EmployeeAssetsTable";
import AssetsNav from "../Navigation/AssetsNav";

const AssetManagement = () => {
  return (
    <div>
      {/* <AssetsTable />
      <EmployeeAssetsTable /> */}
      <AssetsNav />
    </div>
  );
};

export default AssetManagement;
