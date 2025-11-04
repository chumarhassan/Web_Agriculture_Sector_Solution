const Table = ({ headers, data, renderRow, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-surface border-b border-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data && data.length > 0 ? (
            data.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td 
                colSpan={headers.length} 
                className="px-6 py-8 text-center text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
