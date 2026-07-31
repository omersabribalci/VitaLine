const fs = require("node:fs");
const path = require("node:path");

const writeFile = (data) => {
  const filePath = path.join(__dirname, "..", "data", "database.json");
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("Succesfully written.");
  } catch (error) {
    console.error(error);
  }
};

module.exports = writeFile;
