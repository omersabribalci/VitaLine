import Pagination from "@mui/material/Pagination";
import type { PaginationMeta } from "../../types";

type PaginationControlsProps = {
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  standalone?: boolean;
};

const PaginationControls = ({
  pagination,
  onPageChange,
  standalone = false,
}: PaginationControlsProps) => {
  if (!pagination || pagination.totalItems === 0) return null;

  const firstItem = (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  );

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 bg-slate-200/80 px-4 py-3 sm:flex-row ${
        standalone
          ? "rounded-xl border border-slate-300 shadow-sm"
          : "border-t border-slate-300"
      }`}
    >
      <p className="text-sm font-medium text-slate-600">
        Showing {firstItem}–{lastItem} of {pagination.totalItems}
      </p>
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          count={pagination.totalPages}
          onChange={(_, page) => onPageChange?.(page)}
          color="primary"
          shape="rounded"
          size="small"
          siblingCount={0}
        />
      )}
    </div>
  );
};

export default PaginationControls;
