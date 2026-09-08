import type { TableProps } from "../../types";
import PaginationControls from "./PaginationControls";

const Table = <T extends { _id: string | number }>({
  list = [],
  columns,
  onRowClick,
  emptyMessage = "No records found.",
  pagination,
  onPageChange,
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-200/90">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className="border-b border-r border-slate-300 px-4 py-2 text-left text-xs font-semibold text-slate-700 last:border-r-0"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="bg-slate-50 px-4 py-10 text-center text-sm font-medium text-slate-600"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              list.map((item, rowIndex) => (
                <tr
                  key={item._id}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? "cursor-pointer hover:bg-sky-100/80 focus-within:bg-sky-100/80"
                      : ""
                  } ${rowIndex % 2 === 0 ? "bg-slate-50" : "bg-slate-100/90"}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.label}
                      className="whitespace-nowrap border-b border-r border-slate-300 px-4 py-3 text-sm font-normal text-slate-700 last:border-r-0"
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default Table;
