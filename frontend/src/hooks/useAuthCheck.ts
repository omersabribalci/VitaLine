import { useEffect, useRef } from "react";
import { useAppDispatch } from "../store/hooks";
import { useRefreshMutation } from "../store/services/authApi";
import { setCredentials, setUnauthenticated } from "../store/slices/authSlice";

export const useAuthCheck = () => {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Aynı kontrolü iki kere çalıştırmayı engelle
    if (hasChecked.current) return;
    hasChecked.current = true;

    refresh()
      .unwrap()
      .then((data) => {
        dispatch(setCredentials(data));
      })
      .catch(() => {
        dispatch(setUnauthenticated());
      });
  }, [refresh, dispatch]);
};
