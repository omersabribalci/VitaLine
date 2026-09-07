import AppError = require("./AppError");
import Patient = require("../models/Patient");
import Doctor = require("../models/Doctor");
import type {
  AppointmentDocumentShape,
  AuthenticatedUser,
  AppointmentStatus,
} from "../types";

interface AppointmentUpdateBody {
  doctorId?: string;
  patientId?: string;
  dateAndTime?: string;
  status?: AppointmentStatus;
}

const enforceRolePermissions = async (
  user: AuthenticatedUser,
  appointment: Pick<AppointmentDocumentShape, "doctorId" | "patientId">,
  body: AppointmentUpdateBody,
): Promise<void> => {
  const fields = Object.keys(body);

  // Eğer kullanıcı Hasta ise
  if (user.role === "patient") {
    const patient = await Patient.findOne({ userId: user.id });
    const ownsAppointment =
      patient && appointment.patientId.toString() === patient._id.toString();

    if (!ownsAppointment) {
      throw new AppError("Appointment not found.", 404);
    }

    // Hasta sadece randevusunu iptal edebilir (başka hiçbir alanı değiştiremez)
    if (fields.length !== 1 || body.status !== "cancelled") {
      throw new AppError(
        "Patients can only cancel their own appointments.",
        403,
      );
    }
  }

  // Eğer kullanıcı Doktor ise
  if (user.role === "doctor") {
    const doctor = await Doctor.findOne({ userId: user.id });
    const ownsAppointment =
      doctor && appointment.doctorId.toString() === doctor._id.toString();

    if (!ownsAppointment) {
      throw new AppError("Appointment not found.", 404);
    }

    // Doktor sadece randevu durumunu (status) güncelleyebilir
    if (fields.length !== 1 || !fields.includes("status")) {
      throw new AppError("Doctors can only update appointment status.", 403);
    }
  }

  // Admin her şeyi yapabilir, ek kısıtlamaya gerek yok.
};

export { enforceRolePermissions };
