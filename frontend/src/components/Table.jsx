const Table = ({ headers, data, renderRow, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-green-600 to-emerald-600 border-b-4 border-green-700">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-green-100">
          {data && data.length > 0 ? (
            data.map((row, index) => renderRow(row, index))
          ) : (
            <tr>
              <td 
                colSpan={headers.length} 
                className="px-6 py-8 text-center text-gray-500"
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
