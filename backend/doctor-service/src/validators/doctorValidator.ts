type RequestHandler = import("express").RequestHandler;
const { body, param, query } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");
const {
  doctorTitles,
  doctorSpecialities,
} = require("../config/doctorCatalog.js");

const validateDoctorCreation = [
  body("name").trim().isLength({ min: 3, max: 30 }),
  body("email").trim().isEmail().isLength({ max: 255 }),
  body("phone").trim().matches(/^\d{11}$/),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
  body("image").optional().isString(),
  body("title")
    .isIn([...doctorTitles])
    .withMessage("Please select a valid title."),
  body("speciality")
    .isIn([...doctorSpecialities])
    .withMessage("Please select a valid speciality."),
  validateRequest,
];

const normalizeDoctorListQuery: RequestHandler = (req, res, next) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const speciality = typeof req.query.speciality === "string" ? req.query.speciality : "";
  const sort = typeof req.query.sort === "string" ? req.query.sort : "";

  res.locals.doctorListQuery = {
    ...(search ? { search } : {}),
    ...(speciality ? { speciality } : {}),
    ...(sort ? { sort } : {}),
    page: req.query.page === undefined ? 1 : Number(req.query.page),
    limit: req.query.limit === undefined ? 10 : Number(req.query.limit),
  };
  next();
};

const validateDoctorListQuery = [
  query("search").optional().isString().trim().isLength({ max: 100 }),
  query("speciality").optional().isIn([...doctorSpecialities]),
  query("sort").optional().equals("name"),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  normalizeDoctorListQuery,
];

const validateDoctorId = [
  param("id").isMongoId().withMessage("A valid doctor ID is required."),
  validateRequest,
];

const allowedUpdateFields = new Set([
  "name",
  "email",
  "phone",
  "image",
  "password",
  "title",
  "speciality",
  "unavailableDates",
]);

const validateDoctorProfileUpdate = [
  body().custom((value: unknown) => {
    if (!value || typeof value !== "object" || Object.keys(value).length === 0) {
      throw new Error("At least one doctor profile field is required.");
    }
    const unsupported = Object.keys(value).filter(
      (field) => !allowedUpdateFields.has(field),
    );
    if (unsupported.length > 0) {
      throw new Error(`Unsupported update fields: ${unsupported.join(", ")}.`);
    }
    return true;
  }),
  body("name").optional().trim().isLength({ min: 3, max: 30 }),
  body("email").optional().trim().isEmail().isLength({ max: 255 }),
  body("phone").optional().trim().matches(/^\d{11}$/),
  body("image").optional().isString(),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage("Password must contain upper, lower, and number."),
  body("title").optional().isIn([...doctorTitles]),
  body("speciality").optional().isIn([...doctorSpecialities]),
  body("unavailableDates")
    .optional()
    .isArray({ max: 50 })
    .bail()
    .custom((ranges: unknown[]) => {
      for (const rangeValue of ranges) {
        const range = rangeValue as Record<string, unknown>;
        if (
          !range ||
          typeof range !== "object" ||
          typeof range.start !== "string" ||
          Number.isNaN(Date.parse(range.start)) ||
          typeof range.end !== "string" ||
          Number.isNaN(Date.parse(range.end)) ||
          new Date(range.end) <= new Date(range.start)
        ) {
          throw new Error("Each unavailable date must have a valid start and end.");
        }
      }
      return true;
    }),
  validateRequest,
];

const validateDoctorDeletion = validateDoctorId;

const validateDoctorIdParam = [
  param("doctorId").isMongoId().withMessage("A valid doctorId is required."),
  validateRequest,
];

const validateDoctorUserIdParam = [
  param("userId").isMongoId().withMessage("A valid userId is required."),
  validateRequest,
];

const validateDoctorResolution = [
  body("doctorIds")
    .isArray({ min: 1, max: 500 })
    .withMessage("doctorIds must contain between 1 and 500 valid IDs.")
    .bail(),
  body("doctorIds.*")
    .isMongoId()
    .withMessage("doctorIds must contain between 1 and 500 valid IDs."),
  body("doctorIds").customSanitizer((ids: unknown) =>
    Array.isArray(ids) ? [...new Set(ids)] : ids,
  ),
  validateRequest,
];

module.exports = {
  validateDoctorCreation,
  validateDoctorListQuery,
  validateDoctorId,
  validateDoctorProfileUpdate,
  validateDoctorDeletion,
  validateDoctorIdParam,
  validateDoctorUserIdParam,
  validateDoctorResolution,
};
