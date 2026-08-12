import { RouterProvider } from "react-router";
import "./App.css";
import router from "./routes/AppRouter";
import { Bounce, ToastContainer } from "react-toastify";
import { Fragment, useEffect } from "react";
import { useRefreshMutation } from "./store/services/authApi";
import { useDispatch, useSelector } from "react-redux";
import { logOut, setToken } from "./store/slices/authSlice";
import type { RootState } from "./store/store";

function App() {
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshMutation();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Eğer localStorage'da user varsa (yani daha önce login olmuşsa)
    if (user && !token) {
      refreshToken()
        .unwrap()
        .then((data) => {
          // Başarılı olursa yeni access token'ı Redux state'ine bas
          dispatch(setToken(data.token));
        })
        .catch(() => {
          // Eğer refresh token süresi dolduysa veya geçersizse oturumu tamamen düşür
          dispatch(logOut());
        });
    }
  }, [refreshToken, dispatch, user, token]);
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
