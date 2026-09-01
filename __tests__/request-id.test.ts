import { describe, it, expect } from "vitest";
import {
  REQUEST_ID_EXAMPLE,
  REQUEST_ID_LENGTH,
  isValidRequestId,
} from "@/lib/utils/request-id";

describe("request-id utils", () => {
  it("validates 1-20 digit request IDs", () => {
    expect(isValidRequestId("1")).toBe(true);
    expect(isValidRequestId("12345")).toBe(true);
    expect(isValidRequestId("12345678901234567890")).toBe(true);
    expect(isValidRequestId("")).toBe(false);
    expect(isValidRequestId("000001")).toBe(true);
    expect(isValidRequestId("0000000000000000000a")).toBe(false);
    expect(isValidRequestId("123456789012345678901")).toBe(false);
  });

  it("uses a short numeric example", () => {
    expect(REQUEST_ID_EXAMPLE).toMatch(/^\d+$/);
    expect(REQUEST_ID_EXAMPLE.length).toBeLessThanOrEqual(REQUEST_ID_LENGTH);
  });
});
