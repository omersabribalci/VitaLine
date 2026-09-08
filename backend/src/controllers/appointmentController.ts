import AppError = require("../utils/AppError");
import Appointment = require("../models/Appointment");
import BookingPolicy = require("../models/BookingPolicy");
import sendSuccessResponse = require("../utils/sendSuccessResponse");
import Doctor = require("../models/Doctor");
import Patient = require("../models/Patient");
import isIdValid = require("../utils/isIdValid");
import {
  isDateAvailableForBooking,
  generateSlotsForDay,
} from "../utils/appointmentHelpers";
import {
  validateAppointmentSlot,
  assertNoDoctorConflict,
  assertNoPatientConflict,
} from "../utils/appointmentValidation";
import { parseISO, startOfDay, endOfDay } from "date-fns";
import {
  buildStatusCounts,
  buildDoctorStatistics,
  buildSpecialityStatistics,
} from "../utils/appointmentStatistics";
import {
  enforceRolePermissions,
} from "../utils/appointmentUpdatePermissions";
import type { NextFunction, Response } from "express";
import { Types } from "mongoose";
import type { AppRequest } from "../types";
import requireAuthenticatedUser = require("../utils/requireAuthenticatedUser");
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import type {
  AppointmentListQuery,
  AvailabilityQuery,
  CreateAppointmentBody,
  IdParams,
  UpdateAppointmentBody,
} from "../types/requests";

