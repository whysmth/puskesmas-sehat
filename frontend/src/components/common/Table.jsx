import Button from './Button';

const Table = ({
  headers = [],
  data = [],
  isLoading = false,
  emptyMessage = 'Tidak ada data ditemukan.',
  renderRow,
  pagination = null, // object: { currentPage, lastPage, onPageChange }
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
      {/* Table Area */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-semibold text-slate-500">Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-sm font-medium text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => renderRow(item, idx))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.lastPage > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-semibold text-slate-800">{pagination.currentPage}</span> dari <span className="font-semibold text-slate-800">{pagination.lastPage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
