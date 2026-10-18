interface Props {
  caption: string;
  columns: string[];
  rows: Array<{ key: string; cells: Array<string | number> }>;
}

/**
 * Visually hidden twin of a chart, so every plotted value stays reachable without
 * hovering. Tooltips enhance a chart; they must never be the only way to read it.
 */
export default function ChartDataTable({ caption, columns, rows }: Props) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            {row.cells.map((cell, index) => {
              const cellKey = `${row.key}-${index}`;
              return index === 0 ? (
                <th key={cellKey} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={cellKey}>{cell}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
