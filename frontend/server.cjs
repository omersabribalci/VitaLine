const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "database.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// server.use((req, res, next) => {
//   setTimeout(() => {
//     next();
//   }, 1000);
// });

// LOGIN
// LOGIN
server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  const user = db.get("users").find({ email, password }).value();

  if (user) {
    // Eğer hasta ise ve accountStatus disabled ise login engelle
    if (user.role === "patient" && user.accountStatus === "disabled") {
      return res.status(403).json({
        message:
          "This patient account has been disabled. Please contact support.",
      });
    }

    const { password: _pw, ...userWithoutPassword } = user;
    res.status(200).json({
      token: `fake-jwt-token-for-${user.role}-${user.id}`,
      user: userWithoutPassword,
    });
  } else {
    res.status(401).json({
      message: "The e-mail address and/or password are not correct.",
    });
  }
});

// REGISTER (Hasta ekleme)
server.post("/register", (req, res) => {
  const { email, password, name, phone } = req.body;
  const db = router.db;

  const existingUser = db.get("users").find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  // Users tablosuna ekle (id otomatik verilecek)
  const createdUser = db
    .get("users")
    .insert({ name, email, password, role: "patient" })
    .write();

  // Patients tablosuna aynı id ile ekle
  db.get("patients").insert({ id: createdUser.id, name, email, phone }).write();

  const { password: _pw, ...userWithoutPassword } = createdUser;
  res.status(201).json({
    token: `fake-jwt-token-for-patient-${createdUser.id}`,
    user: userWithoutPassword,
  });
});

// UPDATE PATIENT (accountStatus gibi alanları güncelle)
server.patch("/updatePatient/:id", (req, res) => {
  const { id } = req.params;
  const db = router.db;

  const patient = db.get("patients").find({ id }).value();
  const user = db.get("users").find({ id }).value();

  if (!patient || !user) {
    return res.status(404).json({ message: "Patient not found." });
  }

  // Güncelleme yapılacak alanları al
  const updateData = req.body;

  // patients tablosunu güncelle
  db.get("patients").find({ id }).assign(updateData).write();

  // users tablosunu da güncelle (örneğin accountStatus burada da tutulabilir)
  if (updateData.accountStatus) {
    db.get("users")
      .find({ id })
      .assign({ accountStatus: updateData.accountStatus })
      .write();
  }

  const updatedPatient = db.get("patients").find({ id }).value();
  res.status(200).json(updatedPatient);
});

// ADD DOCTOR (Admin ekler → users + doctors)
server.post("/addDoctor", (req, res) => {
  const {
    email,
    password,
    title,
    name,
    speciality,
    phone,
    image,
    availability,
  } = req.body;
  const db = router.db;

  const existingUser = db.get("users").find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }

  // Users tablosuna ekle
  const createdUser = db
    .get("users")
    .insert({ name, email, password, role: "doctor" })
    .write();

  // Doctors tablosuna aynı id ile ekle (password hariç!)
  const newDoctor = {
    id: createdUser.id,
    title,
    name,
    speciality,
    email,
    phone,
    image,
    availability,
  };
  db.get("doctors").insert(newDoctor).write();

  const { password: _pw, ...userWithoutPassword } = createdUser;
  res.status(201).json({
    token: `fake-jwt-token-for-doctor-${createdUser.id}`,
    user: userWithoutPassword,
    doctor: newDoctor,
  });
});

// UPDATE DOCTOR (Hem doctors hem users güncellenir, password sadece users'a gider)
server.patch("/updateDoctor/:id", (req, res) => {
  const { id } = req.params;
  const db = router.db;

  const doctor = db.get("doctors").find({ id }).value();
  const user = db.get("users").find({ id }).value();

  if (!doctor || !user) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  // doctors tablosunu güncelle (password hariç)
  const { password, ...doctorData } = req.body;
  db.get("doctors").find({ id }).assign(doctorData).write();

  // users tablosunu güncelle (password sadece burada)
  const userUpdate = {};
  if (req.body.name) userUpdate.name = req.body.name;
  if (req.body.email) userUpdate.email = req.body.email;
  if (password) userUpdate.password = password;
  db.get("users").find({ id }).assign(userUpdate).write();

  res.status(200).json({ message: "Doctor updated successfully." });
});

// DELETE DOCTOR (Hem doctors hem users'dan sil)
server.delete("/deleteDoctor/:id", (req, res) => {
  const { id } = req.params;
  const db = router.db;

  const doctor = db.get("doctors").find({ id }).value();
  const user = db.get("users").find({ id }).value();

  if (!doctor || !user) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  db.get("doctors").remove({ id }).write();
  db.get("users").remove({ id }).write();

  res.status(200).json({ message: "Doctor deleted successfully." });
});

// NEW APPOINTMENT
server.post("/newAppointment", (req, res) => {
  const {
    speciality,
    doctorId,
    doctorName,
    patientId,
    patientName,
    dateAndTime,
    status,
  } = req.body;
  const db = router.db;

  // Validasyon
  if (!doctorId || !patientId || !dateAndTime) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Benzersiz id üret
  const newAppointment = {
    id: `app_${Date.now()}`,
    doctorId,
    doctorName,
    patientId,
    patientName,
    speciality,
    dateAndTime,
    status,
  };

  // DB'ye ekle
  db.get("appointments").push(newAppointment).write();

  // Response
  res.status(201).json(newAppointment);
});

// UPDATE APPOINTMENT
server.patch("/updateAppointment/:id", (req, res) => {
  const { id } = req.params;
  const db = router.db;

  const appointment = db.get("appointments").find({ id }).value();
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found." });
  }

  // Güncelleme yapılacak alanları al
  const updateData = req.body;

  // Eğer randevu tarihi geçmişse status'u completed yap
  const now = new Date();
  const appointmentDate = new Date(appointment.dateAndTime);
  if (appointmentDate < now) {
    updateData.status = "completed";
  }

  db.get("appointments").find({ id }).assign(updateData).write();
  const updatedAppointment = db.get("appointments").find({ id }).value();

  res.status(200).json(updatedAppointment);
});

server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`📡 API adresi: http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📝 Register: http://localhost:${PORT}/register`);
});
