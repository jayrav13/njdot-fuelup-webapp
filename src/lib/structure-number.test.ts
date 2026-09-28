import { describe, expect, it } from "vitest";
import { structureNumberKey } from "./structure-number";

describe("structureNumberKey", () => {
  it("drops leading zeros so padded and unpadded numbers match", () => {
    expect(structureNumberKey("0902153")).toBe("902153");
    expect(structureNumberKey("902153")).toBe("902153");
  });

  it("uppercases and strips separators", () => {
    expect(structureNumberKey(" 043e007 ")).toBe("43E007");
    expect(structureNumberKey("01-bv-003")).toBe("1BV003");
  });

  it("keeps a lone zero", () => {
    expect(structureNumberKey("000")).toBe("0");
  });

  it("returns empty for input with no alphanumerics", () => {
    expect(structureNumberKey("--")).toBe("");
    expect(structureNumberKey("")).toBe("");
  });
});
