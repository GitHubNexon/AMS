// InventoryTable.jsx
import React from "react";
import { FaTimes, FaPlus  } from "react-icons/fa";
import CurrencyInput from "../Components/CurrencyInput";
import { IoIosAdd } from "react-icons/io";

const InventoryTable = ({ inventory, setInventory }) => {
  const handleDeleteRow = (index) => {
    const newInventory = [...inventory];
    newInventory.splice(index, 1);
    setInventory(newInventory);
  };

  const handleDuplicateRow = (index) => {
    const newInventory = [...inventory];
    const duplicateItem = { ...newInventory[index] }; // Create a copy of the item
    newInventory.splice(index + 1, 0, duplicateItem); // Insert the duplicate after the current row
    setInventory(newInventory);
  };

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedInventory = [...inventory];
    updatedInventory[index] = { ...updatedInventory[index], [name]: value };
    setInventory(updatedInventory);
  };

  const handleGLChange = (index, selectedAccount) => {
    const updatedInventory = [...inventory];
    updatedInventory[index].EquipmentCategory = {
      code: selectedAccount.code,
      name: selectedAccount.name,
    };
    setInventory(updatedInventory);
  };

  return (
    <div>
      <table className="w-full border-collapse border border-gray-300 text-[0.7em]">
        <thead>
          <tr>
            <th className="border px-4 py-2">Actions</th>
            <th className="border px-4 py-2">Inventory No</th>
            <th className="border px-4 py-2">Remarks</th>
            <th className="border px-4 py-2">Issued To</th>
            <th className="border px-4 py-2">Issue Date</th>
            <th className="border px-4 py-2">Person Accountable</th>
            <th className="border px-4 py-2">Location</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item, index) => (
            <tr key={index}>
              <td className="border ">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes size={20} />
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => handleDuplicateRow(index)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <IoDuplicate size={20} />
                  </button> */}
                  <button
                    type="button"
                    onClick={() =>
                      setInventory([
                        ...inventory,
                        {
                          InventoryNo: "",
                          Remarks: "",
                          issuedTo: "",
                          issueDate: "",
                          PersonAccountable: "",
                          Location: "",
                          Condition: {
                            GoodCondition: true,
                            ForSale: false,
                            ForRepair: false,
                            ForDisposal: false,
                            Unserviceable: false,
                            Lost: false,
                          },
                        },
                      ])
                    }
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaPlus size={20} />
                  </button>
                </div>
              </td>
              <td className="border  py-2 text-center">
                <input
                  type="text"
                  name="InventoryNo"
                  value={item.InventoryNo}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100"
                />
              </td>
              <td className="border  py-2 text-center">
                <input
                  type="text"
                  name="Remarks"
                  value={item.Remarks}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100"
                />
              </td>
              <td className="border py-2 text-center">
                <input
                  type="text"
                  name="issuedTo"
                  value={item.issuedTo}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100"
                />
              </td>
              <td className="border py-2 text-center">
                <input
                  type="date"
                  name="issueDate"
                  value={item.issueDate}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md"
                />
              </td>
              <td className="border py-2 text-center">
                <input
                  type="text"
                  name="PersonAccountable"
                  value={item.PersonAccountable}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100"
                />
              </td>
              <td className="border py-2 text-center">
                <input
                  type="text"
                  name="Location"
                  value={item.Location}
                  onChange={(e) => handleChange(index, e)}
                  className="border border-gray-300 p-2 rounded-md bg-gray-100"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
