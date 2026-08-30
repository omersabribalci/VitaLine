type FormErrorProps = {
  message?: string;
  className?: string;
  variant?: "light" | "dark";
};

const FormError = ({
  message,
  className = "",
  variant = "light",
}: FormErrorProps) => {
  if (!message) return null;

  const palette =
    variant === "dark"
      ? "bg-[#7f1d1d]/30 border border-[#fca5a5]/40 text-[#fecaca]"
      : "bg-[#fef3f2] border border-[#f9b7b5] text-[#b42318]";

  return (
    <p
      className={`mt-1 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium leading-4 ${palette} ${className}`}
    >
      {message}
    </p>
  );
};

export default FormError;
