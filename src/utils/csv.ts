/** What a spreadsheet cell can hold. Objects cannot be stringified meaningfully here. */
export type CsvValue = string | number | boolean | null | undefined;

/** Escape quotes/newlines and prevent spreadsheet formula execution. */
export function csvCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${(/^[\s]*[=+@-]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
}
export function downloadCsv(name: string, rows: CsvValue[][]) {
  const blob = new Blob(['\uFEFF', rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
