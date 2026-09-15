const USER_ROLES = ["admin", "doctor", "patient"] as const;

const DOCTOR_TITLES = [
  "Dr.",
  "Ast. Dr.",
  "Uzm. Dr.",
  "Op. Dr.",
  "Doç. Dr.",
  "Prof. Dr.",
] as const;

module.exports = { USER_ROLES, DOCTOR_TITLES };
