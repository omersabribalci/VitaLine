const mongoose = require("mongoose");
const AppError = require("./AppError");

const isIdValid = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid id format! -> ${id}`, 400);
  }
};

module.exports = isIdValid;
