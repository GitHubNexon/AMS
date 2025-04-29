import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.withCredentials = true;

const useUserLogic = (page = 1, limit = 10) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching users:", { page, limit, search }); // Corrected line
        const response = await axios.get("/api/user", {
          params: { page, limit, keyword: search },
          withCredentials: true,
        });
        setUsers(response.data.users);
        setTotalItems(response.data.totalItems);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, search]);

  const handleDelete = async (userId) => {
    setLoading(true);
    try {
      await axios.delete(`/api/user/${userId}`, { withCredentials: true });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      console.log("User deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (userId, updatedData) => {
    setLoading(true);
    try {

      const response = await axios.patch(`/api/user/${userId}`, updatedData, {
        withCredentials: true,
      });

      console.log("User updated successfully:", response.data);

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === userId ? response.data : user))
      );
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newUser) => {
    setLoading(true);
    try {
      const emailExists = await checkEmailExists(newUser.email);
      if (emailExists) {
        alert("Email already exists. Please use a different email address.");
        return;
      }
      const response = await axios.post("/api/user", newUser, {
        withCredentials: true,
      });
      setUsers((prevUsers) => [...prevUsers, response.data]);
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(`/api/user/email`, {
        params: { email },
        withCredentials: true,
      });
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  return {
    users,
    loading,
    totalItems,
    totalPages,
    search,
    setSearch,
    checkEmailExists,
    handleAdd,
    handleEdit,
    handleDelete,
  };
};

export default useUserLogic;
