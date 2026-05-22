import { describe, expect, it } from "vitest";
import { parseErrorDetail } from "@/lib/api";

describe("parseErrorDetail", () => {
  it("returns fallback when body is missing", () => {
    expect(parseErrorDetail(undefined, "Something went wrong")).toBe(
      "Something went wrong"
    );
  });

  it("returns string detail as-is", () => {
    expect(parseErrorDetail({ detail: "Invalid digest" }, "fallback")).toBe(
      "Invalid digest"
    );
  });

  it("joins validation messages and strips Value error prefix", () => {
    expect(
      parseErrorDetail(
        {
          detail: [
            { msg: "Value error, Name is required" },
            { msg: "Sequence is required" },
          ],
        },
        "fallback"
      )
    ).toBe(" Name is required; Sequence is required");
  });

  it("returns empty string when detail is an empty array", () => {
    expect(parseErrorDetail({ detail: [] }, "fallback")).toBe("");
  });
});
