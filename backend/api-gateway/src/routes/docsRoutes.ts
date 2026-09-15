const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { openApiDocument } = require("../config/openapi.js");
type Request = import("express").Request;
type Response = import("express").Response;

const router = express.Router();

router.get("/api-docs.json", (_req: Request, res: Response) => {
  res.status(200).json(openApiDocument);
});

router.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "VitaLine API Documentation",
  }),
);

module.exports = router;
