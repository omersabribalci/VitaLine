const AppError = require("../utils/AppError");
const readFile = require("../utils/readFile");
const writeFile = require("../utils/writeFile");

const getAppointments = (req, res, next) => {
  const data = readFile();
  let appointments = data.appointments;

  if (req.query.doctorId) {
    appointments = appointments.filter(
      (app) => app.doctorId === req.query.doctorId,
    );
  }

  if (req.query.patientId) {
    appointments = appointments.filter(
      (app) => app.patientId === req.query.patientId,
    );
  }

  return res.json(appointments);
};

const getAppointmentById = (req, res, next) => {
  const data = readFile();
  const appointments = data.appointments;
  const id = req.params.id;
  const appointment = appointments.find((app) => app.id === id);

  if (!appointment) {
    return next(
      new AppError(`Appointment does not exist with this ID ${id}`, 404),
    );
  }

  return res.json(appointment);
};

const createAppointment = (req, res, next) => {
  // TODO validation
  const data = readFile();
  const id = `app_${Date.now()}`;
  const newAppointment = {
    id,
    ...req.body,
  };
  data.appointments.push(newAppointment);
  writeFile(data);
  res.status(201).json(newAppointment);
};

const updateAppointment = (req, res) => {
  // TODO validation
  const data = readFile();
  const appointments = data.appointments;
  const id = req.params.id;
  const appInd = appointments.findIndex((app) => app.id === id);

  data.appointments[appInd] = { ...data.appointments[appInd], ...req.body };
  writeFile(data);
  res.json(data.appointments[appInd]);
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
};
