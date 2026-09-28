/**
 * Search key for a bridge structure number: uppercase, alphanumerics only,
 * leading zeros dropped. Official numbers are zero-padded to 7 characters
 * ("0902153"), but people often type them without the padding ("902153") or
 * in lowercase ("043e007"), and all of those should find the same bridge.
 */
export function structureNumberKey(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const stripped = cleaned.replace(/^0+/, "");
  return stripped === "" && cleaned !== "" ? "0" : stripped;
}
