const EmployeeModel = require("../models/employeeModel");

const createEmployee = async (req, res) => {
  try {
    const EmployeeData = req.body;

    const newEmployee = new EmployeeModel(EmployeeData);
    await newEmployee.save();
    res.status(201).json({
      message: "Employee record created successfully",
      data: newEmployee,
    });
  } catch (error) {
    console.error("Error creating Employee record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updateEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
      }
    );
    if (!updateEmployee) {
      return res.status(404).json({ message: "employee record not found" });
    }

    res.status(200).json({
      message: "Employee record updated successfully",
      data: updateEmployee,
    });
  } catch (error) {
    console.error("Error updating Employee record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
};
