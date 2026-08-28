import { describe, it, expect } from "vitest";
import { collectStatusChanges, formatStatusLabel } from "@/lib/utils/status-log";

describe("collectStatusChanges", () => {
  it("logs initial payment and send status on create", () => {
    const changes = collectStatusChanges(
      { payment_status: "due", send_status: "pending" },
      { payment_status: "due", send_status: "pending" },
      true
    );

    expect(changes).toHaveLength(2);
    expect(changes[0]).toEqual({
      statusType: "payment",
      oldStatus: null,
      newStatus: "due",
    });
    expect(changes[1]).toEqual({
      statusType: "send",
      oldStatus: null,
      newStatus: "pending",
    });
  });

  it("logs only changed statuses on update", () => {
    const changes = collectStatusChanges(
      { payment_status: "due", send_status: "pending" },
      { payment_status: "paid", send_status: "pending" }
    );

    expect(changes).toEqual([
      {
        statusType: "payment",
        oldStatus: "due",
        newStatus: "paid",
      },
    ]);
  });

  it("logs both statuses when both change", () => {
    const changes = collectStatusChanges(
      { payment_status: "due", send_status: "pending" },
      { payment_status: "partial", send_status: "done" }
    );

    expect(changes).toHaveLength(2);
  });
});

describe("formatStatusLabel", () => {
  it("formats payment and send labels", () => {
    expect(formatStatusLabel("payment", "paid")).toBe("Paid");
    expect(formatStatusLabel("send", "pending")).toBe("Pending");
  });
});
