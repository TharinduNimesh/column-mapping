import { FileStructure } from '@/types';

interface FilePreviewProps {
  file: FileStructure;
}

export function FilePreview({ file }: FilePreviewProps) {
  const activeSheet = file.sheets.find(sheet => sheet.name === file.activeSheet);

  if (!activeSheet) return null;

  return (
    <div className="w-full overflow-hidden">
      <div className="space-y-6">
        {/* Column Structure */}
        <div>
          <h2 className="px-6 pt-6 text-base font-medium text-slate-900">Column Structure</h2>
          <div className="mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr className="bg-slate-50">
                        <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Column Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Sample Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {activeSheet.columns.map((column, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="py-4 pl-6 pr-3 text-sm font-medium text-slate-900 whitespace-normal break-words">
                            {column.name}
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-500 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                              {column.type}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-500 whitespace-normal break-words max-w-xs">
                            {column.sample}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        {activeSheet.preview.length > 0 && (
          <div>
            <h2 className="px-6 text-base font-medium text-slate-900">Data Preview</h2>
            <div className="mt-4 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead>
                        <tr className="bg-slate-50">
                          {activeSheet.columns.map((column, index) => (
                            <th
                              key={index}
                              scope="col"
                              className="py-3.5 pl-6 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-normal break-words"
                              style={{ minWidth: '150px', maxWidth: '300px' }}
                            >
                              {column.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {activeSheet.preview.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-slate-50">
                            {activeSheet.columns.map((_, colIndex) => (
                              <td
                                key={colIndex}
                                className="py-4 pl-6 pr-3 text-sm text-slate-500 whitespace-normal break-words"
                                style={{ minWidth: '150px', maxWidth: '300px' }}
                              >
                                {row[colIndex]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
