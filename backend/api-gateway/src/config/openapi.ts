const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { parse } = require("yaml");

const specificationPath = resolve(process.cwd(), "openapi.yaml");

const openApiDocument = parse(
  readFileSync(specificationPath, "utf8"),
) as Record<string, unknown>;

module.exports = { openApiDocument };
