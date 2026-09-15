require("dotenv/config");
const app = require("./src/app.js");
const { loadConfig } = require("./src/config/env.js");

const config = loadConfig();

app.listen(config.port, "0.0.0.0", () => {
  console.log(`API Gateway ${config.port} portunda çalışıyor`);
  console.log(`Health check: http://localhost:${config.port}/health`);
  console.log(`Swagger: http://localhost:${config.port}/api-docs`);
});
