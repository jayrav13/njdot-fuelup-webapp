/**
 * Parse tab-separated text as exported by Excel: records end with CR, LF or
 * CRLF (the NJDOT exports use bare CR), and fields may be wrapped in double
 * quotes, with "" as an escaped quote and line breaks allowed inside.
 * Returns one object per data row, keyed by the header row.
 */
export function parseTsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === "\t") {
      row.push(field);
      field = "";
    } else if (char === "\r" || char === "\n") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...data] = rows.filter((r) => r.some((cell) => cell !== ""));
  if (!header) return [];
  return data.map((cells, index) => {
    if (cells.length !== header.length) {
      throw new Error(`Row ${index + 2} has ${cells.length} fields, expected ${header.length}`);
    }
    return Object.fromEntries(header.map((name, i) => [name, cells[i]]));
  });
}
