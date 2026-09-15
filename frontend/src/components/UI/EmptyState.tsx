import type { ReactNode } from "react";

type EmptyStateProps = {
  message: string;
  children?: ReactNode;
};

const EmptyState = ({ message, children }: EmptyStateProps) => {
  return (
    <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/20 bg-cardBg p-6 shadow-md">
      <p className="text-base text-slate-900">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
