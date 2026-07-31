const readFile = require("../utils/readFile");
const writeFile = require("../utils/writeFile");

const getAllAppointments = (req, res) => {
  const data = readFile();
  const appointments = data.appointments;

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
      .json({ message: `Appoinment does not exist with this ID ${id}` });
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

module.exports = { getAllAppointments, getAppointmentById, createAppointment };
