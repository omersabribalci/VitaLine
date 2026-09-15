type RequestHandler = import("express").RequestHandler;
const { body, param, query } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");

const objectIdList = (field: string, label: string) =>
  body(field)
    .isArray({ min: 1, max: 500 })
    .withMessage(`${label} must contain between 1 and 500 valid IDs.`)
    .bail()
    .custom((ids: unknown[]) =>
      ids.every((id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id)),
    )
    .withMessage(`${label} must contain between 1 and 500 valid IDs.`)
    .customSanitizer((ids: unknown[]) => [...new Set(ids)]);

const validatePatientRegistration = [
  body("userId").isMongoId().withMessage("A valid userId is required."),
  validateRequest,
];

const validateUserIdParam = [
  param("userId").isMongoId().withMessage("A valid userId is required."),
  validateRequest,
];

const validatePatientIdParam = [
  param("patientId")
    .isMongoId()
    .withMessage("A valid patientId is required."),
  validateRequest,
];

const validatePatientResolution = [
  objectIdList("patientIds", "patientIds"),
  validateRequest,
];

const normalizePatientListQuery: RequestHandler = (req, res, next) => {
  res.locals.patientListQuery = {
    page: req.query.page === undefined ? 1 : Number(req.query.page),
    limit: req.query.limit === undefined ? 10 : Number(req.query.limit),
  };
  next();
};

const validatePatientListQuery = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  normalizePatientListQuery,
];

const validatePatientId = [
  param("id").isMongoId().withMessage("A valid patient ID is required."),
  validateRequest,
];

const validatePatientUpdate = [
  body().custom((value: unknown) => {
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).length !== 1 ||
      !("accountStatus" in value)
    ) {
      throw new Error("Only accountStatus can be updated.");
    }
    return true;
  }),
  body("accountStatus").isIn(["enabled", "disabled"]),
  validateRequest,
];

const validatePatientDeletion = validatePatientId;

module.exports = {
  validatePatientRegistration,
  validateUserIdParam,
  validatePatientIdParam,
  validatePatientResolution,
  validatePatientListQuery,
  validatePatientId,
  validatePatientUpdate,
  validatePatientDeletion,
};
