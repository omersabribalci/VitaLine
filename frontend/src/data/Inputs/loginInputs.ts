export const loginInputs = [
  {
    type: "email",
    placeholder: "E-mail address",
    name: "email",
    rules: {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email format",
      },
    },
  },
  {
    type: "password",
    placeholder: "Password",
    name: "password",
    rules: {
      required: "Password is required!",
    },
  },
];
