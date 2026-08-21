import type { TableProps } from "../../types";

const Table = <T extends { _id: string | number }>({
  list = [],
  columns,
  onRowClick,
  emptyMessage = "No records found.",
}: TableProps<T>) => {
  return (
    <div className="overflow-x-auto w-full rounded-lg shadow-lg border border-gray-600 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-600">
        <thead className="bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className="text-left text-sm font-semibold text-white px-4 py-3"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-600">
          {list.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-400"
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
                  onRowClick ? "cursor-pointer hover:bg-gray-600" : ""
                } ${rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-700/40"}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.label}
                    className="text-sm text-gray-200 px-4 py-3 whitespace-nowrap"
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
  );
};

export default Table;
