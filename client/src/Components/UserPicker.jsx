// UserPicker.jsx
import React, { useState, useEffect } from "react";
import UserApi from "../api/UserApi";
import "../styles/loader1.css";

const UserPicker = ({ value, onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await UserApi.getAllUsers(1, 1000);
        setUsers(data.users);
      } catch (err) {
        setError("Error loading users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user selection
  const handleUserSelect = (event) => {
    if (event.target.value) {
      const selectedUser = JSON.parse(event.target.value);
      onSelectUser(selectedUser);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex item-center justify-center">
          <p className="Dotsbar1"></p>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <select
          className="border border-gray-300 p-2 rounded-md w-full"
          value={JSON.stringify(
            users.find((user) => user.name === value) || {}
          )} // Convert selected user to JSON string for dropdown
          onChange={handleUserSelect}
        >
          <option value="{}">Select a user</option>
          {users.map((user) => (
            <option key={user._id} value={JSON.stringify(user)}>
              {user.name} - {user.userType}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default UserPicker;
