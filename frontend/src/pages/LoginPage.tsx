import { useForm } from "react-hook-form";
import FormInput from "../components/Form/FormInput";
import { Link, Navigate, useNavigate } from "react-router";
import { loginInputs } from "../data/Inputs/loginInputs";
import Button from "@mui/material/Button";
import { useLoginMutation } from "../store/services/authApi";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import "./LoginPage.css";
import { toast } from "react-toastify";
import type { RootState } from "../store/store";
import type { ApiError, LoginFormData } from "../types";

const LoginPage = () => {
  const [login, { isLoading: isLoggingIn, error }] = useLoginMutation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials(res));
      toast.success(`Welcome, ${res.user.name}`);
      reset();

      if (res.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (res.user.role === "doctor") {
        navigate("/doctor", { replace: true });
      } else if (res.user.role === "patient") {
        navigate("/patient", { replace: true });
      }
    } catch (err) {
      const error = err as ApiError;
      console.error("Login error:", error.data.message);
    }
  };

  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "doctor") return <Navigate to="/doctor" replace />;
    if (user?.role === "patient") return <Navigate to="/patient" replace />;
  }

  let errMsg = "";

  if (error) {
    if ("status" in error) {
      // FetchBaseQueryError
      errMsg = (error.data as { message?: string })?.message || "Login failed";
    } else {
      // SerializedError
      errMsg = error.message || "Unexpected error";
    }
  }

  return (
    <div className="h-screen flex flex-row w-full ">
      <div className="flex-1 flex flex-col justify-center w-full items-center bg-black p-6">
        <form
          className="flex flex-col gap-2 w-full shadow-lg max-w-md min-w-3xs mx-auto rounded-xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-4xl font-semibold mb-6 text-white">Welcome</h1>
          {loginInputs.map((input) => (
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
            loading={isLoggingIn}
          >
            Log In
          </Button>
          <div className="flex flex-row w-full justify-between gap-2 mt-6 text-sm">
            <span className="text-white/70 hover:underline cursor-pointer">
              Forgot Password?
            </span>
            <Link
              className="text-primary font-medium hover:underline cursor-pointer"
              to="/register"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
      <div className="login-right flex-1 w-full h-full hidden lg:flex relative items-center justify-center">
        <div className="absolute z-10 flex flex-col items-center justify-center px-12">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 p-10 rounded-4xl max-w-lg text-center shadow-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold tracking-wider mb-5">
              Vita Line Portal
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Health, Digitized
            </h2>
            <p className="text-base text-gray-200 mb-8 font-light leading-relaxed">
              Skip the waiting room. Access your appointments, medical records,
              and connect with top specialists all in one secure platform.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm backdrop-blur-sm">
                24/7 Access
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm backdrop-blur-sm">
                Live Scheduling
              </span>
              <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm backdrop-blur-sm">
                Expert Care
              </span>
            </div>
          </div>
        </div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
};

export default LoginPage;
