import { useState } from "react";
import { useNavigate } from "react-router";
import TablePagination from "@mui/material/TablePagination";
import type { TableProps } from "../../types";

const Table = <T extends { _id: string | number }>({
  list = [],
  heads,
  entityType,
  detailPath = "/admin",
}: TableProps<T>) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedList = [...list].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const keyStr = String(sortConfig.key);
    const valA = (a as Record<string, unknown>)[keyStr];
    const valB = (b as Record<string, unknown>)[keyStr];

    if (
      (typeof valA === "string" || typeof valA === "number") &&
      (typeof valB === "string" || typeof valB === "number")
    ) {
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const paginatedList = sortedList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString(
      "tr-TR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  };

  return (
    <div className="overflow-x-auto w-full rounded-lg shadow-lg border border-gray-600 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-600">
        <thead className="bg-gray-700">
          <tr>
            {heads.map((head, index) => (
              <th
                key={index}
                scope="col"
                onClick={() => handleSort(head.key)}
                className="text-left text-sm font-semibold text-white px-4 py-3 cursor-pointer hover:text-gray-300 transition-colors"
              >
                {head.label}
                {sortConfig.key === head.key &&
                  (sortConfig.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-600">
          {paginatedList.map((item, rowIndex) => (
            <tr
              onClick={() => {
                navigate(`${detailPath}/${entityType}/${item._id}`);
              }}
              key={String((item as Record<string, unknown>)._id)}
              className={`cursor-pointer transition-colors hover:bg-gray-600 ${
                rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-700/40"
              }`}
            >
              {heads.map((head, colIndex) => {
                const keyStr = String(head.key);
                const cellData = (item as Record<string, unknown>)[keyStr];

                let cellValue: React.ReactNode;
                if (keyStr === "dateAndTime" && typeof cellData === "string") {
                  cellValue = formatDateTime(cellData);
                } else {
                  cellValue = cellData as React.ReactNode;
                }

                return (
                  <td
                    key={colIndex}
                    className="text-sm text-gray-200 px-4 py-3 whitespace-nowrap"
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <TablePagination
        sx={{ color: "white" }}
        component="div"
        count={list.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 9, 20]}
        labelRowsPerPage="Records per page:"
        labelDisplayedRows={({ from, to, count }) =>
          `Showing ${from}-${to} of ${count} records`
        }
      />
    </div>
  );
};

export default Table;
