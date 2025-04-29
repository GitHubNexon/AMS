import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaUnlock,
  FaPlus,
  FaSearch,
  FaFileExcel,
} from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { AiFillLock } from "react-icons/ai"; // Import icons
import UserModal from "../Pop-Up-Pages/UserModal";
import FileNameModal from "../Pop-Up-Pages/FileNameModal";
import { showToast } from "../utils/toastNotifications";
import * as XLSX from "xlsx"; // Import the xlsx library
import {
  formatMMMDDYYYY,
  formatReadableDate,
  numberToCurrencyString,
} from "../helper/helper";
import DefaultImg from "../assets/images/default-profile.png";

const Users = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [refreshTable, setRefreshTable] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
  const [fileName, setFileName] = useState("users");

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search, refreshTable]);

  function refresh() {
    setRefreshTable(!refreshTable);
  }

  const [query, setQuery] = useState("");
  const handleSearch = (searchQuery) => {
    setSearch(searchQuery);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/user", {
        params: { page, limit, keyword: search },
        withCredentials: true,
      });
      setUsers(response.data.users);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpenForAdd = () => {
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleModalOpenForEdit = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    setLoading(true);
    try {
      await axios.delete(`/user/${userId}`, { withCredentials: true });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      showToast("User deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Error deleting user. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (userId, updatedData) => {
    setLoading(true);
    try {
      const response = await axios.patch(`/user/${userId}`, updatedData, {
        withCredentials: true,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? response.data : user))
      );
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newUser) => {
    setLoading(true);
    try {
      const response = await axios.post("/user", newUser, {
        withCredentials: true,
      });
      setUsers((prevUsers) => [...prevUsers, response.data]);
      showToast("User added successfully!", "success");
    } catch (error) {
      console.error("Error adding user:", error);
      showToast("Error adding user. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (userId) => {
    setLoading(true);
    try {
      await axios.patch(
        `/user/${userId}/unlock`,
        {},
        { withCredentials: true }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, lockoutUntil: null } : user
        )
      );
      showToast("User unlocked successfully!", "success");
    } catch (error) {
      console.error("Error unlocking user:", error);
      showToast("Error unlocking user. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRowExpand = (row) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(row._id)
        ? prevExpandedRows.filter((id) => id !== row._id)
        : [...prevExpandedRows, row._id]
    );
  };

  const columns = [
    { name: "Username", selector: (row) => row.name, sortable: true },
    { name: "First Name", selector: (row) => row.firstName, sortable: true },
    { name: "Middle Name", selector: (row) => row.middleName, sortable: true },
    { name: "Last Name", selector: (row) => row.lastName, sortable: true },
    { name: "Gender", selector: (row) => row.gender, sortable: true },
    { name: "User Type", selector: (row) => row.userType, sortable: true },
    {
      name: "Date Created",
      selector: (row) => formatReadableDate(row.dateTimestamp),
      sortable: true,
    },
    {
      name: "Date Updated",
      selector: (row) => formatReadableDate(row.dateUpdated),
      sortable: true,
    },

    {
      name: "Status",
      selector: (row) => (row.lockoutUntil ? "Locked" : "Active"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleModalOpenForEdit(row)}
            className="text-white bg-blue-600 p-2 rounded-md"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-white bg-red-600 p-2 rounded-md"
          >
            <FaTrash size={16} />
          </button>
          {row.lockoutUntil && (
            <button
              onClick={() => handleUnlock(row._id)}
              className="text-white bg-yellow-600 p-2 rounded-md"
            >
              <FaUnlock size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const expandedRowComponent = ({ data }) => {
    return (
      <div className="flex flex-wrap text-[0.9em] border-b">
        <div className="flex flex-col flex-2 p-4">
          <div className="flex text-[1.5em] mb-[20px]">
            <span className="mr-2 w-[120px] h-[120px] flex items-center justify-center pr-[10px]">
              <img
                id="profileImage"
                src={
                  data.profileImage
                    ? `data:image/jpeg;base64,${data.profileImage}`
                    : DefaultImg
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </span>
            <div className="flex flex-col">
              <span>{`${data.firstName} ${data.middleName} ${data.lastName}`}</span>
              <span className="text-[0.5em] text-gray-400">
                created at {formatReadableDate(data.dateTimestamp)} at{" "}
                {new Date(data.dateTimestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">Email:</span>
            <span className="text-blue-500 underline">{data.email}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">
              Contact Number:
            </span>
            <span>{data.contactNumber}</span>
          </div>
          <div className="flex mb-[25px]">
            <span className="font-bold w-[120px] text-end mr-2">Address:</span>
            <span className="max-w-[250px]">{data.address}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">
              User Type:
            </span>
            <span>{data.userType}</span>
          </div>
          <div className="flex">
            <span className="font-bold w-[120px] text-end mr-2">
              Date Updated:
            </span>
            <span>
              {formatReadableDate(data.dateUpdated)} at{" "}
              {new Date(data.dateUpdated).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-bold w-[120px] text-end mr-2">Status:</span>
            <span className="flex items-center">
              {data.lockoutUntil ? (
                <>
                  <AiFillLock className="text-red-500 mr-1" />{" "}
                  {/* Lock icon for Locked status */}
                  Locked
                </>
              ) : (
                <>
                  <FaCircleCheck className="text-green-500 mr-1" />{" "}
                  {/* Unlock icon for Active status */}
                  Active
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const exportToExcel = (name) => {
    const ws = XLSX.utils.json_to_sheet(
      users.map((user) => ({
        Name: user.name,
        FirstName: user.firstName,
        MiddleName: user.middleName,
        LastName: user.lastName,
        Gender: user.gender,
        ContactNumber: user.contactNumber,
        Address: user.address,
        Email: user.email,
        UserType: user.userType,
        DateCreated: new Date(user.dateTimestamp).toLocaleString(),
        DateUpdated: new Date(user.dateUpdated).toLocaleString(),
        Status: user.lockoutUntil ? "Locked" : "Active",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `${name}.xlsx`);
  };

  const handleExportClick = () => {
    setIsFileNameModalOpen(true);
  };

  const handleFileNameSave = (name) => {
    setFileName(name);
    exportToExcel(name);
    setIsFileNameModalOpen(false); // Close the file name modal after saving
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-center mt-12 mx-4 sm:justify-between space-y-4 sm:space-y-0">
        <button
          onClick={handleModalOpenForAdd}
          className="bg-green-600 text-white rounded-md px-6 py-2 text-sm hover:scale-105 transition transform duration-300 flex items-center"
        >
          <FaPlus className="mr-2" /> Add User
        </button>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 rounded-md"
          />
          <button
            onClick={() => handleSearch(query)}
            className="bg-blue-600 text-white p-2 rounded-md flex items-center"
          >
            <FaSearch size={16} />
          </button>

          <button
            onClick={handleExportClick}
            className="bg-green-600 text-white p-2 rounded-md flex items-center"
          >
            <FaFileExcel size={16} className="mr-2" /> Export on Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto m-4 scrollable-table-container overflow-y-auto truncate">
        <DataTable
          columns={columns}
          data={users}
          pagination
          paginationServer
          expandableRows
          expandableRowsComponent={expandedRowComponent}
          expandOnRowClicked={handleRowExpand}
          paginationPerPage={limit}
          paginationTotalRows={totalItems}
          onChangePage={(page) => setPage(page)}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          className="min-w-full bg-white border border-gray-200"
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        user={selectedUser}
        onSaveUser={(user) => {
          if (modalMode === "add") {
            handleAdd(user);
          } else {
            handleEdit(selectedUser._id, user);
          }
          handleModalClose();
        }}
        refresh={refresh}
      />

      <FileNameModal
        isOpen={isFileNameModalOpen}
        onClose={() => setIsFileNameModalOpen(false)}
        onSave={handleFileNameSave}
      />
    </div>
  );
};

export default Users;
