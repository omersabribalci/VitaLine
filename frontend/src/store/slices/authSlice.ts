import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User, LoginData } from "../../types";

const userFromStorage: User | null = JSON.parse(
  localStorage.getItem("user") || "null",
);

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: userFromStorage,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginData>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload.user;

      if (action.payload.user) {
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },

    // F5 atıldıktan sonra arka planda token yenilenirse state'e basmak için ???
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },

    logOut: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.isInitialized = true;

      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, setToken, logOut } = authSlice.actions;
export default authSlice.reducer;
