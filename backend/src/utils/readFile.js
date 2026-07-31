const fs = require("node:fs");
const path = require("node:path");

const readFile = () => {
  const filePath = path.join(__dirname, "..", "data", "database.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (error) {
    console.error(error);
  }
};

module.exports = readFile;