const getAppointments = async (
  req: AppRequest<unknown, AppointmentListQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = requireAuthenticatedUser(req);
    const filter: Record<string, unknown> = {};
    const { page, limit, skip } = getPagination(req.query);

    // Patient ve doctor sadece kendi randevularını görebilir.
    // Herkesi görebilir. İsterse URL parametrelerinden (?doctorId=...&patientId=...) filtreleme yapabilir.

    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user.id });

      if (!patient)
        return next(new AppError("Patient profile not found.", 404));

      filter.patientId = patient?._id;
    } else if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: user.id });

      if (!doctor) return next(new AppError("Doctor profile not found.", 404));
      filter.doctorId = doctor?._id;
    } else {
      if (req.query.doctorId) filter.doctorId = req.query.doctorId;
      if (req.query.patientId) filter.patientId = req.query.patientId;
    }

    const [appointments, totalItems] = await Promise.all([
      Appointment.find(filter)
        .populate({ path: "doctorId", populate: { path: "userId" } })
        .populate({ path: "patientId", populate: { path: "userId" } })
        .sort({ dateAndTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return sendSuccessResponse(res, 200, {
      items: appointments,
      pagination: buildPaginationMeta(page, limit, totalItems),
    });
  } catch (error) {
    next(error);
  }
};

const getAdminStatistics = async (
  req: AppRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [
      doctorCount,
      patientCount,
      appointmentCount,
      statusCounts,
      doctorCounts,
    ] = await Promise.all([
      Doctor.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $group: { _id: "$doctorId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const doctorIds = doctorCounts.map((item: { _id: unknown }) => item._id);
    const doctors = await Doctor.find({
      _id: { $in: doctorIds },
    })
      .populate<{ userId: { name: string } }>("userId")
      .lean();

    const { doctorsById, appointmentsByDoctor } = buildDoctorStatistics(
      doctorCounts,
      doctors,
    );

    return sendSuccessResponse(res, 200, {
      doctorCount,
      patientCount,
      appointmentCount,
      statusCounts: buildStatusCounts(statusCounts),
      appointmentsByDoctor,
      appointmentsBySpeciality: buildSpecialityStatistics(
        appointmentsByDoctor,
        doctorsById,
      ),
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (
  req: AppRequest<unknown, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = requireAuthenticatedUser(req);
    const { id } = req.params;
    isIdValid(id);

    const filter: Record<string, unknown> = { _id: id };

    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user.id });
      if (!patient) {
        return next(new AppError("Patient profile not found.", 404));
      }
      filter.patientId = patient._id;
    } else if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: user.id });
      if (!doctor) {
        return next(new AppError("Doctor profile not found.", 404));
      }
      filter.doctorId = doctor._id;
    }

    const appointment = await Appointment.findOne(filter)
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } })
      .lean();

    if (!appointment) {
      return next(new AppError("Appointment not found.", 404));
    }
    return sendSuccessResponse(res, 200, appointment);
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (
  req: AppRequest<unknown, AvailabilityQuery>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return next(new AppError("Doctor ID and date are required.", 400));
    }

    isIdValid(doctorId);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new AppError("Doctor not found.", 404));
    const policy = await BookingPolicy.getPolicy();
    const targetDate = parseISO(date);

    if (!isDateAvailableForBooking(targetDate, policy, doctor)) {
      return sendSuccessResponse(res, 200, {
        date,
        doctorId,
        slots: [],
      });
    }

    const existingAppointments = await Appointment.find({
      doctorId: doctorId,
      dateAndTime: {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      },
      status: { $ne: "cancelled" },
    }).lean();

    const slots = generateSlotsForDay(
      policy,
      targetDate,
      date,
      existingAppointments,
    );

    return sendSuccessResponse(res, 200, {
      date,
      doctorId,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (
  req: AppRequest<CreateAppointmentBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = requireAuthenticatedUser(req);
    const { doctorId, dateAndTime, status } = req.body;
    let patientId: string | Types.ObjectId | undefined = req.body.patientId;

    if (user.role === "patient") {
      const patientProfile = await Patient.findOne({ userId: user.id });
      if (!patientProfile) {
        return next(new AppError("Patient profile not found.", 404));
      }
      patientId = patientProfile._id;
    }

    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorId),
      Patient.findById(patientId),
    ]);

    if (!doctor) return next(new AppError("Doctor could not be found!", 400));
    if (!patient) return next(new AppError("Patient could not be found!", 400));

    patientId = patient._id;

    const policy = await BookingPolicy.getPolicy();
    const appointmentDate = new Date(dateAndTime);

    validateAppointmentSlot(appointmentDate, policy, doctor);
    await assertNoDoctorConflict(doctorId, appointmentDate);
    await assertNoPatientConflict(patientId, doctorId, appointmentDate);

    const appointmentData: Record<string, unknown> = {
      doctorId,
      patientId,
      dateAndTime,
    };

    if (user.role === "admin" && status !== undefined) {
      appointmentData.status = status;
    }

    const appointment = await Appointment.create(appointmentData);
    await appointment.populate([
      { path: "doctorId", populate: { path: "userId" } },
      { path: "patientId", populate: { path: "userId" } },
    ]);

    return sendSuccessResponse(
      res,
      201,
      appointment,
      "Appointment created successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (
  req: AppRequest<UpdateAppointmentBody, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = requireAuthenticatedUser(req);
    const { id } = req.params;
    isIdValid(id);

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError("Appointment not found.", 404));
    }

    await enforceRolePermissions(user, appointment, req.body);

    // Yeni Değerleri Belirle (Gönderilmediyse eskisini koru)
    const newDateAndTime = req.body.dateAndTime
      ? new Date(req.body.dateAndTime)
      : appointment.dateAndTime;
    const newDoctorId = req.body.doctorId
      ? new Types.ObjectId(req.body.doctorId)
      : appointment.doctorId;
    const newPatientId = req.body.patientId
      ? new Types.ObjectId(req.body.patientId)
      : appointment.patientId;
    const newStatus = req.body.status ?? appointment.status;

    // İptal edilmiyorsa zaman, slot ve çakışma kurallarını denetle
    if (newStatus !== "cancelled") {
      const [doctor, patient] = await Promise.all([
        Doctor.findById(newDoctorId),
        Patient.findById(newPatientId),
      ]);

      if (!doctor) return next(new AppError("Doctor not found", 404));
      if (!patient) return next(new AppError("Patient not found", 404));

      const policy = await BookingPolicy.getPolicy();
      const appointmentDate = new Date(newDateAndTime);

      validateAppointmentSlot(appointmentDate, policy, doctor);

      // Çakışma kontrolleri Promise.all ile paralel koşturulur
      await Promise.all([
        assertNoDoctorConflict(newDoctorId, appointmentDate, appointment._id),
        assertNoPatientConflict(
          newPatientId,
          newDoctorId,
          appointmentDate,
          appointment._id,
        ),
      ]);
    }

    // Alanları Güncelle ve Kaydet
    appointment.doctorId = newDoctorId;
    appointment.patientId = newPatientId;
    appointment.dateAndTime = newDateAndTime;
    appointment.status = newStatus;

    await appointment.save();

    // İlişkili verileri doldur ve yanıt dön
    await appointment.populate([
      { path: "doctorId", populate: { path: "userId" } },
      { path: "patientId", populate: { path: "userId" } },
    ]);

    return sendSuccessResponse(
      res,
      200,
      appointment,
      "Appointment updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (
  req: AppRequest<unknown, import("express-serve-static-core").Query, IdParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    isIdValid(id);

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after", runValidators: true },
    );

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      null,
      "Appointment is deleted successfully!",
    );
  } catch (error) {
    next(error);
  }
};

export {
  getAppointments,
  getAdminStatistics,
  getAppointmentById,
  getAvailability,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
