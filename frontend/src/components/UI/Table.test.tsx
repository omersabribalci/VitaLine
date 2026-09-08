import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Table from "./Table";

type TestRow = { _id: string; name: string };

describe("Table", () => {
  it("renders records and sends the selected page to its parent", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    const rows: TestRow[] = [
      { _id: "1", name: "Ada" },
      { _id: "2", name: "Grace" },
    ];

    render(
      <Table
        list={rows}
        columns={[{ label: "Name", render: (row) => row.name }]}
        pagination={{ page: 1, limit: 10, totalItems: 12, totalPages: 2 }}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeVisible();
    expect(screen.getByText("Ada")).toBeVisible();
    expect(screen.getByText("Showing 1–10 of 12")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
