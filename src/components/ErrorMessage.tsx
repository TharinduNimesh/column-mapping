import { ErrorMessage as ErrorMessageType } from '@/types';

interface ErrorMessageProps {
  error: ErrorMessageType;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error.show) return null;

  return (
    <div className={`mb-4 p-4 rounded-lg ${
      error.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
    }`}>
      <p>{error.message}</p>
    </div>
  );
}
