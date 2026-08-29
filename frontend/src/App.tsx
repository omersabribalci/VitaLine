import { RouterProvider } from "react-router";
import "./App.css";
import router from "./routes/AppRouter";
import { Bounce, ToastContainer } from "react-toastify";
import { Fragment } from "react";
import { useAuthCheck } from "./hooks/useAuthCheck";
import { useAppSelector } from "./store/hooks";
import Loading from "./components/UI/Loading";

function App() {
  useAuthCheck();

  const authStatus = useAppSelector((state) => state.auth.authStatus);

  if (authStatus === "idle") {
    return <Loading />;
  }

  return (
    <Fragment>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </Fragment>
  );
}

export default App;
