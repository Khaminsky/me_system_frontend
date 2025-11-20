// src/components/analytics/PivotTable.tsx

interface PivotTableProps {
  data: {
    rows: string[];
    columns: string[];
    data: Record<string, any>;
  };
  options: any;
}

export default function PivotTable({ data, options }: PivotTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {/* Empty corner cell */}
            </th>
            {data.columns.map((col) => (
              <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row) => (
            <tr key={row}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {row}
              </td>
              {data.columns.map((col) => {
                const key = `${row}_${col}`;
                const cellData = data.data[key];
                return (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cellData?.sum || 0}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}