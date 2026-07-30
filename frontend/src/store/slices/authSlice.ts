import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CredentialsPayload, User } from "../../types";

const userFromStorage: User | null = JSON.parse(
  localStorage.getItem("user") || "null",
);

const initialState: User = {
  token: userFromStorage?.token || null,
  isAuthenticated: !!userFromStorage?.token,
  role: userFromStorage?.role || null,
  id: userFromStorage?.id || null,
  name: userFromStorage?.name || null,
  image: userFromStorage?.image || null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.id = action.payload.user.id;
      state.name = action.payload.user.name;
      state.isAuthenticated = true;
      state.image = action.payload.user.image;

      const user = {
        token: state.token,
        role: state.role,
        id: state.id,
        name: state.name,
        image: state.image,
        isAuthenticated: state.isAuthenticated,
      };

      localStorage.setItem("user", JSON.stringify(user));
    },
    logOut: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;
      state.id = null;
      state.name = null;
      state.image = null;

      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;
