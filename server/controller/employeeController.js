const EmployeeModel = require("../models/employeeModel");
const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");

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

const deleteIdAssetRecords = async () => {
  try {
    const existingIssuances = await AssetsIssuanceModel.find({}, "_id");
    const validIssuanceIds = new Set(
      existingIssuances.map((doc) => doc._id.toString())
    );

    const employees = await EmployeeModel.find({});

    for (const employee of employees) {
      const originalLength = employee.assetRecords.length;

      employee.assetRecords = employee.assetRecords.filter((record) =>
        validIssuanceIds.has(record.issuanceId.toString())
      );

      if (employee.assetRecords.length !== originalLength) {
        await employee.save();
      }
    }
  } catch (error) {
    console.error("Error cleaning up assetRecords:", error);
  }
};

const getAllEmployeeRecords = async (req, res) => {
  try {
    await deleteIdAssetRecords();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { employeeName: { $regex: keyword, $options: "i" } },
          { employeeType: { $regex: keyword, $options: "i" } },
          { employeeCode: { $regex: keyword, $options: "i" } },
          { employeePosition: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(status &&
        status === "isDeleted" && {
          "Status.isDeleted": true,
        }),
      ...(status &&
        status === "isArchived" && {
          "Status.isArchived": true,
        }),
    };

    const sortCriteria = {
      "Status.isDeleted": 1,
      "Status.isArchived": 1,
      [sortBy]: sortOrder,
    };
    const totalItems = await EmployeeModel.countDocuments(query);
    const employees = await EmployeeModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      employees: employees,
    });
  } catch (error) {
    console.error("Error getting all Employee record", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeRecord = await EmployeeModel.findById(id);
    if (!employeeRecord || !employeeRecord.Status) {
      return res
        .status(404)
        .json({ message: "Employee record or status not found" });
    }

    if (employeeRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Cannot delete an archived employee record." });
    }

    if (employeeRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Employee record is already deleted." });
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": true },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(
      "Error deleting employee record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const archiveEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeRecord = await EmployeeModel.findById(id);
    if (!employeeRecord || !employeeRecord.Status) {
      return res
        .status(404)
        .json({ message: "Employee record or status not found" });
    }

    if (employeeRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Employee record is already archived." });
    }

    if (employeeRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot archive a deleted employee record." });
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": true },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(
      "Error archiving employee record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoDeleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeRecord = await EmployeeModel.findById(id);
    if (!employeeRecord || !employeeRecord.Status) {
      return res
        .status(404)
        .json({ message: "Employee record or status not found" });
    }

    if (!employeeRecord.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Employee record is not deleted." });
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": false },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(
      "Error undoing delete of employee record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoArchiveEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeRecord = await EmployeeModel.findById(id);
    if (!employeeRecord || !employeeRecord.Status) {
      return res
        .status(404)
        .json({ message: "Employee record or status not found" });
    }

    if (!employeeRecord.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Employee record is not archived." });
    }

    if (employeeRecord.Status.isDeleted) {
      return res.status(400).json({
        message: "Cannot undo archive for a deleted employee record.",
      });
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": false },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee record not found" });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error(
      "Error undoing archive of employee record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};

module.exports = {
  createEmployee,
  updateEmployee,
  getAllEmployeeRecords,
  deleteEmployee,
  archiveEmployee,
  undoDeleteEmployee,
  undoArchiveEmployee,
};
