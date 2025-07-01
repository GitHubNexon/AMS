const updateStatus = require("./statusUpdater");

const generateStatusHandlers = (model, entityName) => ({
  softDelete: (req, res, next) =>
    updateStatus(req, res, next, {
      model,
      entityName,
      field: "isDeleted",
      value: true,
      preCheck: [
        {
          condition: (s) => s.isArchived,
          message: `Cannot delete archived ${entityName.toLowerCase()}.`,
        },
        {
          condition: (s) => s.isDeleted,
          message: `${entityName} is already deleted.`,
        },
      ],
    }),

  undoDelete: (req, res, next) =>
    updateStatus(req, res, next, {
      model,
      entityName,
      field: "isDeleted",
      value: false,
      preCheck: [
        {
          condition: (s) => !s.isDeleted,
          message: `${entityName} is not deleted.`,
        },
      ],
    }),

  softArchive: (req, res, next) =>
    updateStatus(req, res, next, {
      model,
      entityName,
      field: "isArchived",
      value: true,
      preCheck: [
        {
          condition: (s) => s.isDeleted,
          message: `Cannot archive deleted ${entityName.toLowerCase()}.`,
        },
        {
          condition: (s) => s.isArchived,
          message: `${entityName} is already archived.`,
        },
      ],
    }),

  undoArchive: (req, res, next) =>
    updateStatus(req, res, next, {
      model,
      entityName,
      field: "isArchived",
      value: false,
      preCheck: [
        {
          condition: (s) => !s.isArchived,
          message: `${entityName} is not archived.`,
        },
        {
          condition: (s) => s.isDeleted,
          message: `Cannot unarchive deleted ${entityName.toLowerCase()}.`,
        },
      ],
    }),
});

module.exports = generateStatusHandlers;
