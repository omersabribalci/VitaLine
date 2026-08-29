type ErrorWithMessage = {
  data?: { message?: unknown };
  message?: unknown;
};

export const extractErrorMessage = (
  error: unknown,
  fallback = "Unexpected error",
) => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const { data, message } = error as ErrorWithMessage;

  if (data && typeof data.message === "string") {
    return data.message;
  }

  return typeof message === "string" ? message : fallback;
};
