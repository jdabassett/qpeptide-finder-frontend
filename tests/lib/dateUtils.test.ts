import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDigestDate } from "@/lib/dateUtils";

describe("formatDigestDate", () => {
  beforeEach(() => {
    vi.stubEnv("TZ", "UTC");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("filename format", () => {
    it("returns original string when date is invalid", () => {
      expect(formatDigestDate("not-a-date", "filename")).toBe("not-a-date");
    });

    it("formats API datetime without timezone suffix as UTC", () => {
      // API sends "2026-02-26T12:56:00" with no Z; parseAsUtcIfNeeded appends Z
      expect(formatDigestDate("2026-02-26T12:56:00", "filename")).toBe(
        "2026-02-26-12-56"
      );
    });

    it("formats explicit UTC ISO string", () => {
      expect(formatDigestDate("2026-02-26T12:56:00Z", "filename")).toBe(
        "2026-02-26-12-56"
      );
    });

    it("trims whitespace before parsing", () => {
      expect(formatDigestDate("  2026-02-26T12:56:00Z  ", "filename")).toBe(
        "2026-02-26-12-56"
      );
    });
  });

  describe("display format", () => {
    it("returns a formatted string for valid ISO input", () => {
      const result = formatDigestDate("2026-02-26T12:56:00Z", "display");
      expect(result).toBeTruthy();
      expect(result).not.toBe("2026-02-26T12:56:00Z");
    });
  });
});
