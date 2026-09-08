import mongoose from "mongoose";
import Doctor = require("../models/Doctor");
import sendSuccessResponse = require("../utils/sendSuccessResponse");
import AppError = require("../utils/AppError");
import User = require("../models/User");
import Appointment = require("../models/Appointment");
import bcrypt from "bcryptjs";
import isIdValid = require("../utils/isIdValid");
import type { NextFunction, Response } from "express";
import type { AppRequest } from "../types";
import requireAuthenticatedUser = require("../utils/requireAuthenticatedUser");
import type { ClientSession } from "mongoose";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import type {
  CreateDoctorBody,
  DoctorListQuery,
  IdParams,
  UpdateDoctorBody,
} from "../types/requests";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDoctors = async (
  req: AppRequest<unknown, DoctorListQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filter: Record<string, unknown> = {};
    const { search, speciality, sort = "name" } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    if (speciality) {
      filter.speciality = speciality;
    }

    if (search) {
      const matchingUsers = await User.find({
        name: {
          $regex: escapeRegex(search.trim()),
          $options: "i",
        },
      })
        .select("_id")
        .lean();

      filter.userId = {
        $in: matchingUsers.map((user: { _id: unknown }) => user._id),
      };
    }

    const doctors = await Doctor.find(filter)
      .populate<{ userId: { name: string } }>("userId")
      .lean();

    if (sort === "name") {
      doctors.sort((first: { userId: { name: string } }, second: { userId: { name: string } }) =>
        first.userId.name.localeCompare(second.userId.name),
      );
    }

    const totalItems = doctors.length;
    return sendSuccessResponse(res, 200, {
      items: doctors.slice(skip, skip + limit),
      pagination: buildPaginationMeta(page, limit, totalItems),
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (
  req: AppRequest<unknown, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const doctor = await Doctor.findById(id).populate("userId").lean();

    if (!doctor) {
      return next(
        new AppError(`Doctor does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(res, 200, doctor);
  } catch (error) {
    next(error);
  }
};

const getMyDoctorProfile = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireAuthenticatedUser(req);
    const doctor = await Doctor.findOne({ userId: user.id })
      .populate("userId")
      .lean();

    if (!doctor) {
      return next(new AppError("Doctor profile not found for this user.", 404));
    }

    return sendSuccessResponse(res, 200, doctor);
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (
  req: AppRequest<CreateDoctorBody>,
  res: Response,
  next: NextFunction,
) => {
  let session: ClientSession | null = null;
  let userWithoutPassword;
  let doctor;

  try {
    const currentSession = await mongoose.startSession();
    session = currentSession;

    await currentSession.withTransaction(async () => {
      const { title, name, email, phone, image, password, speciality } =
        req.body;

      const userObj = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        image: image || "",
        role: "doctor" as const,
      };

      const user = await User.create([userObj], { session: currentSession });

      const createdUser = user[0];
      if (!createdUser) {
        throw new AppError("User could not be created.", 500);
      }

      const doctorObj = {
        userId: createdUser._id,
        title: title,
        speciality: speciality,
      };

      doctor = await Doctor.create([doctorObj], { session: currentSession });

      const { password: _password, ...plainWithoutPassword } =
        createdUser.toObject();
      userWithoutPassword = plainWithoutPassword;
    });

    return sendSuccessResponse(
      res,
      201,
      {
        user: userWithoutPassword,
        doctor: doctor?.[0],
      },
      "Doctor created successfully.",
    );
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const updateDoctor = async (
  req: AppRequest<UpdateDoctorBody, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  let session: ClientSession | null = null;

  try {
    const authenticatedUser = requireAuthenticatedUser(req);
    isIdValid(id);

    if (authenticatedUser.role === "doctor") {
      const targetDoctor = await Doctor.findById(id);
      if (!targetDoctor || targetDoctor.userId.toString() !== authenticatedUser.id) {
        return next(new AppError("You can only update your own profile.", 403));
      }
    }

    let resData;

    const currentSession = await mongoose.startSession();
    session = currentSession;

    await currentSession.withTransaction(async () => {
      const {
        name,
        email,
        phone, // User alanları
        title,
        image,
        speciality,
        unavailableDates, // Doctor alanları
      } = req.body;

      const doctorData = { title, speciality, unavailableDates };
      const userData: Record<string, unknown> = { name, email, phone };

      // TODO: When a holiday overlaps existing scheduled appointments, decide whether to cancel them automatically and notify affected patients.
      if (typeof image !== "undefined") {
        userData.image = image;
      }

      let { password } = req.body;

      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      const doctor = await Doctor.findByIdAndUpdate(id, doctorData, {
        returnDocument: "after",
        runValidators: true,
        session: currentSession,
      });

      if (!doctor) {
        throw new AppError(`Doctor does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(doctor.userId, userData, {
        returnDocument: "after",
        runValidators: true,
        session: currentSession,
      });

      resData = await doctor.populate("userId");
    });

    return sendSuccessResponse(
      res,
      200,
      resData,
      "Doctor updated successfully!",
    );
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const deleteDoctor = async (
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
      const doctor = await Doctor.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: currentSession,
        },
      );

      if (!doctor) {
        throw new AppError(`Doctor does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(
        doctor.userId,
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
        { doctorId: doctor._id, status: "scheduled" },
        { $set: { status: "cancelled" } },
        { session: currentSession },
      );
    });

    return sendSuccessResponse(res, 200, null, "Doctor deleted successfully!");
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
export {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
};
