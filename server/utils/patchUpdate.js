const _ = require("lodash");

/**
 * Deep patch update for Mongoose documents with change detection
 *
 * @param {Object} model - The Mongoose model (e.g., StudentModel, TeacherModel)
 * @param {String} id - Document ID to update
 * @param {Object} updatedData - Patch data from request body
 * @returns {Object} { updated, changed } — updated document and change status
 */
const patchUpdate = async (model, id, updatedData) => {
  const document = await model.findById(id);
  if (!document) {
    return { updated: null, changed: false };
  }

  const currentData = document.toObject();
  const merged = _.merge({}, currentData, updatedData);

  const noChanges = _.isEqual(currentData, merged);
  if (noChanges) {
    return { updated: document, changed: false };
  }

  // Apply changes
  Object.assign(document, updatedData);

  const updated = await document.save();
  return { updated, changed: true };
};

module.exports = patchUpdate;
