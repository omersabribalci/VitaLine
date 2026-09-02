type ErrorWithMessage = {
  data?: {
    message?: unknown;
    errors?: Array<{
      message?: unknown;
      msg?: unknown;
    }>;
  };
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

  if (data?.errors?.length) {
    const firstError = data.errors[0];
    const detail = firstError.message ?? firstError.msg;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (data && typeof data.message === "string") {
    return data.message;
  }

  return typeof message === "string" ? message : fallback;
};
