const readFile = require("../utils/readFile");
const writeFile = require("../utils/writeFile");

const getAppointments = (req, res) => {
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

  if (appointments.length === 0) {
    return res
      .status(404)
      .json({ message: "Appointment does not exist with this ID." });
  }

  return res.json(appointments);
};

const getAppointmentById = (req, res) => {
  const data = readFile();
  const appointments = data.appointments;
  const id = req.params.id;
  const appointment = appointments.find((app) => app.id === id);

  if (!appointment) {
    return res
      .status(404)
      .json({ message: `Appointment does not exist with this ID ${id}` });
  }

  return res.json(appointment);
};

const createAppointment = (req, res) => {
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
