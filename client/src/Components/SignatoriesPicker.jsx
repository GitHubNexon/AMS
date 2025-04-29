import React, { useState, useEffect } from "react";
import UserApi from "../api/UserApi";
import "../styles/loader1.css";

const SignatoriesPicker = ({ value, onSelectSignatory, readOnly = false, signatoryType  }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {     
        // const data = await UserApi.getAllUsers(1, 1000, );
        const data = await UserApi.getAllUsers(1, 1000, "", signatoryType); 
        setUsers(data.users);
      } catch (err) {
        setError("Error loading users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [signatoryType]);

  const handleChange = (event) => {
    const selectedUser = JSON.parse(event.target.value);
    if (selectedUser) {
      onSelectSignatory(selectedUser);
      console.log('selectedUser', selectedUser);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <p className="Dotsbar1"></p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (readOnly) {
    return (
      <div className="border border-gray-300 p-2 rounded-md w-full bg-gray-100 text-gray-700">
        {value ? `${value.name} - ${value.position}` : "No user selected"}
      </div>
    );
  }

  return (
    <div className="">
      <select
        onChange={handleChange}
        value={
          value
            ? JSON.stringify(users.find((user) => user._id === value._id))
            : {}
        }
        className="border border-gray-300 p-2 rounded-md w-full"
      >
        <option value="{}">Select a User</option>
        {users.map((user) => (
          <option key={user._id} value={JSON.stringify(user)}>
            {user.name} - {user.userType}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SignatoriesPicker;
