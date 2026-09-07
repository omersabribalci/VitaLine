import mongoose from "mongoose";
import AppError = require("./AppError");

const isIdValid = (id: unknown): void => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(`Invalid id format! -> ${id}`, 400);
  }
};

export = isIdValid;
