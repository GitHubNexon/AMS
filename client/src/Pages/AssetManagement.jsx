import React, { useState, useEffect } from "react";
import AssetsTable from "../Sub-pages/AssetsTable";
import EmployeeAssetsTable from "../Sub-pages/EmployeeAssetsTable";

const AssetManagement = () => {
  return (
    <div>
      <AssetsTable />
      <EmployeeAssetsTable />
    </div>
  );
};

export default AssetManagement;
