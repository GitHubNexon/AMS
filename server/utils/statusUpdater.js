// utils/statusUpdater.js

const updateStatus = async (
  req,
  res,
  next,
  { model, entityName, field, value, preCheck = [] }
) => {
  try {
    const { id } = req.params;

    const record = await model.findById(id);
    if (!record || !record.status) {
      return res
        .status(404)
        .json({ message: `${entityName} record or status not found` });
    }

    for (const check of preCheck) {
      if (check.condition(record.status)) {
        return res.status(400).json({ message: check.message });
      }
    }

    const update = { [`status.${field}`]: value };
    const updatedRecord = await model.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedRecord) {
      return res
        .status(404)
        .json({ message: `${entityName} record not found` });
    }

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error(`Error updating ${entityName} status:`, error.message);
    res
      .status(500)
      .json({ message: `Error processing ${entityName} request.` });
  }
};

module.exports = updateStatus;