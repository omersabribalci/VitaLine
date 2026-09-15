import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("uses the shared blue card and renders an optional action", () => {
    const { container } = render(
      <EmptyState message="No records found.">
        <button type="button">Add record</button>
      </EmptyState>,
    );

    expect(container.firstChild).toHaveClass("bg-cardBg");
    expect(screen.getByText("No records found.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add record" })).toBeVisible();
  });
});
