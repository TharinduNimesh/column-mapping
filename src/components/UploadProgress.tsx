import { UploadProgress as UploadProgressType } from '@/types';

interface UploadProgressProps {
  progress: UploadProgressType;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">
          {progress.status === 'uploading' && 'Uploading'}
          {progress.status === 'processing' && 'Processing'}
          {progress.status === 'complete' && 'Completed'}
          {progress.status === 'error' && 'Error'}
          : {progress.currentFile}
        </span>
        <span className="text-sm font-medium text-slate-700">{progress.progress}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${
            progress.status === 'error' 
              ? 'bg-red-600' 
              : progress.status === 'complete'
                ? 'bg-green-600'
                : 'bg-indigo-600'
          }`}
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
}
