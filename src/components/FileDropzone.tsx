import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => Promise<void>;
  isProcessing: boolean;
  compact?: boolean;
}

export function FileDropzone({ onFileSelect, isProcessing, compact = false }: FileDropzoneProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      await onFileSelect(acceptedFiles);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    disabled: isProcessing,
    multiple: true
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-3 text-center cursor-pointer
          transition-colors duration-200 ease-in-out text-sm
          ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-slate-600">
          {isDragActive ? (
            <p>Drop files here...</p>
          ) : (
            <p>
              {isProcessing ? 'Processing...' : 'Drop files or click to upload'}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <svg
            className={`h-12 w-12 ${isDragActive ? 'text-indigo-500' : 'text-slate-400'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 8v24m0-24L16 16m8-8l8 8m-8 24a16 16 0 110-32 16 16 0 010 32z"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">
            {isDragActive ? 'Drop your Excel files here' : 'Upload Excel Files'}
          </p>
          {!isProcessing && (
            <p className="mt-1 text-sm text-slate-500">
              Drag and drop your files or click to browse
            </p>
          )}
          {isProcessing && (
            <p className="mt-1 text-sm text-slate-500">
              Processing files, please wait...
            </p>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-center justify-center space-x-2">
          <span className="px-2 py-1 bg-slate-100 rounded">XLSX</span>
          <span className="px-2 py-1 bg-slate-100 rounded">XLS</span>
        </div>
      </div>
    </div>
  );
}
