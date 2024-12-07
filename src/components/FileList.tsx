import { FileStructure } from '@/types';

interface FileListProps {
  files: FileStructure[];
  selectedIndex: number;
  onFileSelect: (index: number) => void;
  onFileDelete: (index: number) => void;
}

export function FileList({ files, selectedIndex, onFileSelect, onFileDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        No files uploaded yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {files.map((file, index) => (
        <div
          key={`${file.fileName}-${index}`}
          className={`
            relative group
            ${selectedIndex === index ? 'bg-indigo-50' : 'hover:bg-slate-50'}
          `}
        >
          <button
            onClick={() => onFileSelect(index)}
            className={`
              w-full px-4 py-3 text-left flex items-center gap-3
              ${selectedIndex === index ? 'text-indigo-700' : 'text-slate-700'}
            `}
          >
            <div className="flex-shrink-0">
              <svg
                className={`w-5 h-5 ${selectedIndex === index ? 'text-indigo-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {file.fileName}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {file.sheets.length} sheet{file.sheets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </button>
          <button
            onClick={() => onFileDelete(index)}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              p-1.5 rounded-full
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
              hover:bg-slate-200
              ${selectedIndex === index ? 'text-indigo-600' : 'text-slate-500'}
            `}
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
