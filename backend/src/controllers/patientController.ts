import mongoose from "mongoose";
import Patient = require("../models/Patient");
import AppError = require("../utils/AppError");
import isIdValid = require("../utils/isIdValid");
import sendSuccessResponse = require("../utils/sendSuccessResponse");
import User = require("../models/User");
import Appointment = require("../models/Appointment");
import type { NextFunction, Response } from "express";
import type { AppRequest } from "../types";
import requireAuthenticatedUser = require("../utils/requireAuthenticatedUser");
import type { ClientSession } from "mongoose";
import type {
  IdParams,
  PaginationQuery,
  UpdatePatientBody,
} from "../types/requests";
import { buildPaginationMeta, getPagination } from "../utils/pagination";

const getPatients = async (
  req: AppRequest<unknown, PaginationQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [patients, totalItems] = await Promise.all([
      Patient.find()
        .populate("userId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(),
    ]);

    return sendSuccessResponse(res, 200, {
      items: patients,
      pagination: buildPaginationMeta(page, limit, totalItems),
    });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (
  req: AppRequest<unknown, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const patient = await Patient.findById(id).populate("userId").lean();

    if (!patient) {
      return next(
        new AppError(`Patient does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(res, 200, patient);
  } catch (error) {
    next(error);
  }
};

const getMyPatientProfile = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireAuthenticatedUser(req);
    const patient = await Patient.findOne({
      userId: user.id,
    })
      .populate("userId")
      .lean();

    if (!patient) {
      return next(
        new AppError("Patient profile not found for this user.", 404),
      );
    }

    return sendSuccessResponse(res, 200, patient);
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (
  req: AppRequest<UpdatePatientBody, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;

  try {
    isIdValid(id);

    const { accountStatus } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { accountStatus: accountStatus },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!patient) {
      return next(
        new AppError(`Patient does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      patient,
      "Patient updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (
  req: AppRequest<unknown, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  let session: ClientSession | null = null;
  try {
    isIdValid(id);

    const currentSession = await mongoose.startSession();
    session = currentSession;

    await currentSession.withTransaction(async () => {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: currentSession,
        },
      );

      if (!patient) {
        throw new AppError(`Patient does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(
        patient.userId,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: currentSession,
        },
      );

      if (!user) {
        throw new AppError(`User does not exist with this ID -> ${id}`, 404);
      }

      await Appointment.updateMany(
        { patientId: patient._id, status: "scheduled" },
        { $set: { status: "cancelled" } },
        { session: currentSession },
      );
    });

    return sendSuccessResponse(res, 200, null, "Patient deleted successfully!");
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
};
