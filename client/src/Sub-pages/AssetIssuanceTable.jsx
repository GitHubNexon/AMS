import React, { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaPlus,
  FaArrowRight,
  FaFileExcel,
  FaEye,
  FaFile,
  FaSync,
  FaUndo,
  FaArchive,
  FaChartBar,
  FaTag,
  FaBox,
  FaCalendarAlt,
  FaDollarSign,
  FaFileAlt,
  FaFolder,
  FaTrash,
  FaHistory,
} from "react-icons/fa";
import { FaBookSkull } from "react-icons/fa6";
import { showToast } from "../utils/toastNotifications";
import showDialog from "../utils/showDialog";
import assetIssuanceApi from "../api/assetIssuanceApi";
import AssetsLogic from "../hooks/AssetsLogic";
import AssetIssuanceLogic from "../hooks/AssetIssuanceLogic";
import { numberToCurrencyString, formatReadableDate } from "../helper/helper";

const AssetIssuanceTable = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  const [selectedAssetIssuance, setSelectedAssetIssuance] = useState([]);
  const [isAssetsIssuanceModalOpen, setIsAssetsIssuanceModalOpen] = useState(
    []
  );
  const [modalMode, setModalMode] = useState("add");

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  const {
    fetchIssuanceRecords,
    setIssuanceRecords,
    issuanceRecords,
    totalItems,
    totalPages,
    setAssets,
    loading,
    setLoading,
    setTotalItems,
    setTotalPages,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = AssetIssuanceLogic(page, limit, status);

  function refreshTable() {
    fetchIssuanceRecords();
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    fetchIssuanceRecords();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalOpen = () => {
    setModalMode("add");
    setIsAssetsIssuanceModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAssetsIssuanceModalOpen(false);
    setSelectedAssetIssuance(null);
  };

  /*
  const handleActionButtons = async ({
    id,
    confirmMessage,
    successMessage,
    errorMessage,
    apiMethod,
  }) => {
    try {
      const confirmed = await showDialog.confirm(confirmMessage);
      if (!confirmed) return;

      const result = await apiMethod(id);

      if (result) {
        showDialog.showMessage(successMessage, "success");
        fetchAssets?.();
      }
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      showDialog.showMessage(errorMessage, "error");
    }
  };

  const handleDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to delete this assets?",
      successMessage: "assets deleted successfully",
      errorMessage: "Failed to delete assets",
      apiMethod: assetsApi.deleteAssetsRecord,
    });

  const handleUndoDeleteEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the deletion of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo deletion",
      apiMethod: assetsApi.undoDeleteAssetRecord,
    });

  const handleArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage: "Are you sure you want to archive this assets?",
      successMessage: "assets archive successful",
      errorMessage: "Failed to archive assets",
      apiMethod: assetsApi.archiveAssetsRecord,
    });

  const handleUndoArchiveEntry = (id) =>
    handleActionButtons({
      id,
      confirmMessage:
        "Are you sure you want to undo the archive of this assets?",
      successMessage: "assets restoration successful",
      errorMessage: "Failed to undo archive",
      apiMethod: assetsApi.undoArchiveAssetRecord,
    });
*/

  return <div>AssetIssuanceTable</div>;
};

export default AssetIssuanceTable;
