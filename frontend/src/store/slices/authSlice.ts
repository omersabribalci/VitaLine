import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User, LoginData } from "../../types";

const userFromStorage: User | null = JSON.parse(
  localStorage.getItem("user") || "null",
);

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: userFromStorage,
  authStatus: "idle",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginData>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.authStatus = "authenticated";
      state.user = action.payload.user;

      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    // Sayfa yenilendiğinde, refresh başarılı olursa çağrılır.
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.authStatus = "authenticated";
    },

    // Refresh başarısız olursa (cookie yok/geçersiz) çağrılır.
    // logouttan farkı kavramsal => "hiç giriş yapılmamış olduğu anlaşıldı"
    setUnauthenticated: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.authStatus = "unauthenticated";
      state.user = null;
      localStorage.removeItem("user");
    },

    logOut: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.authStatus = "unauthenticated";
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, setToken, setUnauthenticated, logOut } =
  authSlice.actions;
export default authSlice.reducer;
