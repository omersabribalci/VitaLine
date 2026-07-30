import type { UseFormWatch } from "react-hook-form";
import type { RegisterFormData } from "../../types";

export const getRegisterInputs = (watch: UseFormWatch<RegisterFormData>) => [
  {
    type: "text",
    placeholder: "Full Name",
    name: "name",
    rules: {
      required: "Name is required.",
      minLength: {
        value: 3,
        message: "Name must be at least 2 characters",
      },
      maxLength: {
        value: 30,
        message: "Name must be max 30 characters",
      },
    },
  },
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
    type: "text",
    placeholder: "Phone Number",
    name: "phone",
    rules: {
      required: "Phone Number is required",
    },
  },
  {
    type: "password",
    placeholder: "Password",
    name: "password",
    rules: {
      required: "Password is required!",
      validate: (value: string) => {
        const trimmedValue = value.trim();
        if (trimmedValue.length < 8) {
          return "Password must be at least 8 characters";
        }
        const strongRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;
        return (
          strongRegex.test(trimmedValue) ||
          "Password must contain upper, lower, and number"
        );
      },
    },
  },
  {
    type: "password",
    placeholder: "Confirm password",
    name: "confirmPassword",
    rules: {
      required: "Please confirm password!",
      validate: (value: string) =>
        value.trim() === watch("password")?.trim() || "Passwords do not match",
    },
  },
];
