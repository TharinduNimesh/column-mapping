import { FileStructure, SheetData } from '@/types';

interface SheetManagerProps {
  file: FileStructure;
  onSheetChange: (sheetName: string) => void;
  onToggleSheet: (sheetName: string) => void;
}

export function SheetManager({ file, onSheetChange, onToggleSheet }: SheetManagerProps) {
  const visibleSheets = file.sheets.filter(sheet => !sheet.isHidden);
  const hiddenSheets = file.sheets.filter(sheet => sheet.isHidden);

  const SheetCard = ({ sheet, isActive }: { sheet: SheetData; isActive: boolean }) => (
    <div
      className={`
        relative group rounded-lg border p-4
        transition-all duration-200 ease-in-out
        ${isActive 
          ? 'border-indigo-200 bg-indigo-50 shadow-sm' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>
            {sheet.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {sheet.columns.length} column{sheet.columns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="ml-4 flex items-center space-x-2">
          <button
            onClick={() => onSheetChange(sheet.name)}
            className={`
              p-1.5 rounded-lg text-sm
              transition-colors duration-200
              ${isActive 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'text-slate-500 hover:bg-slate-100'
              }
            `}
            title={isActive ? 'Current sheet' : 'Switch to this sheet'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            onClick={() => onToggleSheet(sheet.name)}
            className={`
              p-1.5 rounded-lg text-sm
              transition-colors duration-200
              ${isActive 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'text-slate-500 hover:bg-slate-100'
              }
            `}
            title={sheet.isHidden ? 'Show sheet' : 'Hide sheet'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sheet.isHidden ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Active Sheets */}
        <div>
          <h2 className="text-base font-medium text-slate-900 mb-4">Active Sheets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSheets.map((sheet) => (
              <SheetCard
                key={sheet.name}
                sheet={sheet}
                isActive={file.activeSheet === sheet.name}
              />
            ))}
          </div>
        </div>

        {/* Hidden Sheets */}
        {hiddenSheets.length > 0 && (
          <div>
            <h2 className="text-base font-medium text-slate-900 mb-4">Hidden Sheets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hiddenSheets.map((sheet) => (
                <SheetCard
                  key={sheet.name}
                  sheet={sheet}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
