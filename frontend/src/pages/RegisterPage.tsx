import { useForm } from "react-hook-form";
import FormInput from "../components/Form/FormInput";
import { getRegisterInputs } from "../data/Inputs/registerInputs";
import { Link, useNavigate } from "react-router";
import Button from "@mui/material/Button";
import { useSignupMutation } from "../store/services/authApi";
import bgImage from "../assets/register-bg.jpg";
import { toast } from "react-toastify";
import type { ApiError, RegisterFormData } from "../types";

const RegisterPage = () => {
  const [signup, { isLoading: isSigningIn, error }] = useSignupMutation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({ mode: "onChange" });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signup(data).unwrap();
      toast.success("Account created successfully 🎉");
      reset();
      navigate("/login");
    } catch (err) {
      const error = err as ApiError;
      console.error("Login error:", error.data.message);
    }
  };

  const registerInputs = getRegisterInputs(watch);

  let errMsg = "";

  if (error) {
    if ("status" in error) {
      // FetchBaseQueryError
      errMsg =
        (error.data as { message?: string })?.message || "Register failed";
    } else {
      // SerializedError
      errMsg = error.message || "Unexpected error";
    }
  }

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-row"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-linear-to-b from-gray-300/10 to-gray-400/10 rounded-xl shadow-lg flex flex-col justify-center w-full max-w-sm min-w-3xs p-8 mx-auto items-center">
          <h1 className="text-2xl font-semibold mb-6 text-myBlack text-center">
            Register as a Patient
          </h1>

          <form
            className="flex flex-col w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            {registerInputs.map((input) => (
              <FormInput
                key={input.name}
                {...input}
                register={register}
                errors={errors}
              />
            ))}
            {error && <div className="text-red-500 mb-4 text-xs">{errMsg}</div>}
            <Button
              sx={{
                borderRadius: "0.5rem",
                padding: "0.6em",
                backgroundColor: "var(--color-primary)",
                "&:hover": { bgcolor: "var(--color-primary-hover)" },
                "&.Mui-disabled": {
                  backgroundColor: "var(--color-primary)",
                },
              }}
              variant="contained"
              color="success"
              type="submit"
              loading={isSigningIn}
            >
              Sign Up
            </Button>
          </form>

          <div className="flex flex-row w-full justify-center gap-8 mt-6 text-sm">
            <span className="text-white/60">Have an account?</span>
            <Link
              className="text-white/60 font-semibold hover:underline cursor-pointer"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
